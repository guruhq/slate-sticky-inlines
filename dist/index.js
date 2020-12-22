"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slateReact = require("slate-react");

var _constants = require("./constants");

var _onArrowLeft = require("./onArrowLeft");

var _onArrowLeft2 = _interopRequireDefault(_onArrowLeft);

var _onArrowRight = require("./onArrowRight");

var _onArrowRight2 = _interopRequireDefault(_onArrowRight);

var _onBackspace = require("./onBackspace");

var _onBackspace2 = _interopRequireDefault(_onBackspace);

var _onDelete = require("./onDelete");

var _onDelete2 = _interopRequireDefault(_onDelete);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaults = {
  allowedTypes: null,
  bannedTypes: [],
  hasStickyBoundaries: true,
  canBeEmpty: true,
  stickOnDelete: true
};

/**
 * Cross Boundaries on Left Arrow, or Right arrow
 * when on the Start or End of an inline boundary
 * can delete all the text inside and still type to add more
 *
 * @param {Object} options
 *   @property {Array} allowedTypes (optional)
 *   @property {Array} bannedTypes (optional)
 *   @property {Boolean} hasStickyBoundaries (optional)
 *   @property {Boolean} canBeEmpty (optional)
 *   @property {Boolean} stickOnDelete (optional)
 * @return {Object} plugin
 */

function StickyInlines(opts) {
  opts = Object.assign({}, defaults, opts);
  var _opts = opts,
      allowedTypes = _opts.allowedTypes,
      bannedTypes = _opts.bannedTypes,
      hasStickyBoundaries = _opts.hasStickyBoundaries,
      canBeEmpty = _opts.canBeEmpty;


  if (allowedTypes && !Array.isArray(allowedTypes)) {
    console.warn("slate-sticky-inline: allowedTypes must be an Array of Strings");
  }
  if (!Array.isArray(bannedTypes)) {
    console.warn("slate-sticky-inlines: bannedTypes must be an Array of Strings");
  }

  /**
   * Keydown entry point.
   *
   * @param {Event} event
   * @param {Change} change
   * @param {Editor} editor
   * @return {Change}
   */

  function onKeyDown(event, change, editor) {
    // We are working inside a specific inline, and they specifically said they don't want it to be sticky.
    if (change.value.focusInline && (0, _utils.isInlineBanned)(change.value.schema, change.value.focusInline, opts)) return null;

    // They are moving the caret around, let's see if we need to interfere.
    switch (event.which) {
      case _constants.ARROW_LEFT:
        return (0, _onArrowLeft2.default)(event, change, editor, opts);
      case _constants.ARROW_RIGHT:
        return (0, _onArrowRight2.default)(event, change, editor, opts);
      case _constants.BACKSPACE:
        return (0, _onBackspace2.default)(event, change, editor, opts);
      case _constants.DELETE:
        return (0, _onDelete2.default)(event, change, editor, opts);
      default:
        return null;
    }
  }

  /**
   * Change entry point.  Used right now to clean up non-focused empty inline artifacts
   *
   * @param {Change} change
   * @return {Change}
   */

  function onChange(change) {
    if (!canBeEmpty) return null;
    var toRemove = change.value.document.getInlines().reduce(function (failures, inline) {
      var hasFocus = change.value.selection.isFocused && change.value.selection.anchor.isInNode(inline);
      var onlyHasZeroWidthSpace = inline.text === _constants.ZERO_WIDTH_SPACE;

      if ((0, _utils.isInlineBanned)(change.value.schema, inline, opts)) return failures;
      return !hasFocus && onlyHasZeroWidthSpace ? [inline].concat(_toConsumableArray(failures)) : failures;
    }, []);

    if (!toRemove.length) return null;

    toRemove.forEach(function (failure) {
      return change = change.removeNodeByKey(failure.key);
    });
    return true;
  }

  /**
   * Select entry point.  Simply blocks the core onSelect if we
   * set the selection ourselves. It tries to force selections at the end of an
   * inline block to be the next text node over.
   *
   * @param {Event} event
   * @param {Change} change
   * @return {Change}
   */

  function onSelect(event, change) {
    if (!change.value.focusInline) return null;
    var selection = (0, _slateReact.findRange)(window.getSelection(), change.value);
    if (!selection) return null;
    var focusInline = change.value.document.getClosestInline(selection.anchor.key);
    if (!focusInline) return null;

    var selectionIsAtEndOfInline = focusInline.key === change.value.focusInline.key && selection.focus.offset === focusInline.text.length;

    if (selection.isCollapsed && selectionIsAtEndOfInline) {
      return change;
    }

    return null;
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown: onKeyDown,
    onChange: onChange,
    onSelect: onSelect
  };
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = StickyInlines;