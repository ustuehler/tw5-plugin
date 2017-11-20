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
    var self = this
    var title = tiddler.fields.title

    console.log('saveTiddler', title, tiddler)

    this.saveTiddlerStart(title)
    this.saveTiddlerInStore(tiddler)
      .then(function (value) {
        var adaptorInfo = value[0]
        var revision = value[1]

        self.saveTiddlerEnd(null, title)
        callback(null, adaptorInfo, revision)
      })
      .catch(function (err) {
        self.saveTiddlerEnd(err, title)
        callback(err)
      })
  }

  /*
   * saveTiddlerStart registers an in-flight tiddler being uploaded
   */
  SyncAdaptor.prototype.saveTiddlerStart = function (title) {
    console.log('saveTiddlerStart:', title)

    this.uploading += 1

    this.status.update(this.uploadingStatus())
  }

  /*
   * saveTiddlerEnd marks an in-flight tiddler as uploaded or failed
   */
  SyncAdaptor.prototype.saveTiddlerEnd = function (err, title) {
    console.log('saveTiddlerEnd:', title, err)

    this.uploading -= 1

    if (this.uploading < 1) {
      this.status.update(this.notUploadingStatus())
    }
  }

  /*
   * Load a tiddler and invoke the callback with (err,tiddlerFields)
   */
  SyncAdaptor.prototype.loadTiddler = function (title, callback) {
    var self = this

    console.log('loadTiddler', title)

    this.loadTiddlerStart(title)
    this.loadTiddlerFromStore(title)
      .then(function (tiddler) {
        self.loadTiddlerEnd(null, title)
        callback(null, tiddler)
      })
      .catch(function (err) {
        self.loadTiddlerEnd(err, title)
        callback(err)
      })
  }

  /*
   * loadTiddlerStart registers an in-flight tiddler being downloaded
   */
  SyncAdaptor.prototype.loadTiddlerStart = function (title) {
    console.log('loadTiddlerStart:', title)

    this.downloading += 1

    this.status.update(this.downloadingStatus())
  }

  /*
   * loadTiddlerEnd marks an in-flight tiddler as downloaded or failed
   */
  SyncAdaptor.prototype.loadTiddlerEnd = function (err, title) {
    console.log('saveTiddlerEnd:', title, err)

    this.downloading -= 1

    if (this.downloading < 1) {
      this.status.update(this.notDownloadingStatus())
    }
  }

  /*
   * Delete a tiddler and invoke the callback with (err)
   * options include:
   * tiddlerInfo: the syncer's tiddlerInfo for this tiddler
   */
  SyncAdaptor.prototype.deleteTiddler = function (title, callback, options) {
    console.log('deleteTiddler', title, options)

    var self = this
    var adaptorInfo = options.tiddlerInfo.adaptorInfo

    // If we have an empty adaptorInfo it means that the tiddler hasn't been seen by the server, so we don't need to delete it
    /*
     * TODO: review
    if (!adaptorInfo || adaptorInfo.length === 0) {
      return callback(null)
    }
    */

    // Issue request to delete the tiddler
    this.saveTiddlerStart(title)
    this.deleteTiddlerFromStore(title, adaptorInfo)
      .then(function () {
        self.saveTiddlerEnd(null, title)
        callback(null)
      })
      .catch(function (err) {
        self.saveTiddlerEnd(err, title)
        callback(err)
      })
  }

  SyncAdaptor.prototype.isIdle = function () {
    return !(this.status.fields.uploading || this.status.fields.downloading)
  }

  SyncAdaptor.prototype.downloadingStatus = function () {
    return {
      downloading: true,
      icon: 'cloud_download'
    }
  }

  SyncAdaptor.prototype.notDownloadingStatus = function () {
    return {
      downloading: false,
      icon: this.isIdle() ? 'cloud_done' : this.status.fields.icon
    }
  }

  SyncAdaptor.prototype.uploadingStatus = function () {
    return {
      uploading: true,
      icon: 'cloud_upload'
    }
  }

  SyncAdaptor.prototype.notUploadingStatus = function () {
    return {
      uploading: false,
      icon: this.isIdle() ? 'cloud_done' : this.status.fields.icon
    }
  }

  exports.SyncAdaptor = SyncAdaptor
})()
