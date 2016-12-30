"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _extends = require("babel-runtime/helpers/extends")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _default = function _default(_ref) {
  var universeI18n = _ref.universeI18n;
  var _ref$options = _ref.options;
  var options = _ref$options === undefined ? {} : _ref$options;

  _classCallCheck(this, _default);

  universeI18n.setOptions(_extends({
    hideMissing: true }, options));
  this.setLocale = universeI18n.setLocale;
  this.getLocale = universeI18n.getLocale;
  this.translate = universeI18n.createReactiveTranslator();
};

exports["default"] = _default;
module.exports = exports["default"];
//# sourceMappingURL=universe_i18n.js.map