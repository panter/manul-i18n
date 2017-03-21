'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map2 = require('babel-runtime/core-js/map');

var _map3 = _interopRequireDefault(_map2);

var _map4 = require('lodash/map');

var _map5 = _interopRequireDefault(_map4);

var _zipObject2 = require('lodash/zipObject');

var _zipObject3 = _interopRequireDefault(_zipObject2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _flat = require('flat');

var _flat2 = _interopRequireDefault(_flat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-shadow: 0*/
exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$override = _ref.override,
      override = _ref$override === undefined ? false : _ref$override,
      translations = _ref.translations,
      collection = _ref.collection,
      _ref$locales = _ref.locales,
      locales = _ref$locales === undefined ? ['de', 'en', 'it', 'fr'] : _ref$locales;

  var entries = new _map3.default();

  var valueKeyForLocale = function valueKeyForLocale(locale) {
    return 'value_' + locale;
  };
  locales.forEach(function (locale) {
    var translationsForLocale = translations[locale];
    if (!(0, _isEmpty3.default)(translationsForLocale)) {
      var translationsFlat = (0, _flat2.default)(translationsForLocale);
      (0, _forEach3.default)(translationsFlat, function (value, key) {
        if (!entries.has(key)) {
          entries.set(key, (0, _zipObject3.default)((0, _map5.default)(locales, function (locale) {
            return valueKeyForLocale(locale);
          }), (0, _map5.default)(locales, function () {
            return null;
          })));
        }
        entries.get(key)[valueKeyForLocale(locale)] = value;
      });
    }
  });

  console.log('--- importing i18n into collection --');
  /* eslint no-restricted-syntax: 0*/
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(entries), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
          key = _step$value[0],
          value = _step$value[1];

      if (collection.findOne(key)) {
        if (override) {
          collection.update(key, { $set: value });
          console.log('updated', key);
        } else {
          // console.log('skipped', key);
        }
      } else {
        collection.insert((0, _extends3.default)({ _id: key }, value));
        console.log('inserted', key);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};
//# sourceMappingURL=import_into_collection.js.map