/*\
title: $:/plugins/ustuehler/core/syncadaptor.js
type: application/javascript
module-type: library

A promisified sync adaptor module base class

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/core/component.js').Component

  function SyncAdaptor (componentName, adaptorName, options) {
    this.name = adaptorName
    this.wiki = options.wiki

    return Component.call(this, componentName)
  }

  // Inherit from Component
  SyncAdaptor.prototype = Object.create(Component.prototype)
  SyncAdaptor.prototype.constructor = SyncAdaptor

  // Returns additional information needed by this adaptor
  SyncAdaptor.prototype.getTiddlerInfo = function (tiddler) {
    console.debug('getTiddlerInfo', tiddler)
    return this.getTiddlerInfoFromStore(tiddler)
  }

  /*
   * Get the current username and whether the user is signed in
   */
  SyncAdaptor.prototype.getStatus = function (callback) {
    var self = this

    this.getClientStatus()
      .then(function (values) {
        var isLoggedIn = values[0]
        var username = values[1]

        console.log(self.componentName + '.getStatus:', isLoggedIn, username)
        if (callback) { callback(null, isLoggedIn, username) }
      })
      .catch(function (err) {
        if (callback) { callback(err) }
      })
  }

  /*
   * Attempt to login and invoke the callback(err)
   */
  SyncAdaptor.prototype.login = function (username, password, callback) {
    console.log('login', username, password)
    this.loginToStore(username, password)
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Forget cached login credentials and everything
   */
  SyncAdaptor.prototype.logout = function (callback) {
    console.log('logout')
    this.logoutOfStore()
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Get an array of skinny tiddler fields from the server
   */
  SyncAdaptor.prototype.getSkinnyTiddlers = function (callback) {
    var self = this

    this.getSkinnyTiddlersFromStore()
      .then(function (tiddlers) {
        console.log(self.componentName + '.getSkinnyTiddlers:', tiddlers)
        callback(null, tiddlers)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
   */
  SyncAdaptor.prototype.saveTiddler = function (tiddler, callback) {
    console.log('saveTiddler', tiddler)
    this.saveTiddlerInStore(tiddler)
      .then(function (value) {
        var adaptorInfo = value[0]
        var revision = value[1]

        callback(null, adaptorInfo, revision)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Load a tiddler and invoke the callback with (err,tiddlerFields)
   */
  SyncAdaptor.prototype.loadTiddler = function (title, callback) {
    console.log('loadTiddler', title)
    this.loadTiddlerFromStore(title)
      .then(function (tiddler) {
        callback(null, tiddler)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Delete a tiddler and invoke the callback with (err)
   * options include:
   * tiddlerInfo: the syncer's tiddlerInfo for this tiddler
   */
  SyncAdaptor.prototype.deleteTiddler = function (title, callback, options) {
    console.log('deleteTiddler', title, options)

    var adaptorInfo = options.tiddlerInfo.adaptorInfo

    // If we have an empty adaptorInfo it means that the tiddler hasn't been seen by the server, so we don't need to delete it
    /*
     * TODO: review
    if (!adaptorInfo || adaptorInfo.length === 0) {
      return callback(null)
    }
    */

    // Issue request to delete the tiddler
    this.deleteTiddlerFromStore(title, adaptorInfo)
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  exports.SyncAdaptor = SyncAdaptor
})()
