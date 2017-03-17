'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.depsMapper = exports.composer = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _invoke2 = require('lodash/invoke');

var _invoke3 = _interopRequireDefault(_invoke2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mantraCore = require('mantra-core');

var _reactKomposer = require('react-komposer');

var _i18n_service = require('./i18n_service');

var _i18n_service2 = _interopRequireDefault(_i18n_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**

                 MR T

                 `sdddh-
                +MMMMMy
                -ddddh+
                           :+
          +N/             /MN
          :M.              ms
           d               s+
           y`              s/
           :/     ``      .N:
            o+-+hmdhhddy-:mM`
             hMM+     .dMMMy
             `dMm-:ss.-NMNo
               +mMNNNmMNo`
                 .+sys:

      "The jibba jabba stops here!"


  Mr. T translates your stuff:

  translate single key from the translation store (will render as <span>)
  <T>home.content.title</T>

  If you can't use react-node, but need a plan string, pass a function as child:
  <T _id="home.content.image.alttext">{(altText) => <img alt={altText} src="..." />}</T>

  MR. T can also pick properites from objects/documents by path.
  E.g. this reads the object page.meta.title.<current locale>
  <T doc={page} >meta.title</T>

  also works with function-children:
  <T doc={page} _id="meta.title">{(altText) => <img alt={altText} src="..." />}</T>

  If you have simple object with keys as locales, e.g.
  const myProperty = {
    de: "German",
    fr: "French",
    it: "English"
  }

  you can also use Mr. T to display the right translation (empty path)

  <T doc={myProperty} />

  Advanced:
  ---------

  If i18n isEditMode() returns true (reactivly),
  it will render the key instead of the translation (does not work for doc-paths currently).

  pass property disableEditorBypass to disable this feature on a <T>:
  <T disableEditorBypass>path.to.key</T>

  if i18n-service provides a editTranslationAction and i18n isEditMode() is true
  a click on <T> will call this function / mantra-action

  inspired by https://github.com/vazco/meteor-universe-i18n
  © Panter 2016

**/

var getTranslationId = function getTranslationId(_ref) {
  var children = _ref.children,
      _id = _ref._id;
  return _id || ((0, _isString3.default)(children) ? children : null);
};

var getTranslation = function getTranslation(i18n, _ref2) {
  var doc = _ref2.doc,
      _id = _ref2._id,
      disableEditorBypass = _ref2.disableEditorBypass,
      children = _ref2.children,
      params = (0, _objectWithoutProperties3.default)(_ref2, ['doc', '_id', 'disableEditorBypass', 'children']);

  var translationId = getTranslationId({ children: children, _id: _id });
  if (doc) {
    return i18n.tDoc(doc, translationId);
  }
  return i18n.t(translationId, params, { disableEditorBypass: disableEditorBypass });
};

/**
this function is outside of the composer so that it can be used in stubbing mode more easily
**/
var getTranslationProps = function getTranslationProps(context, props) {
  var _context = context(),
      i18n = _context.i18n;

  var locale = i18n.getLocale();
  var translationId = getTranslationId(props);
  var translation = getTranslation(i18n, props);

  var isEditMode = i18n.isEditMode();
  var gotoEdit = function gotoEdit() {
    if ((0, _isFunction3.default)(i18n.editTranslationAction)) {
      // call function
      i18n.editTranslationAction(translationId);
    } else if ((0, _isString3.default)(i18n.editTranslationAction)) {
      // call mantra action
      (0, _invoke3.default)(props.actions, i18n.editTranslationAction, translationId);
    }
  };
  if (props.doc) {
    // no edit mode highlighting for docs yet and no gotoEdit;
    gotoEdit = _noop3.default;
    isEditMode = false;
  }
  return { translationId: translationId, gotoEdit: gotoEdit, translation: translation, locale: locale, isEditMode: isEditMode };
};

var composer = function composer(_ref3, onData) {
  var context = _ref3.context,
      props = (0, _objectWithoutProperties3.default)(_ref3, ['context']);

  onData(null, getTranslationProps(context, props));
};
exports.composer = composer;
var depsMapper = exports.depsMapper = function depsMapper(_context2, actions) {
  return {
    context: function context() {
      return _context2;
    },
    actions: actions
  };
};

var Component = function Component(_ref4) {
  var isEditMode = _ref4.isEditMode,
      gotoEdit = _ref4.gotoEdit,
      locale = _ref4.locale,
      _tagType = _ref4._tagType,
      _ref4$_props = _ref4._props,
      _props = _ref4$_props === undefined ? {} : _ref4$_props,
      translation = _ref4.translation,
      children = _ref4.children;

  if ((0, _isFunction3.default)(children)) {
    return children(translation);
  }
  var editorProps = {
    style: {
      cursor: isEditMode && 'pointer',
      textTransform: isEditMode && 'none'
    },
    onClick: function onClick() {
      return isEditMode && gotoEdit ? gotoEdit() : null;
    }
  };
  return _react2.default.createElement(_tagType || 'span', (0, _extends3.default)({}, _props, editorProps, {
    dangerouslySetInnerHTML: {
      __html: translation
    },
    key: locale
  }));
};

Component.displayName = 'T';

var composeWithTrackerServerSave = (0, _get3.default)(global, 'Meteor.isServer') ? _mantraCore.compose : _mantraCore.composeWithTracker;
var T = (0, _mantraCore.composeAll)(composeWithTrackerServerSave(composer), (0, _mantraCore.useDeps)(depsMapper))(Component);

T.displayName = 'T';

(0, _reactKomposer.setComposerStub)(T, function (props) {
  var stubContext = function stubContext() {
    return {
      i18n: new _i18n_service2.default({
        translationStore: {
          setLocale: _noop3.default,
          getLocale: function getLocale() {
            return 'de';
          },
          translate: function translate(key) {
            return key;
          }
        },
        supportedLocales: ['de'],
        defaultLocale: 'de'
      })
    };
  };
  return getTranslationProps(stubContext, props);
});

exports.default = T;
//# sourceMappingURL=translation_container.js.map