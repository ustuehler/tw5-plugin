/*\
title: $:/plugins/ustuehler/core/widgets/plugin-doctor.js
type: application/javascript
module-type: widget
caption: plugin-doctor

Checks for common issues with plugins, and may offer remedies

\*/
(function () {

  'use strict'
  /*jslint node: true, browser: true */

  var Widget = require('$:/core/modules/widgets/widget.js').widget

  var PluginDoctorWidget = function(parseTreeNode,options) {
    this.initialise(parseTreeNode,options)
  }

  /*
   * Inherit from the base widget class
   */
  PluginDoctorWidget.prototype = new Widget()

  /*
   * Render this widget into the DOM
   */
  PluginDoctorWidget.prototype.render = function(parent,nextSibling) {
    this.computeAttributes()
    this.execute()
    // TODO: diagnose and report issues
    this.renderChildren(parent, nextSibling)
  }

  /*
   * Compute the internal state of the widget
   */
  PluginDoctorWidget.prototype.execute = function() {
    this.reportTemplate = this.getAttribute('template', this.getVariable('reportTemplate'))

    // Compute the internal state of child widgets.
    this.makeChildWidgets()
  }

  /*
   * Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
   */
  PluginDoctorWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes()

    if (changedAttributes.reportTemplate) {
      this.refreshSelf()
      return true
    }

    return this.refreshChildren(changedTiddlers)
  }

  exports['plugin-doctor'] = PluginDoctorWidget

})()
