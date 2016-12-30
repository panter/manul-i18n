'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _flat = require('flat');

var _flat2 = _interopRequireDefault(_flat);

exports['default'] = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$override = _ref.override;
  var override = _ref$override === undefined ? false : _ref$override;
  var translations = _ref.translations;
  var collection = _ref.collection;
  var _ref$locales = _ref.locales;
  var locales = _ref$locales === undefined ? ['de', 'en', 'it', 'fr'] : _ref$locales;

  var entries = new _Map();

  var valueKeyForLocale = function valueKeyForLocale(locale) {
    return 'value_' + locale;
  };
  locales.forEach(function (locale) {
    var translationsForLocale = translations[locale];
    if (!_lodash2['default'].isEmpty(translationsForLocale)) {
      var translationsFlat = (0, _flat2['default'])(translationsForLocale);
      _lodash2['default'].forEach(translationsFlat, function (value, key) {
        if (!entries.has(key)) {
          entries.set(key, _lodash2['default'].zipObject(_lodash2['default'].map(locales, function (locale) {
            return valueKeyForLocale(locale);
          }), _lodash2['default'].map(locales, function (locale) {
            return null;
          })));
        }
        entries.get(key)[valueKeyForLocale(locale)] = value;
      });
    }
  });

  console.log('--- importing i18n into collection --');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(entries), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var key = _step$value[0];
      var value = _step$value[1];

      if (collection.findOne(key)) {
        if (override) {
          collection.update(key, { $set: value });
          console.log('updated', key);
        } else {
          // console.log('skipped', key);
        }
      } else {
          collection.insert(_extends({ _id: key }, value));
          console.log('inserted', key);
        }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

module.exports = exports['default'];
//# sourceMappingURL=import_into_collection.js.map