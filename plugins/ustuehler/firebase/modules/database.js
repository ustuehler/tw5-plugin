/*\
title: $:/plugins/ustuehler/firebase/database.js
type: application/javascript
module-type: library

Firebase Database component

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component').Component
  var TiddlerStore = require('$:/plugins/ustuehler/firebase/tiddler-store.js').TiddlerStore

  var Database = function (firebaseDatabase) {
    if (arguments.length > 0) {
      this.database = firebaseDatabase
      this.initialiseComponent('FirebaseDatabase', this)
    }
  }

  Database.prototype = new Component()

  Database.prototype.componentReady = function () {
    this.tiddlerStore = new TiddlerStore(this)
    return Promise.resolve()
  }

  Database.prototype.tiddlers = function () {
    return this.tiddlerStore
  }

  Database.prototype.ref = function (path) {
    return this.database.ref(path)
  }

  Database.prototype.fetch = function (path) {
    return this.ref(path).once('value').then(function (snapshot) {
      return snapshot.val()
    })
  }

  Database.prototype.store = function (path, value) {
    return this.ref(path).set(value)
  }

  // Resolves to the names of all entries at the given path
  Database.prototype.list = function (path) {
    var ref = this.ref(path)

    return getPages(ref).then(function (pages) {
      var titles = []

      $tw.utils.each(pages, function (page) {
        $tw.utils.each(page, function (item) {
          titles.push(item.title)
        })
      })

      return Promise.resolve(titles)
    })
  }

  // Resolves to the names of all entries in the database
  Database.prototype.listAll = function (path) {
    var entries = []
    for (var child in this.list(path)) {
      var childPath = path + '/' + child

      entries.push(childPath)
      entries = entries.concat(this.listAll(childPath))
    }
    return entries
  }

  var pageLength = 1000

  // ref: https://howtofirebase.com/collection-queries-with-firebase-b95a0193745d
  function getPages (ref, accumulator, cursor) {
    var pages = accumulator || []
    var query = ref.orderByKey().limitToFirst(pageLength + 1) // limitToFirst starts from the top of the sorted list

    if (cursor) { // If no cursor, start at beginning of collection... otherwise, start at the cursor
      query = query.startAt(cursor) // Don't forget to overwrite the query variable!
    }

    return query.once('value')
      .then(function (snaps) {
        var page = []
        var extraRecord

        snaps.forEach(function (childSnap) {
          console.log(childSnap)
          page.push({
            id: childSnap.key,
            title: childSnap.val().title
          })
        })

        if (page.length > pageLength) {
          extraRecord = page.pop()
          pages.push(page)
          console.log(pages, extraRecord.id)
          return getPages(ref, pages, extraRecord.id)
        } else {
          pages.push(page)
          return Promise.resolve(pages)
        }
      })
  };

  exports.Database = Database

  exports.database = new Database()

  exports.initialise = function (firebaseDatabase) {
    return exports.database.initialise(firebaseDatabase)
  }

  exports.tiddlers = function () {
    return exports.initialise().then(function (database) {
      return database.tiddlers()
    })
  }

  exports.all = function () {
    return exports.initialise().then(function (database) {
      return database.all()
    })
  }

  exports.fetch = function (path) {
    return exports.initialise().then(function (database) {
      return database.fetch(path)
    })
  }

  exports.store = function (path, value) {
    return exports.initialise().then(function (database) {
      return database.store(path, value)
    })
  }
})()
