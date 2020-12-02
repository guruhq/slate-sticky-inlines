"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = onBackspace;

var _constants = require("./constants");

var _utils = require("./utils");

/**
 * Sticky Backspace Link logic
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Objects} opts
 * @return {Null | Change}
 */

function onBackspace(event, change, editor, opts) {
  var canBeEmpty = opts.canBeEmpty,
      stickOnDelete = opts.stickOnDelete;

  if (change.value.isExpanded) return null;

  // Logic for backspacing "into" a sticky inline
  var isAtStartOfCurrentTextNode = !change.value.focusInline && change.value.selection.focus.offset === 0;

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    var textNodeIndex = change.value.focusBlock.nodes.findIndex(function (node) {
      return node.key === change.value.focusText.key;
    });
    var upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex - 1);
    if ((0, _utils.isInlineBanned)(change.value.schema, upcomingNode, opts)) return null;

    event.preventDefault();
    return change.collapseToEndOf(upcomingNode).deleteBackward();
  }

  // Logic for deleting inside the sticky inline
  if (!change.value.focusInline || !canBeEmpty) return null;
  if (change.value.focusInline.text.length === 1 && change.value.focusInline.text === _constants.ZERO_WIDTH_SPACE) return null;

  if (change.value.focusInline.text.length !== 1) return null;
  event.preventDefault();
  return change.insertText(_constants.ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1);
}