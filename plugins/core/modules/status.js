/*\
title: $:/plugins/ustuehler/core/status.js
type: application/javascript
module-type: library

Plugin component status

\*/
(function () {
  /* global $tw */

  var Observable = require('$:/plugins/ustuehler/core/observable.js').Observable
  var assign = require('$:/plugins/ustuehler/core/utils.js').assign

  const STATUS_TIDDLER_BASE = '$:/status/'

  var Status = function (component, fields) {
    Observable.call(this)

    this.initialise(component, fields)
  }

  Status.prototype = Object.create(Observable.prototype)
  Status.prototype.constructor = Status

  /*
   * Sets the status fields to {ok: true, error: null, ready: false,
   * initialising: false} and emits an initial change event
   */
  Status.prototype.initialise = function (title, fields) {
    // Appened to STATUS_TIDDLER_BASE
    this.title = title

    // The fields are also set on the status tiddler
    if (!fields) {
      fields = this.uninitialisedStatus()
    }

    // Emit an initial status change event
    this.fields = {}
    this.update(fields)
  }

  /*
   * Update only the ok and error fields (null to clear the last error)
   */
  Status.prototype.setError = function (err) {
    this.update({ ok: !err, error: err ? err + '' : null })
  }

  /*
   * Update zero or more status fields and emit an event on change. The status
   * tiddler will also be updated so that UI elements may react to the change.
   */
  Status.prototype.update = function (fields) {
    if (!fields) {
      return
    }

    var fieldsHaveChanged = false

    for (var field in fields) {
      if (this.fields[field] !== fields[field]) {
        fieldsHaveChanged = true
        break
      }
    }

    if (fieldsHaveChanged) {
      assign(this.fields, fields)

      this.updateTiddler()
      this.notifyChangeEventListeners()
    }
  }

  Status.prototype.uninitialisedStatus = function () {
    return {
      ok: true,
      ready: false,
      error: null,
      initialising: false
    }
  }

  Status.prototype.updateTiddler = function () {
    // XXX: find out when and why $tw.wiki.setText may be undefined here and review this
    if (typeof $tw.wiki.setText === 'undefined') {
      console.log('Skipping this status tiddler update because $tw.wiki.setText is undefined')
      return
    }

    var title = STATUS_TIDDLER_BASE + this.title
    var tiddler = new $tw.Tiddler({
      type: 'application/json',
      text: JSON.stringify(this.fields, undefined, '  ')
    }, this.fields, {title: title})

    $tw.wiki.addTiddler(tiddler)
  }

  Status.prototype.notifyChangeEventListeners = function () {
    var event = {
      source: this.title,
      status: {}
    }

    assign(event.status, this.fields)

    this.dispatchEvent('change', event)
  }

  Status.prototype.addChangeEventListener = function (l) {
    this.addEventListener('change', l)
  }

  Status.prototype.removeChangeEventListener = function (l) {
    this.removeEventListener('change', l)
  }

  exports.Status = Status
})()
