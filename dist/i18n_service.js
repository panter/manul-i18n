'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _last2 = require('lodash/last');

var _last3 = _interopRequireDefault(_last2);

var _isNil2 = require('lodash/isNil');

var _isNil3 = _interopRequireDefault(_isNil2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
available in context as i18n.

i18n.t(key, props): translate the given key (caution: only reactive in tracker-komposer)

**/
var I18nClient = function () {
  function I18nClient(_ref) {
    var translationStore = _ref.translationStore,
        _ref$supportedLocales = _ref.supportedLocales,
        supportedLocales = _ref$supportedLocales === undefined ? ['en'] : _ref$supportedLocales,
        _ref$defaultLocale = _ref.defaultLocale,
        defaultLocale = _ref$defaultLocale === undefined ? 'en' : _ref$defaultLocale,
        _ref$useFallbackForMi = _ref.useFallbackForMissing,
        useFallbackForMissing = _ref$useFallbackForMi === undefined ? true : _ref$useFallbackForMi,
        _ref$isEditMode = _ref.isEditMode,
        isEditMode = _ref$isEditMode === undefined ? function () {
      return false;
    } : _ref$isEditMode,
        _ref$editTranslationA = _ref.editTranslationAction,
        editTranslationAction = _ref$editTranslationA === undefined ? function (translationId) {
      /* eslint no-console: 0*/
      console.log('define editTranslationAction in I18nConstructor');
      console.log('you can define a mantra-action (string)');
      console.log('or you can define a function');
      console.log('would edit ' + translationId);
    } : _ref$editTranslationA,
        _ref$shouldShowKeysAs = _ref.shouldShowKeysAsFallback,
        shouldShowKeysAsFallback = _ref$shouldShowKeysAs === undefined ? function () {
      return false;
    } : _ref$shouldShowKeysAs;

    _classCallCheck(this, I18nClient);

    this.translationStore = translationStore;
    this.isEditMode = isEditMode;
    this.shouldShowKeysAsFallback = shouldShowKeysAsFallback;
    this.editTranslationAction = editTranslationAction;
    this.useFallbackForMissing = useFallbackForMissing;
    this.supportedLocales = supportedLocales;
    this.defaultLocale = defaultLocale;
    this.changeCallbacks = [];
    this.setLocale(defaultLocale);
  }
  /**
     NEW: if param is an array, it will return the first that exists (in any language)
    if no key is found, it uses the last key.
    This is usuefull if you create keys programatically (e.g. by error codes)
    or by convention and have a certain fallback strategy
  **/


  _createClass(I18nClient, [{
    key: 't',
    value: function t(keyOrArrayOfKeys) {
      var _this = this;

      var key = void 0;
      if ((0, _isArray3.default)(keyOrArrayOfKeys)) {
        key = (0, _find3.default)(keyOrArrayOfKeys, function (k) {
          return _this.has(k);
        });
        if ((0, _isNil3.default)(key)) {
          key = (0, _last3.default)(keyOrArrayOfKeys);
        }
      } else {
        key = keyOrArrayOfKeys;
      }

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.tKey.apply(this, [key].concat(args));
    }
  }, {
    key: 'tKey',
    value: function tKey(keyOrNamespace, props) {
      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$useFallbackForM = _ref2.useFallbackForMissing,
          useFallbackForMissing = _ref2$useFallbackForM === undefined ? false : _ref2$useFallbackForM,
          _ref2$showKeyForMissi = _ref2.showKeyForMissing,
          showKeyForMissing = _ref2$showKeyForMissi === undefined ? false : _ref2$showKeyForMissi,
          _ref2$disableEditorBy = _ref2.disableEditorBypass,
          disableEditorBypass = _ref2$disableEditorBy === undefined ? false : _ref2$disableEditorBy,
          _ref2$nullKeyValue = _ref2.nullKeyValue,
          nullKeyValue = _ref2$nullKeyValue === undefined ? '! no translationId given !' : _ref2$nullKeyValue;

      if (!keyOrNamespace) {
        return nullKeyValue;
      }
      if (!disableEditorBypass && this.isEditMode()) {
        return keyOrNamespace;
      }
      var translation = this.translationStore.translate(keyOrNamespace, props);
      if (!(0, _isNil3.default)(translation)) {
        return translation;
      }
      var fallbackLocale = this.getFallbackLocale();
      if ((useFallbackForMissing || this.useFallbackForMissing) && this.getLocale() !== fallbackLocale) {
        translation = this.translationStore.translate(keyOrNamespace, _extends({}, props, { _locale: fallbackLocale }));
      }
      // if still nil and is editor, return key if allowed
      if (!(0, _isNil3.default)(translation)) {
        return translation;
      } else if (showKeyForMissing || this.shouldShowKeysAsFallback()) {
        return keyOrNamespace;
      }
      return null; // we tried :-(
    }
  }, {
    key: 'has',
    value: function has(keyOrNamespace) {
      return this.translationStore.has(keyOrNamespace);
    }
  }, {
    key: 'hasObject',
    value: function hasObject(keyOrNamespace) {
      return this.translationStore.hasObject(keyOrNamespace);
    }

    /**
      translate a certain property from a document.
      It will check if the document has doc[propertyKey].de, .fr, etc.
       if propertyKey is not set, it will fetch doc.de, doc.fr, etc.
    **/

  }, {
    key: 'tDoc',
    value: function tDoc(doc) {
      var propertyKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      // closure helpers
      var path = function path(locale) {
        return propertyKey ? propertyKey + '.' + locale : locale;
      };
      var t = function t(locale) {
        return (0, _get3.default)(doc, path(locale));
      };

      var translation = t(this.getLocale());
      if (!(0, _isNil3.default)(translation)) {
        return translation;
      }
      var fallbackLocale = this.getFallbackLocale();
      if (this.useFallbackForMissing && this.getLocale() !== fallbackLocale) {
        return t(fallbackLocale);
      }
      return null; // no key fallback at the moment
    }
  }, {
    key: 'supports',
    value: function supports(locale) {
      return this.supportedLocales.indexOf(locale) !== -1;
    }
  }, {
    key: 'getFallbackLocale',
    value: function getFallbackLocale(locale) {
      if (!locale) {
        return this.defaultLocale;
      } else if (this.supports(locale)) {
        return locale;
      }

      var _locale$split = locale.split('-'),
          _locale$split2 = _slicedToArray(_locale$split, 1),
          lang = _locale$split2[0];

      if (this.supports(lang)) {
        return lang;
      }
      return this.defaultLocale;
    }
  }, {
    key: 'setLocale',
    value: function setLocale(locale) {
      var fallbackLocale = this.getFallbackLocale(locale);
      this.translationStore.setLocale(fallbackLocale);
      this.changeCallbacks.forEach(function (callback) {
        return callback(fallbackLocale);
      });
    }
  }, {
    key: 'getLocale',
    value: function getLocale() {
      return this.translationStore.getLocale();
    }
  }, {
    key: 'getSupportedLocales',
    value: function getSupportedLocales() {
      return this.supportedLocales;
    }
  }, {
    key: 'onChangeLocale',
    value: function onChangeLocale(callback) {
      this.changeCallbacks.push(callback);
    }
  }]);

  return I18nClient;
}();

exports.default = I18nClient;
//# sourceMappingURL=i18n_service.js.map