/**
available in context as i18n.

i18n.t(key, props): translate the given key (caution: only reactive in tracker-komposer)

**/
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var I18nClient = (function () {
  function I18nClient(_ref) {
    var translationStore = _ref.translationStore;
    var _ref$supportedLocales = _ref.supportedLocales;
    var // mandatory
    supportedLocales = _ref$supportedLocales === undefined ? ['en'] : _ref$supportedLocales;
    var _ref$defaultLocale = _ref.defaultLocale;
    var defaultLocale = _ref$defaultLocale === undefined ? 'en' : _ref$defaultLocale;
    var _ref$useFallbackForMissing = _ref.useFallbackForMissing;
    var
    // whether it should use fallback locale if translation is missing
    // the rule is the following: xx_XX --> xx --> defaultLocale
    useFallbackForMissing = _ref$useFallbackForMissing === undefined ? true : _ref$useFallbackForMissing;
    var _ref$isEditMode = _ref.isEditMode;
    var

    // pass function as isEditMode that uses a reactive data-source
    // if you do so and it changes to true,
    // all of your translations will show their keys
    // also, if you click on one of your translations (via T),
    // editTranslationAction will be called
    isEditMode = _ref$isEditMode === undefined ? function () {
      return false;
    } : _ref$isEditMode;
    var _ref$editTranslationAction = _ref.editTranslationAction;
    var editTranslationAction = _ref$editTranslationAction === undefined ? function (translationId) {
      /* eslint no-console: 0*/
      console.log('define editTranslationAction in I18nConstructor');
      console.log('you can define a mantra-action (string)');
      console.log('or you can define a function');
      console.log('would edit ' + translationId);
    } : _ref$editTranslationAction;
    var _ref$shouldShowKeysAsFallback = _ref.shouldShowKeysAsFallback;
    var
    // shouldShowKeysAsFallback defines whether it should show the keys of translation
    // if the translation is not available (can also be reactive datasource)
    // this is usefull for admins and/or in development-environement
    shouldShowKeysAsFallback = _ref$shouldShowKeysAsFallback === undefined ? function () {
      return false;
    } : _ref$shouldShowKeysAsFallback;

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

      var key = undefined;
      if (_lodash2['default'].isArray(keyOrArrayOfKeys)) {
        key = _lodash2['default'].find(keyOrArrayOfKeys, function (k) {
          return _this.has(k);
        });
        if (_lodash2['default'].isNil(key)) {
          key = _lodash2['default'].last(keyOrArrayOfKeys);
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
      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref2$useFallbackForMissing = _ref2.useFallbackForMissing;
      var useFallbackForMissing = _ref2$useFallbackForMissing === undefined ? false : _ref2$useFallbackForMissing;
      var _ref2$showKeyForMissing = _ref2.showKeyForMissing;
      var showKeyForMissing = _ref2$showKeyForMissing === undefined ? false : _ref2$showKeyForMissing;
      var _ref2$disableEditorBypass = _ref2.disableEditorBypass;
      var disableEditorBypass = _ref2$disableEditorBypass === undefined ? false : _ref2$disableEditorBypass;
      var _ref2$nullKeyValue = _ref2.nullKeyValue;
      var nullKeyValue = _ref2$nullKeyValue === undefined ? '! no translationId given !' : _ref2$nullKeyValue;

      if (!keyOrNamespace) {
        return nullKeyValue;
      }
      if (!disableEditorBypass && this.isEditMode()) {
        return keyOrNamespace;
      }
      var translation = this.translationStore.translate(keyOrNamespace, props);
      if (!_lodash2['default'].isNil(translation)) {
        return translation;
      }
      var fallbackLocale = this.getFallbackLocale();
      if ((useFallbackForMissing || this.useFallbackForMissing) && this.getLocale() !== fallbackLocale) {
        translation = this.translationStore.translate(keyOrNamespace, _extends({}, props, { _locale: fallbackLocale }));
      }
      // if still nil and is editor, return key if allowed
      if (!_lodash2['default'].isNil(translation)) {
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
      var propertyKey = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      // closure helpers
      var path = function path(locale) {
        return propertyKey ? propertyKey + '.' + locale : locale;
      };
      var t = function t(locale) {
        return _lodash2['default'].get(doc, path(locale));
      };

      var translation = t(this.getLocale());
      if (!_lodash2['default'].isNil(translation)) {
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

      var _locale$split = locale.split('-');

      var _locale$split2 = _slicedToArray(_locale$split, 1);

      var lang = _locale$split2[0];

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
})();

exports['default'] = I18nClient;
module.exports = exports['default'];
//# sourceMappingURL=i18n_service.js.map