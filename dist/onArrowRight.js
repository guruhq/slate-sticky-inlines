"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = onArrowRight;

var _constants = require("./constants");

var _utils = require("./utils");

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightOutsideInline(event, change, editor, opts) {
  var isExtending = event.shiftKey;
  var hasStickyBoundaries = opts.hasStickyBoundaries;

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline

  var isAtEndOfCurrentTextNode = change.value.selection.focus.offset === change.value.focusText.text.length;

  if (!isAtEndOfCurrentTextNode) return null;
  var textNodeIndex = change.value.focusBlock.nodes.findIndex(function (node) {
    return node.key === change.value.focusText.key;
  }) + 1;
  var upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex);

  if ((0, _utils.isInlineBanned)(change.value.schema, upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid // need to change?
  ) return null;

  return change.call(_utils.moveToStartOf, upcomingNode, event);
}

/**
 * Determines behavior if the caret is currently inside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightInsideInline(event, change, editor, opts) {
  var isExtending = event.shiftKey;
  var hasStickyBoundaries = opts.hasStickyBoundaries;

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)

  var isAtSecondToLastCharacter = change.value.selection.focus.offset === change.value.focusInline.text.length - 1;

  // Thanks to this very plugin, it's common to be in this change.value where you are at the edge of an inline.
  var isAtLastCharacter = change.value.selection.focus.offset === change.value.focusInline.text.length;

  var inlineIndex = change.value.focusBlock.nodes.findIndex(function (node) {
    return node.key === change.value.focusInline.key;
  }) + 1;
  var upcomingNode = change.value.focusBlock.nodes.get(inlineIndex);

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (isAtLastCharacter && upcomingNode && hasStickyBoundaries && !isExtending) {
    return change.call(_utils.moveToStartOf, upcomingNode, event);
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (upcomingNode && change.value.focusInline.text === _constants.ZERO_WIDTH_SPACE) {
    return change.call(_utils.moveToStartOf, upcomingNode, event, 1);
  }

  if (isAtSecondToLastCharacter) {
    return change.call(_utils.moveToEndOf, change.value.focusInline, event);
  }
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

function onArrowRight(event, change, editor, opts) {
  if (event.ctrlKey) return null;

  // In these cases we are actually inside the inline.
  if (change.value.focusInline) return handleArrowRightInsideInline(event, change, editor, opts);

  return handleArrowRightOutsideInline(event, change, editor, opts);
}