"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInlineBanned = isInlineBanned;
exports.moveToEndOf = moveToEndOf;
exports.moveToStartOf = moveToStartOf;
/**
 * Return true if settings bans the inline type, or it is void.
 *
 * @param {Inline} inline
 * @param {Object} opts
 * @return {Boolean}
 */

function isInlineBanned(schema, inline, opts) {
  var allowedTypes = opts.allowedTypes,
      bannedTypes = opts.bannedTypes;

  // Something crazy happened, there is no inline, or somehow focus inline is not an inline.

  if (!inline || inline.object !== "inline" || schema.isVoid(inline)) return true;

  // The inline we are working with isn't allowed by user config.
  if (allowedTypes && !allowedTypes.includes(inline.type)) return true;
  if (bannedTypes.includes(inline.type)) return true;

  return false;
}

/**
 * Prevents default event behavior, and either collapses to or extends to the start
 * of a node
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Change}
 */

function moveToEndOf(change, node, event) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  event.preventDefault();
  return event.shiftKey ? change.moveFocusToEndOfNode(node).moveFocusForward(offset) : change.moveToEndOfNode(node).moveForward(offset);
}

/**
 * Prevents default event behavior, and either collapses to or extends to the end
 * of a node
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Change}
 */

function moveToStartOf(change, node, event) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  event.preventDefault();
  return event.shiftKey ? change.moveFocusToStartOfNode(node).moveFocusForward(offset) : change.moveToStartOfNode(node);
}