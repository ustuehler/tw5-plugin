/*\
title: $:/plugins/ustuehler/core/tiddlers.js
type: application/javascript
module-type: library

Plugin component configuration in tiddlers

\*/
(function () {
  /* global $tw */

  const CONFIG_TIDDLER_BASE = '$:/config/'
  const STATUS_TIDDLER_BASE = '$:/status/'
  const TEMP_TIDDLER_BASE = '$:/temp/'

  var Tiddlers = function (name) {
    this.configTiddler = CONFIG_TIDDLER_BASE + name
    this.statusTiddler = STATUS_TIDDLER_BASE + name
    this.tempTiddler = TEMP_TIDDLER_BASE + name
  }

  Tiddlers.prototype.getConfigField = function (title, field, fallback) {
    var tiddler = $tw.wiki.getTiddler(this.configTiddler + '/' + title)
    if (!tiddler) {
      return fallback
    }
    return tiddler.fields[field]
  }

  Tiddlers.prototype.getConfigText = function (name) {
    return $tw.wiki.getTiddlerText(this.configTiddler + '/' + name)
  }

  Tiddlers.prototype.getStatusText = function (name) {
    return $tw.wiki.getTiddlerText(this.statusTiddler + '/' + name)
  }

  Tiddlers.prototype.getTempText = function (name) {
    return $tw.wiki.getTiddlerText(this.tempTiddler + '/' + name)
  }

  exports.Tiddlers = Tiddlers
})()
