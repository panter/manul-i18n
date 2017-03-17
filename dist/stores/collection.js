'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapValues2 = require('lodash/fp/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _keyBy2 = require('lodash/fp/keyBy');

var _keyBy3 = _interopRequireDefault(_keyBy2);

var _sortBy2 = require('lodash/fp/sortBy');

var _sortBy3 = _interopRequireDefault(_sortBy2);

var _flow2 = require('lodash/fp/flow');

var _flow3 = _interopRequireDefault(_flow2);

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _has2 = require('lodash/has');

var _has3 = _interopRequireDefault(_has2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _flat = require('flat');

var _flat2 = _interopRequireDefault(_flat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        Meteor = _ref.Meteor,
        ReactiveVar = _ref.ReactiveVar,
        collection = _ref.collection,
        _ref$publicationName = _ref.publicationName,
        publicationName = _ref$publicationName === undefined ? 'translations' : _ref$publicationName;

    _classCallCheck(this, _class);

    this.publicationName = publicationName;
    this.collection = collection;
    this.Meteor = Meteor;
    this.ReactiveVar = ReactiveVar;
    if (Meteor.isClient) {
      this.initClient();
    } else {
      this.initServer();
    }
  }

  _createClass(_class, [{
    key: 'initClient',
    value: function initClient() {
      this.locale = new this.ReactiveVar();
      this.startSubscription(this.getLocale());
    }
  }, {
    key: 'startSubscription',
    value: function startSubscription(locale) {
      // we keep all old subscription, so no stop or tracker here
      this.Meteor.subscribe(this.publicationName, locale);
    }
  }, {
    key: 'initServer',
    value: function initServer() {
      var _this = this;

      this.Meteor.publish(this.publicationName, function (locale) {
        return _this.collection.find({}, { fields: _defineProperty({}, _this.getValueKey(locale), true) });
      });
    }
  }, {
    key: 'getLocale',
    value: function getLocale() {
      if (this.Meteor.isServer) {
        console.trace('getLocale can only be called on the client, pass _locale to translate if using from server');
        throw new this.Meteor.Error('getLocale can only be called on the client');
      }
      return this.locale.get();
    }
  }, {
    key: 'setLocale',
    value: function setLocale(locale) {
      if (this.Meteor.isServer) {
        throw new this.Meteor.Error('setLocale can only be called on the client');
      }
      this.locale.set(locale);
      this.startSubscription(locale); // restart
    }
    /* eslint class-methods-use-this: 0*/

  }, {
    key: 'getValueKey',
    value: function getValueKey(locale) {
      return 'value_' + locale;
    }
  }, {
    key: 'translate',
    value: function translate(keyOrNamespace) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _options$_locale = options._locale,
          _locale = _options$_locale === undefined ? this.getLocale() : _options$_locale,
          params = _objectWithoutProperties(options, ['_locale']);
      // if locale is different (e.g. fallback), subscribe to that locale as well
      // so that it will be available soon


      if (this.Meteor.isClient && _locale !== this.getLocale()) {
        this.startSubscription(_locale);
      }
      if (!keyOrNamespace) {
        return '';
      }

      var results = this.findResultsForKey(keyOrNamespace);

      var getValue = function getValue(entry) {
        if ((0, _has3.default)(entry, _this2.getValueKey(_locale))) {
          return _this2._replaceParamsInString((0, _get3.default)(entry, _this2.getValueKey(_locale)), params);
        }
        return null;
      };
      var object = (0, _flat.unflatten)((0, _flow3.default)((0, _sortBy3.default)(function (_ref2) {
        var _id = _ref2._id;
        return _id.length;
      }), (0, _keyBy3.default)('_id'), (0, _mapValues3.default)(getValue))(results), { overwrite: true });
      var objectOrString = (0, _get3.default)(object, keyOrNamespace);
      if (!(0, _isString3.default)(objectOrString) && (0, _isEmpty3.default)(objectOrString)) {
        // empty object or undefined
        return null;
      }
      return objectOrString;
    }
  }, {
    key: 'has',
    value: function has(keyOrNamespace) {
      return this.collection.findOne(keyOrNamespace);
    }
  }, {
    key: 'hasObject',
    value: function hasObject(keyOrNamespace) {
      return this.findResultsForKey(keyOrNamespace).length > 1;
    }
  }, {
    key: 'findResultsForKey',
    value: function findResultsForKey(keyOrNamespace) {
      var result = this.collection.findOne(keyOrNamespace);
      if (!result) {
        // a parent is requested, find all childs that start with keyOrNamespace
        // this is slow, so we do it only if there is no exact key
        return this.collection.find({ _id: { $regex: keyOrNamespace + '/*' } }).fetch();
      }
      return [result];
    }
  }, {
    key: '_replaceParamsInString',
    value: function _replaceParamsInString(string, paramsUnflatted) {
      // flat params if not flat
      var params = (0, _flat2.default)(paramsUnflatted);
      var open = '{$';
      var close = '}';
      var replacedString = string;
      Object.keys(params).forEach(function (param) {
        var substitution = (0, _get3.default)(params, param, '');
        replacedString = replacedString.split(open + param + close).join(substitution);
      });
      return replacedString;
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=collection.js.map