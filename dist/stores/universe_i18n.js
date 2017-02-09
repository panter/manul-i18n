'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _default = function _default(_ref) {
  var _this = this;

  var universeI18n = _ref.universeI18n;
  var _ref$options = _ref.options;
  var options = _ref$options === undefined ? {} : _ref$options;

  _classCallCheck(this, _default);

  universeI18n.setOptions(_extends({
    hideMissing: true }, options));
  this.setLocale = universeI18n.setLocale;
  this.getLocale = universeI18n.getLocale;
  this.translate = universeI18n.createReactiveTranslator();
  this.has = function (keyOrNamespace) {
    return _lodash2['default'].isString(_this.translate(keyOrNamespace));
  };
  this.hasObject = function (keyOrNamespace) {
    return _lodash2['default'].isObject(_this.translate(keyOrNamespace));
  };
};

exports['default'] = _default;
module.exports = exports['default'];
//# sourceMappingURL=universe_i18n.js.map