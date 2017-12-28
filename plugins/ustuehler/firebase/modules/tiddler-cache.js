/*\
title: $:/plugins/ustuehler/firebase/tiddler-cache.js
type: application/javascript
module-type: library

Provides a caching layer over a tiddler store

\*/
(function () {
  var TiddlerCache = function (origin) {
    this.origin = origin
    this.titles = []
  }

  /*
   * Resolves to all existing tiddler titles at the origin. If sync is true,
   * then the titles are fetched synchronously from the origin; otherwise, a
   * cached title list is returned.
   */
  TiddlerCache.prototype.allTitles = function (sync) {
    if (sync) {
      this.titles = this.origin.allTitles()
    }
    return this.titles
  }

  // Refreshes the whole title cache synchronously
  TiddlerCache.prototype.refreshCache = function () {
    this.allTitles(true)
    console.log(this.origin.name, 'titles:', this.titles)
  }

  TiddlerCache.prototype.getTiddler = function (title) {
    return this.origin.getTiddler(title).then(function (tiddler) {
      if (tiddler) {
        this.addTitle(title)
      }
      return tiddler
    })
  }

  TiddlerCache.prototype.addTiddler = function (tiddler) {
    return this.origin.addTiddler(tiddler).then(function () {
      if (tiddler) {
        this.addTitle(tiddler.fields.title)
      }
      return tiddler
    })
  }

  TiddlerCache.prototype.deleteTiddler = function (title, force) {
    return this.origin.deleteTiddler(title, force).then(function (deletedTiddler) {
      this.removeTitle(title)
      return deletedTiddler
    })
  }

  TiddlerCache.prototype.syncTiddler = function (tiddler) {
    return this.origin.syncTiddler(tiddler).then(function (v) {
      var result = v[0]
      var action = v[1]

      if (action === 'delete-local' || action === 'delete-remote') {
        this.removeTitle(tiddler.fields.title)
      } else if (action !== 'noop') {
        this.addTitle(tiddler.fields.title)
      }

      return [result, action]
    })
  }

  TiddlerCache.prototype.addTitle = function (title) {
    this.titles.push(title)
  }

  TiddlerCache.prototype.removeTitle = function (title) {
    var x = this.titles.indexOf(title)

    if (x >= 0) {
      // Remove the tiddler title from the cache
      this.titles.splice(x, 1)
    }
  }

  exports.TiddlerCache = TiddlerCache
})()
