"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = onArrowLeft;

var _constants = require("./constants");

var _utils = require("./utils");

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing left
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowLeftOutsideInline(event, change, editor, opts) {
  var isExtending = event.shiftKey;
  var hasStickyBoundaries = opts.hasStickyBoundaries;

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline

  var isAtStartOfCurrentTextNode = change.value.selection.focus.offset === 0;

  if (!isAtStartOfCurrentTextNode) return null;
  var textNodeIndex = change.value.focusBlock.nodes.findIndex(function (node) {
    return node.key === change.value.focusText.key;
  }) - 1;
  var upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex);

  if ((0, _utils.isInlineBanned)(change.value.schema, upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid || textNodeIndex === -1) return null;
  return change.call(_utils.moveToEndOf, upcomingNode, event);
}

/**
 * Determines behavior if the caret is currently inside of an inline
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowLeftInsideInline(event, change, editor, opts) {
  var isExtending = event.shiftKey;
  var hasStickyBoundaries = opts.hasStickyBoundaries;

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)

  var isAtSecondToFirstCharacter = change.value.selection.focus.offset === 1;

  // Thanks to this very plugin, it's common to be in this change.value where you are at the edge of an inline.
  var isAtFirstCharacter = change.value.selection.focus.offset === 0;

  var inlineIndex = change.value.focusBlock.nodes.findIndex(function (node) {
    return node.key === change.value.focusInline.key;
  }) - 1;
  var upcomingNode = change.value.focusBlock.nodes.get(inlineIndex);

  if (inlineIndex === -1) return null;

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (hasStickyBoundaries && isAtFirstCharacter && upcomingNode && !isExtending) {
    return change.call(_utils.moveToEndOf, upcomingNode, event);
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (change.value.focusInline.text === _constants.ZERO_WIDTH_SPACE && upcomingNode) {
    return change.call(_utils.moveToEndOf, upcomingNode, event, -1);
  }

  if (isAtSecondToFirstCharacter) {
    return change.call(_utils.moveToStartOf, change.value.focusInline, event);
  }

  return null;
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null}
 */

function onArrowLeft(event, change, editor, opts) {
  if (event.ctrlKey) return null;

  // In these cases we are actually inside the inline.
  if (change.value.focusInline) return handleArrowLeftInsideInline(event, change, editor, opts);

  return handleArrowLeftOutsideInline(event, change, editor, opts);
}