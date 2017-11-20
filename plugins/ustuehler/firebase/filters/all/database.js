/*\
title: $:/plugins/ustuehler/firebase/filters/all/database.js
type: application/javascript
module-type: allfilteroperator
caption: database

Filter operator returning all tiddler titles in the Firebase Database

\*/
(function () {
  var firebase = require('$:/plugins/ustuehler/firebase').firebase

  /*
   * Export our filter function
   */
  exports.database = function (source, operator, options) {
    // Return the cached titles as output; ignore input, suffix and param
    return firebase.database().tiddlers().allTitles()
  }
})()
