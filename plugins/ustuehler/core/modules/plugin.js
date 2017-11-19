/*\
title: $:/plugins/ustuehler/core/plugin.js
type: application/javascript
module-type: library

Makes TiddlyWiki themes and plugins in NodeJS modules available

\*/
(function() {

  var glob = require('glob')
  var path = require('path')

  var Plugin = function () {}

  var PLUGINS_PATH_LIST = [
    'plugins',
    'node_modules/**/plugins'
  ]

  var THEMES_PATH_LIST = [
    'themes',
    'node_modules/**/themes'
  ]

  /*
   * setPluginsEnv resolves TiddlyWiki plugins in the `node_modules`
   * subdirectory and adds them to the envVar environment variable
   */
  Plugin.prototype.setPluginsEnv = function (envVar, delimiter, pathList) {
    delimiter = delimiter || ':'
    pathList = pathList || PLUGINS_PATH_LIST

    var paths = []

    for (var i in pathList) {
      var pluginsPathGlob = pathList[i]
      var pluginInfoGlob = path.join(pluginsPathGlob, '*', '*', 'plugin.info')
      var pluginsPaths = glob.sync(pluginInfoGlob).map(function (pluginsInfoPath) {
        return path.dirname(path.dirname(path.dirname(pluginsInfoPath)))
      })
      
      pluginsPaths = pluginsPaths.filter(function (item, pos) {
        return pluginsPaths.indexOf(item) == pos
      })

      paths = paths.concat(pluginsPaths)
    }

    process.env[envVar] = paths.join(delimiter)

    console.log('setPluginsEnv:', process.env[envVar])
  }

  /*
   * setThemesEnv resolves TiddlyWiki themes in the `node_modules`
   * subdirectory and adds them to the envVar environment variable
   */
  Plugin.prototype.setThemesEnv = function (envVar, delimiter) {
    this.setPluginsEnv(envVar, delimiter, THEMES_PATH_LIST)
  }

  exports.plugin = new Plugin()

})()
