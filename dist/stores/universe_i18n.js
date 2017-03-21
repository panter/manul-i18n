'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function _class(_ref) {
  var _this = this;

  var universeI18n = _ref.universeI18n,
      _ref$options = _ref.options,
      options = _ref$options === undefined ? {} : _ref$options;
  (0, _classCallCheck3.default)(this, _class);

  universeI18n.setOptions((0, _extends3.default)({
    hideMissing: true }, options));
  this.setLocale = universeI18n.setLocale;
  this.getLocale = universeI18n.getLocale;
  this.translate = universeI18n.createReactiveTranslator();
  this.has = function (keyOrNamespace) {
    return (0, _isString3.default)(_this.translate(keyOrNamespace));
  };
  this.hasObject = function (keyOrNamespace) {
    return (0, _isObject3.default)(_this.translate(keyOrNamespace));
  };
};

exports.default = _class;
//# sourceMappingURL=universe_i18n.js.map