'use strict'

const connect = require('connect')
const serveStatic = require('serve-static')
const Renderer = require('docsify-server-renderer')
const fs = require('fs')
const util = require('../util/index')
const chalk = require('chalk')

var defaultConfig = {
  template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Doc</title>
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/vue.css" title="vue">
</head>
<body>
  <!--inject-app-->
  <!--inject-config-->
<script src="//unpkg.com/docsify/lib/docsify.min.js"></script>
</body>
</html>`,
  path: './'
}

function loadConfig (config) {
  try {
    return require(util.cwd(config))
  } catch (e) {
    console.log(chalk.red(`Not found ${config}`))
    process.exit(1)
  }
}

module.exports = function (path, configFile, port) {
  let config = defaultConfig
  const pkg = util.pkg()

  if (configFile) {
    config = loadConfig(configFile)
  } else if (pkg.docsify) {
    config = pkg.docsify
    config.template = util.exists(util.cwd(pkg.docsify.template))
      ? util(pkg.docsify.template)
      : defaultConfig.template
  }

  var renderer = new Renderer(config)
  var server = connect()

  server.use(function(req, res) {
    renderer.renderToString(req.url)
      .then(res.end(html))
      .catch(res.end(util.read(util.resolve(path, 'index.html'))))
  })
  server.use(serveStatic(path || '.'))
  server.listen(port || 4000)

  const msg = '\n'
    + chalk.blue('[SSR]')
    + ' Serving ' + chalk.green(`${path}`) + ' now.\n'
    + 'Listening at ' + chalk.green(`http://localhost:${port}`) + '\n'

  console.log(msg)
}
