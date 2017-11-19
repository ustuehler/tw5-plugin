#!/usr/bin/env node
// This is invoked as a shell script by NPM

const TIDDLYWIKI_INFO_FILE = 'tiddlywiki.info'

var fs = require('fs')

var TiddlyWikiPlugin = function () {}

TiddlyWikiPlugin.prototype.linkMissingThemes = function (cb) {
  this.readWikiInfo(function (err, wikiInfo) {
    if (err) {
      return cb(err)
    }

    console.log('linkMissingThemes.wikiInfo:', wikiInfo)
  })
}

TiddlyWikiPlugin.prototype.linkMissingPlugins = function (cb) {
  this.readWikiInfo(function (err, wikiInfo) {
    if (err) {
      return cb(err)
    }

    console.log('linkMissingThemes.wikiInfo:', wikiInfo)
  })
}

TiddlyWikiPlugin.prototype.readWikiInfo = function (cb) {
  fs.readFile(TIDDLYWIKI_INFO_FILE, function (err, data) {
    if (err) {
      return cb(err)
    }

    var wikiInfo = JSON.parse(data)

    cb(null, wikiInfo)
  })
}

var plugin = new TiddlyWikiPlugin()

// Resolve missing themes to node modules
plugin.linkMissingThemes()

// Resolve missing plugins to node modules
plugin.linkMissingPlugins()

var $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki()

// Pass the command line arguments to the boot kernel
$tw.boot.argv = ['.'].concat(process.argv.slice(2))

// Boot the TW5 app
$tw.boot.boot()
