'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _flat = require('flat');

var _default = (function () {
  function _default() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var Meteor = _ref.Meteor;
    var ReactiveVar = _ref.ReactiveVar;
    var // only needed on client
    collection = _ref.collection;
    var _ref$publicationName = _ref.publicationName;
    var publicationName = _ref$publicationName === undefined ? 'translations' : _ref$publicationName;
    var _ref$methodLogMissingKeyName = _ref.methodLogMissingKeyName;
    var methodLogMissingKeyName = _ref$methodLogMissingKeyName === undefined ? 'translations.logMissingKey' : _ref$methodLogMissingKeyName;

    _classCallCheck(this, _default);

    this.methodLogMissingKeyName = methodLogMissingKeyName;
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

  _createClass(_default, [{
    key: 'initClient',
    value: function initClient() {
      this.locale = new this.ReactiveVar();
      this.subscription = this.Meteor.subscribe(this.publicationName);
    }
  }, {
    key: 'initServer',
    value: function initServer() {
      var _this = this;

      this.Meteor.publish(this.publicationName, function () {
        return _this.collection.find({});
      });
    }
  }, {
    key: 'getLocale',
    value: function getLocale() {
      if (this.Meteor.isServer) {
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
      return this.locale.set(locale);
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

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var _options$_locale = options._locale;

      var _locale = _options$_locale === undefined ? this.getLocale() : _options$_locale;

      var params = _objectWithoutProperties(options, ['_locale']);

      if (!keyOrNamespace) {
        return '';
      }

      var results = this.findResultsForKey(keyOrNamespace);

      var getValue = function getValue(entry) {
        if (_lodash2['default'].has(entry, _this2.getValueKey(_locale))) {
          return _this2._replaceParamsInString(_lodash2['default'].get(entry, _this2.getValueKey(_locale)), params);
        }
        return null;
      };
      var object = (0, _flat.unflatten)(_lodash2['default'].chain(results).sortBy(function (_ref2) {
        var _id = _ref2._id;
        return _id.length;
      }).keyBy('_id').mapValues(getValue).value(), { overwrite: true });
      var objectOrString = _lodash2['default'].get(object, keyOrNamespace);
      if (!_lodash2['default'].isString(objectOrString) && _lodash2['default'].isEmpty(objectOrString)) {
        // empty object or undefined
        return null;
      }
      return objectOrString;
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
    value: function _replaceParamsInString(string, params) {
      var open = '{$';
      var close = '}';
      var replacedString = string;
      _Object$keys(params).forEach(function (param) {
        var substitution = _lodash2['default'].get(params, param, '');
        replacedString = replacedString.split(open + param + close).join(substitution);
      });
      return replacedString;
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];
//# sourceMappingURL=collection.js.map