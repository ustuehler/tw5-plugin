/*\
title: $:/plugins/ustuehler/firebase/storage.js
type: application/javascript
module-type: library

Firebase Storage plugin component

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/core').Component

  var Storage = function (firebase) {
    this.storage = firebase.firebase.storage()

    Component.call(this, 'FirebaseStorage')
  }

  Storage.prototype = Object.create(Component.prototype)
  Storage.prototype.constructor = Storage

  exports.Storage = Storage
})()
