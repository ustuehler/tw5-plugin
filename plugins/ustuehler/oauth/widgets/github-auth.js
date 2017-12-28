/*\
title: $:/plugins/ustuehler/oauth/widgets/github-auth.js
type: application/javascript
module-type: widget
caption: github-auth

Implements the complete flow of signing in with a GitHub account

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubAuthWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubAuthWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubAuthWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();

  // Complete the sign-in flow, if we were redirected here by the OAuth provider
  $tw.utils.oauth.callback();

  if ($tw.utils.oauth.getUserName()) {
    this.renderChildren(parent, nextSibling);
  }
};

/*
Compute the internal state of the widget
*/
GitHubAuthWidget.prototype.execute = function() {
  /*
  this.errorTemplate = this.getAttribute("errorTemplate", this.getVariable("errorTemplate"));
  */

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubAuthWidget.prototype.refresh = function(changedTiddlers) {
  /*
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field || changedAttributes.filter) {
    this.refreshSelf();
    return true;
  }
  */

  return this.refreshChildren(changedTiddlers);
};

exports["github-auth"] = GitHubAuthWidget;

})(this);
