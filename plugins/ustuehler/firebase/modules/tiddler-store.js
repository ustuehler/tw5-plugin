/*\
title: $:/plugins/ustuehler/firebase/tiddler-store.js
type: application/javascript
module-type: library

Provides a tiddler data store interface above FirebaseDatabase or FirebaseStorage

\*/
(function () {
  /* global $tw, Promise */

  // prefix for all tiddlers in the database, or in hte cloud storage bucket
  var TIDDLERS_REF = '/tiddlers/'

  // field which marks a FirebaseTiddler as deleted
  var DELETED_FIELD = 'x-firebase-deleted' // accepts "yes" or "no"

  var Component = require('$:/plugins/ustuehler/core').Component

  var TiddlerStore = function (origin) {
    this.origin = origin
    Component.call(this, origin.name + 'Tiddlers')
  }

  TiddlerStore.prototype = Object.create(Component.prototype)
  TiddlerStore.prototype.constructor = TiddlerStore

  // Resolves to all existing tiddler titles at the origin
  TiddlerStore.prototype.allTitles = function () {
    return this.origin.entries().then(function (entries) {
      var titles = []
      for (var entry in entries) {
        titles.push(tiddlerTitle(entry))
      }
      return titles
    })
  }

  // Resolves to a tiddler, or to null if the tiddler does not exist at its origin
  TiddlerStore.prototype.getTiddler = function (title) {
    var path = tiddlerPath(title)

    return this.origin.fetch(path).then(function (fields) {
      if (!fields || fields[DELETED_FIELD] === 'yes') {
        // Tiddler does not exist, or is marked as deleted at its origin
        return null
      } else {
        // Return a new tiddler with the given title and fields from origin
        return new $tw.Tiddler(fields, {title: title})
      }
    })
  }

  // Stores a tiddler at its origin and resolves to the stored tiddler
  TiddlerStore.prototype.addTiddler = function (tiddler) {
    var fields = tiddler.getFieldStrings()
    var path = tiddlerPath(tiddler.fields.title)

    return this.origin.store(path, fields).then(function () {
      return tiddler
    })
  }

  /*
   * Deletes a tiddler at its origin, or marks it as deleted, and resolves to
   * the deleted tiddler. The deleted tiddler will be null if force is given;
   * otherwise, contains all the stored fields, except DELETED_FIELD.
   */
  TiddlerStore.prototype.deleteTiddler = function (title, force) {
    var path = tiddlerPath(title)
    var self = this

    // TODO: support actual, forced deletion

    return self.origin.fetch(path).then(function (fields) {
      if (fields[DELETED_FIELD] === 'yes') {
        return null
      }

      var deletedFields = (function () {
        var f = {}
        f[DELETED_FIELD] = 'yes'
        return f
      }())

      var deletedTiddler = new $tw.Tiddler(
        fields,
        $tw.wiki.getCreationFields(),
        $tw.wiki.getModificationFields(),
        deletedFields
      )

      fields = deletedTiddler.getFieldStrings()

      return self.origin.store(path, fields).then(function () {
        /*
         * Remove the deletion marker field so that the tiddler can be stored
         * straight back to resurrect the deleted tiddler
         */
        delete deletedTiddler.fields[DELETED_FIELD]
        return deletedTiddler
      })
    })
  }

  /*
   * syncTiddler synchronises the local tlddler and its corresponding remote
   * database tiddler of the same name. It resolves to the resulting tiddler,
   * and the action that was taken.
   */
  TiddlerStore.prototype.syncTiddler = function (title) {
    var local = $tw.wiki.getTiddler(title)
    var self = this

    return this.getTiddler(title).then(function (remote) {
      return self.syncTiddlerCompare(local, remote)
    }).then(function (local, remote, action) {
      return self.syncTiddlerExecute(local, remote, action)
    })
  }

  /*
   * syncTiddlerCompare determines the correct action to take in order to
   * synchronise a local tiddler and its corresponding tiddler in the database.
   * Whichever tiddler was modified later wins and resolves this promise.
   *
   * The promise resolves to a list of three objects: local tiddler, remote
   * tiddler, and a string for the sync action to take.
   */
  TiddlerStore.prototype.syncTiddlerCompare = function (local, remote) {
    var title = local ? local.fields.title : (remote ? remote.fields.title : null)
    var action = 'noop'

    var localModified = modifiedField(local)
    var remoteModified = modifiedField(remote)

    if (localModified < remoteModified) {
      action = 'fetch'
    } else if (localModified > remoteModified) {
      action = 'store'
    }

    console.log('syncTiddler: Resolved local', localModified, 'and remote', remoteModified, title, 'with', action, 'action')
    return Promise.resolve([local, remote, action])
  }

  function modifiedField (tiddler) {
    return tiddler ? tiddler.fields.modified || new Date(0) : new Date(0)
  }

  // Execute the given sync action
  TiddlerStore.prototype.syncTiddlerExecute = function (values) {
    var local = values[0]
    var remote = values[1]
    var action = values[2]

    if (action === 'fetch') {
      // Local tiddler needs to be updated from database
      $tw.wiki.addTiddler(remote)
      return Promise.resolve([remote, action])
    }

    if (action === 'store') {
      // Remote tiddler in database needs to be updated from local
      return this.addTiddler(local).then(function () {
        return Promise.resolve([local, action])
      })
    }

    if (action === 'delete-remote') {
      return this.deleteTiddler(remote.title).then(function () {
        return Promise.resolve([null, action])
      })
    }

    if (action === 'delete-local') {
      $tw.wiki.deleteTiddler(local)
      return Promise.resolve([null, action])
    }

    // Local and remote tiddlers were already in sync
    return Promise.resolve([local, action])
  }

  /*
   * tiddlerPath returns a database ref or cloud storage path for a tiddler
   * title. The returned path is always rooted at TIDDLERS_REF, and appends at
   * least two more path components.
   *
   * The tiddler title is is the last component in the path, and it is encoded
   * as an URI component in the resulting path to avoid running into naming
   * restrictions in Firebase.
   *
   * The tiddler's parent path is determined based on what kind of tiddler it
   * is. For example, if the title begins with '$:' then it is a system tiddler
   * that goes into 'system/'.  Regular tiddlers are stored under 'content/'.
   */
  function tiddlerPath (title) {
    var path

    if (title.startsWith('$:/')) {
      // System tiddlers
      title = title.replace('$:/', '')
      path = 'system/'
    } else {
      // Regular tiddlers
      path = 'content/'
    }

    return TIDDLERS_REF + path + encodeURIComponent(title)
  }

  /*
   * tiddlerTitle is the inverse operation of tiddlerPath
   */
  function tiddlerTitle (path) {
    if (!path.startsWith(TIDDLERS_REF)) {
      throw new Error('expected tiddler path to start with ' + TIDDLERS_REF + ': ' + path)
    }

    if (path.startsWith('system/')) {
      path = path.replace('system/', '$:/')
    } else {
      path = path.replace('content/', '')
    }

    var title = decodeURIComponent(path)

    return title
  }

  exports.TiddlerStore = TiddlerStore
})()
