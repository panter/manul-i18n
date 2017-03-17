'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function _class(_ref) {
  var _this = this;

  var universeI18n = _ref.universeI18n,
      _ref$options = _ref.options,
      options = _ref$options === undefined ? {} : _ref$options;

  _classCallCheck(this, _class);

  universeI18n.setOptions(_extends({
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