/*\
title: $:/plugins/ustuehler/core/utils.js
type: application/javascript
module-type: library

Internal utility functions for this plugin, and maybe useful to others

\*/
(function () {
  // This could be replaced with Object.assign, if we had it
  exports.assign = function (to, from) {
    for (var p in from) {
      if (from.hasOwnProperty(p)) {
        to[p] = from[p]
      }
    }
  }

  /*
   * Resolves when the specified window property is set. This can be used to
   * wait for external scripts which would set those properties when they are
   * loaded.
   */
  exports.getWindowProperty = function (property) {
    var deadline = Date.now() + 60000 // one minute from now
    var interval = 500 // affects the polling frequency

    return new Promise(function (resolve, reject) {
      var poll = function () {
        var now = Date.now()

        if (typeof window[property] !== 'undefined') {
          var value = window[property]

          return resolve(value)
        } else if (now < deadline) {
          setTimeout(poll, Math.min(deadline - now, interval))
        } else {
          reject(new Error('window.' + property + ' did not appear within the alotted time'))
        }
      }

      // Invoke the poller function once, and then via timeout, maybe
      poll()
    })
  }
})()
