/*\
title: $:/plugins/ustuehler/firebase/utils.js
type: application/javascript
module-type: utils

Exports the Firebase singleton as $tw.utils.firebase() for debugging

\*/
(function () {
  /* global $tw */

  if ($tw.browser) {
    // Load other modules of this plugin only when this function is called
    exports.firebase = function () {
      return require('$:/plugins/ustuehler/firebase').firebase
    }
  }
})()
