/*\
title: $:/plugins/ustuehler/firebase/index.js
type: application/javascript
module-type: library

Firebase plugin component index. This module instantiates eqch component with
its dependencies when it is first requested, but it will not wait for those
component instances to become reqdy.

It is the responsibility of each component to ensure that it is properly
initialised for the method that is called.  If the method needs to wait for
other events to take place first, then the component's method should return a
promise.

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component').Component

  var App = require('$:/plugins/ustuehler/firebase/app.js').App
  //var Database = require('$:/plugins/ustuehler/firebase/database.js').Database
  //var Storage = require('$:/plugins/ustuehler/firebase/storage.js').Storage
  var FirebaseUI = require('$:/plugins/ustuehler/firebase/firebaseui.js').FirebaseUI

  var Firebase = function () {
    Component.call(this, 'Firebase')

    this.app = new App(this)
    // TODO
    //this.database = new Database(this)
    //this.storage = new Storage(this)
    this.ui = new FirebaseUI(this)
  }

  Firebase.prototype = Object.create(Component.prototype)
  Firebase.prototype.constructor = Firebase

  // TODO: remove the name argument
  Firebase.prototype.initialise = function (name) {
    if (!$tw.browser) {
      return Promise.resolve(this)
    }
    return Component.prototype.initialise.call(this, name)
  }

  // Resolves when window.firebase is available
  Firebase.prototype.dependenciesReady = function () {
    var self = this
    return this.getWindowProperty('firebase')
      .then(function (value) {
        self.firebase = value
      })
  }

  Firebase.prototype.componentReady = function () {
    console.log('Firebase SDK version:', this.firebase.SDK_VERSION)
    return Promise.resolve()
  }

  exports.firebase = new Firebase()
})()
