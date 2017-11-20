/*\
title: $:/plugins/ustuehler/firebase/app.js
type: application/javascript
module-type: library

Firebase App component

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component').Component
  var config = require('$:/plugins/ustuehler/firebase/config.js').config

  var App = function (index) {
    this.index = index

    Component.call(this, 'FirebaseApp')
  }

  // Inherit from Component
  App.prototype = Object.create(Component.prototype)
  App.prototype.constructor = App

  // TODO: remove the name argument
  App.prototype.initialise = function (name) {
    if (!$tw.browser) {
      return Promise.resolve(this)
    }
    return Component.prototype.initialise.call(this, name)
  }

  /*
   * componentReady resolves when the Firebase app is initialised. This must
   * be completed before any other component can use Firebase.
   */
  App.prototype.dependenciesReady = function () {
    return this.index.initialise()
  }

  /*
   * componentReady resolves when the Firebase app is initialised. This must
   * be completed before any other component can use Firebase.
   */
  App.prototype.componentReady = function () {
    this.index.firebase.initializeApp(config)
    return Promise.resolve()
  }

  /*
   * Return the application's Firebase Database implementation object
   */
  App.prototype.database = function () {
    return this.index.firebase.app().database()
  }

  /*
   * Return the application's Firebase Storage implementation object
   */
  App.prototype.storage = function () {
    return this.index.firebase.app().storage()
  }

  exports.App = App
})()
