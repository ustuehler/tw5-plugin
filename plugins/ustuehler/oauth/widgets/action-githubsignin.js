/*\
title: $:/plugins/ustuehler/oauth/widgets/action-githubsignin.js
type: application/javascript
module-type: widget
caption: action-githubsignin

Trigger the OAuth Flow to sign in with a GitHub account

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubSignInWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubSignInWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubSignInWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
GitHubSignInWidget.prototype.execute = function() {
  this.tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
  this.field = this.getAttribute("field", "list");
  this.filter = this.getAttribute("filter", "");

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubSignInWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field || changedAttributes.filter) {
    this.refreshSelf();
    return true;
  }

  return this.refreshChildren(changedTiddlers);
};

/*
 * Invoke the action associated with this widget
 */
GitHubSignInWidget.prototype.invokeAction = function(triggeringWidget,event) {
  var self = this;

  console.log("GitHubSignInWidget.prototype.invokeAction");
  console.log(self);

  /*
   * Redirect to GitHub, let GitHub authenticate the user, and finally, let
   * GitHub redirect back to this TiddlyWiki.
   *
   * Next, the github-auth widget should be rendered somewhere on the
   * page, which in turn invokes the callback() function in this module.
   */
  $tw.utils.oauth.requestToken();
  // notreached

  return true; // Action was invoked
};

/*
 * Invoked by the github-auth widget
 */
function callback() {
  console.log("github-auth called back! \\o/");

  // TODO: Set $:/status/OAuth/UserName et al
}

GitHubSignInWidget.prototype.getStatus = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/status/OAuth/' + name) || fallback;
};

GitHubSignInWidget.prototype.getConfig = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/config/OAuth/' + name) || fallback;
};

/*
 * Don't allow actions to propagate, because we invoke actions ourself
 */
GitHubSignInWidget.prototype.allowActionPropagation = function() {
  return false;
};

exports["action-githubsignin"] = GitHubSignInWidget;

})(this);
