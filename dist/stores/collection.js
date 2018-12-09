'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _has2 = require('lodash/has');

var _has3 = _interopRequireDefault(_has2);

var _mapValues2 = require('lodash/fp/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _keyBy2 = require('lodash/fp/keyBy');

var _keyBy3 = _interopRequireDefault(_keyBy2);

var _sortBy2 = require('lodash/fp/sortBy');

var _sortBy3 = _interopRequireDefault(_sortBy2);

var _flow2 = require('lodash/fp/flow');

var _flow3 = _interopRequireDefault(_flow2);

var _flat = require('flat');

var _flat2 = _interopRequireDefault(_flat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        Meteor = _ref.Meteor,
        Ground = _ref.Ground,
        collection = _ref.collection,
        _ref$publicationName = _ref.publicationName,
        publicationName = _ref$publicationName === undefined ? 'translations' : _ref$publicationName,
        _ref$useMethod = _ref.useMethod,
        useMethod = _ref$useMethod === undefined ? false : _ref$useMethod,
        Tracker = _ref.Tracker;

    (0, _classCallCheck3.default)(this, _class);

    this.Ground = Ground;
    this.Tracker = Tracker;
    this.publicationName = publicationName;
    this.collection = collection;
    this.Meteor = Meteor;

    this.useMethod = useMethod;
    this.subscriptions = {};
    if (this.useMethod && !Ground) {
      throw new Error('please use ground-collection if using method calls');
    }

    if (Meteor.isClient) {
      this.initClient();
    } else {
      this.initServer();
    }
  }

  (0, _createClass3.default)(_class, [{
    key: 'initClient',
    value: function initClient() {
      if (this.Ground) {
        this.collectionGrounded = new this.Ground.Collection(this.collection._name + '-grounded');
        if (!this.useMethod) {
          this.collectionGrounded.observeSource(this.collection.find());
        }
      }
    }
  }, {
    key: 'startSubscription',
    value: function startSubscription(locale) {
      var _this = this;

      if (this.Meteor.isServer) {
        return;
      }
      if (!locale || this.subscriptions[locale]) {
        return; // do not resubscribe;
      }
      if (this.useMethod) {
        this.subscriptions[locale] = true;
        this.Meteor.call('_translations', locale, function (error, translations) {
          if (!error) {
            var usedIds = [];
            translations.forEach(function (_ref2) {
              var _id = _ref2._id,
                  translation = (0, _objectWithoutProperties3.default)(_ref2, ['_id']);

              try {
                _this.getCollection().upsert({ _id: _id }, { $set: translation });
                usedIds.push(_id);
              } catch (e) {
                // some upserts might throw error (if id is accidentaly an objectid)
                console.log(e);
              }
            });
            _this.getCollection().remove({ _id: { $nin: usedIds } });
          }
        });
      } else {
        this.Tracker.nonreactive(function () {
          // we keep all old subscription, so no stop or tracker here
          _this.subscriptions[locale] = _this.Meteor.subscribe(_this.publicationName, locale, function () {
            if (_this.collectionGrounded) {
              // reset and keep only new ones
              _this.collectionGrounded.keep(_this.collection.find());
            }
          });
        });
      }
    }
  }, {
    key: 'initServer',
    value: function initServer() {
      var that = this;
      this.Meteor.methods({
        _translations: function _translations(locale) {
          return that.collection.find({}, { fields: (0, _defineProperty3.default)({}, that.getValueKey(locale), true) }).fetch();
        }
      });
      this.Meteor.publish(this.publicationName, function publishTranslations(locale) {
        if (!locale) {
          this.ready();
          return null;
        }

        return that.collection.find({}, { fields: (0, _defineProperty3.default)({}, that.getValueKey(locale), true) });
      });
    }

    /* eslint class-methods-use-this: 0*/

  }, {
    key: 'getValueKey',
    value: function getValueKey(locale) {
      return 'value_' + locale;
    }
  }, {
    key: '_getValue',
    value: function _getValue(entry, locale, params) {
      if ((0, _has3.default)(entry, this.getValueKey(locale))) {
        return this._replaceParamsInString((0, _get3.default)(entry, this.getValueKey(locale)), params);
      }
      return null;
    }
  }, {
    key: 'translate',
    value: function translate(locale, keyOrNamespace) {
      var _this2 = this;

      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // if locale is different (e.g. fallback), subscribe to that locale as well
      // so that it will be available soon
      if (this.Meteor.isClient) {
        this.startSubscription(locale);
      }
      if (!keyOrNamespace) {
        return '';
      }

      var entryByKey = this._findEntryForKey(keyOrNamespace);

      if (entryByKey) {
        return this._getValue(entryByKey, locale, params);
      } else if (this.useMethod || this.Meteor.isServer || this.Meteor.isClient
      // || this.subscriptions[locale].ready()
      ) {
          // try to find for namespace
          // this is expensive, so we do it only if subscription is ready
          var entries = this._findEntriesForNamespace(keyOrNamespace);
          var fullObject = (0, _flat.unflatten)((0, _flow3.default)((0, _sortBy3.default)(function (_ref3) {
            var _id = _ref3._id;
            return _id.length;
          }), (0, _keyBy3.default)('_id'), (0, _mapValues3.default)(function (entry) {
            return _this2._getValue(entry, locale, params);
          }))(entries), { overwrite: true });
          var objectForNamespace = (0, _get3.default)(fullObject, keyOrNamespace);
          if ((0, _isEmpty3.default)(objectForNamespace)) {
            return null;
          }
          return objectForNamespace;
        }
      return null;
    }
  }, {
    key: 'getCollection',
    value: function getCollection() {
      return this.collectionGrounded || this.collection;
    }
  }, {
    key: 'has',
    value: function has(keyOrNamespace) {
      return this.getCollection().findOne(keyOrNamespace);
    }
  }, {
    key: 'hasObject',
    value: function hasObject(namespace) {
      return this.findResultsForNamespace(namespace).length > 1;
    }

    /**
    returns either one or multiple results
    multiple results means that an namespace was requested
    **/

  }, {
    key: '_findEntryForKey',
    value: function _findEntryForKey(keyOrNamespace) {
      return this.getCollection().findOne(keyOrNamespace);
    }
  }, {
    key: '_findEntriesForNamespace',
    value: function _findEntriesForNamespace(namespace) {
      // console.log('doing expensive fetch', namespace);
      return this.getCollection().find({ _id: { $regex: '^' + namespace } }).fetch();
    }
  }, {
    key: '_replaceParamsInString',
    value: function _replaceParamsInString(string, paramsUnflatted) {
      // flat params if not flat
      var params = (0, _flat2.default)(paramsUnflatted);
      var open = '{$';
      var close = '}';
      var replacedString = string;
      if (!replacedString) {
        return replacedString;
      }
      (0, _keys2.default)(params).forEach(function (param) {
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