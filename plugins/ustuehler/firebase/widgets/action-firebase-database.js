/*\
title: $:/plugins/ustuehler/firebase/widgets/action-firebase-database.js
type: application/javascript
module-type: widget
caption: action-firebase-database

The action-firebase-database widget manipulates tiddlers in the Firestore Database

\*/
(function () {
  /* global $tw */

  // Firebase component index
  var firebase = require('$:/plugins/ustuehler/firebase').firebase

  // Base widget class
  var Widget = require('$:/core/modules/widgets/widget.js').widget

  // Constructor for this widget
  var ActionFirebaseDatabaseWidget = function (parseTreeNode, options) {
    this.initialise(parseTreeNode, options)
  }

  // Inherit from the base widget class
  ActionFirebaseDatabaseWidget.prototype = new Widget()

  /*
   * Render this widget into the DOM
   */
  ActionFirebaseDatabaseWidget.prototype.render = function (parent, nextSibling) {
    this.computeAttributes()
    this.execute()

    // Insert this widget and its children into the DOM
    this.renderChildren(parent, nextSibling)
  }

  /*
   * Compute the internal state of the widget
   */
  ActionFirebaseDatabaseWidget.prototype.execute = function () {
    this.action = this.getAttribute('$action', '') // required: 'get' or 'set'
    this.actionTiddler = this.getAttribute('$tiddler', this.getVariable('currentTiddler'))
    this.actionTimestamp = this.getAttribute('$timestamp', true)
    this.showSnackbar = this.getAttribute('$snackbar', false)

    // Compute the internal state of child widgets.
    this.makeChildWidgets()
  }

  /*
   * Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
   */
  ActionFirebaseDatabaseWidget.prototype.refresh = function (changedTiddlers) {
    var changedAttributes = this.computeAttributes()

    if (changedAttributes.action ||
      changedAttributes.actionTiddler ||
      changedAttributes.actionTimestamp ||
      changedAttributes.showSnackbar) {
      this.refreshSelf()
      return true
    }

    return this.refreshChildren(changedTiddlers)
  }

  /*
   * Invoke the action associated with this widget
   */
  ActionFirebaseDatabaseWidget.prototype.invokeAction = function (triggeringWidget, event) {
    var self = this
    var action = this.action
    var actionTiddler = this.actionTiddler

    var showSnackbar = function (message) {
      if (self.showSnackbar) {
        $tw.utils.showSnackbar(message)
      }
    }

    firebase.database().then(function (database) {
      // Use the tiddler interface to the database
      database = database.tiddlers()

      if (action === 'delete') {
        return database.deleteTiddler(actionTiddler).then(function (deletedTiddler) {
          console.log('deletedTiddler:', deletedTiddler)
          showSnackbar('Deleted ' + actionTiddler + '.')
        })
      }

      if (action === 'fetch') {
        return database.getTiddler(actionTiddler).then(function (tiddler) {
          if (tiddler) {
            $tw.wiki.addTiddler(tiddler)
            showSnackbar('Fetched ' + actionTiddler + '.')
          } else {
            showSnackbar('Tiddler not found: ' + actionTiddler + '.')
          }
        })
      }

      if (action === 'store') {
        var tiddler = $tw.wiki.getTiddler(actionTiddler)
        return database.addTiddler(tiddler).then(function (snapshot) {
          showSnackbar('Stored ' + actionTiddler + '.')
        })
      }

      if (action === 'sync') {
        return database.syncTiddler(actionTiddler).then(function (v) {
          var action = v[1]

          showSnackbar('Synced ' + actionTiddler + ' with ' + action + '.')
        })
      }

      $tw.utils.showSnackbar(new Error(
        'Invalid action for action-firebase-database widget: "' + action +
        '" (expected one of: "delete", "fetch", "store" or "sync")'
      ))
    })

    return true // Action was invoked
  }

  exports['action-firebase-database'] = ActionFirebaseDatabaseWidget
})()
