/*\
title: $:/plugins/ustuehler/core/syncer.js
type: application/javascript
module-type: library

A $tw.Syncer that can be shut down cleanly

\*/
(function () {
  /* global $tw */

  function Syncer (options) {
    return $tw.Syncer.call(this, options)
  }

  // Inherit from $tw.Syncer
  Syncer.prototype = Object.create($tw.Syncer.prototype)
  Syncer.prototype.constructor = Syncer

  /*
   * stop shuts down the syncer cleanly. This syncer instance should be
   * discarded after stop has been called.
   */
  Syncer.prototype.stop = function () {
    // FIXME: deregister all event listeners registered by this syncer
    return Promise.resolve()
  }

  exports.Syncer = Syncer
})()
