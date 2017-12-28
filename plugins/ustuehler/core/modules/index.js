/*\
title: $:/plugins/ustuehler/core/index.js
type: application/javascript
module-type: library

Exports common plugin component classes

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/core/component.js').Component
  var Observable = require('$:/plugins/ustuehler/core/observable.js').Observable
  var Status = require('$:/plugins/ustuehler/core/status.js').Status
  var SyncAdaptor = require('$:/plugins/ustuehler/core/syncadaptor.js').SyncAdaptor
  var Syncer = require('$:/plugins/ustuehler/core/syncer.js').Syncer
  var Tiddlers = require('$:/plugins/ustuehler/core/tiddlers.js').Tiddlers

  exports.Component = Component
  exports.Observable = Observable
  exports.Status = Status
  exports.SyncAdaptor = SyncAdaptor
  exports.Syncer = Syncer
  exports.Tiddlers = Tiddlers
})()
