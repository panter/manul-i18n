'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mantraCore = require('mantra-core');

var _reactKomposer = require('react-komposer');

var _manulI18n = require('./manul-i18n');

var _manulI18n2 = _interopRequireDefault(_manulI18n);

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
  var children = _ref.children;
  var _id = _ref._id;
  return _id || (_lodash2['default'].isString(children) ? children : null);
};

var getTranslation = function getTranslation(i18n, _ref2) {
  var doc = _ref2.doc;
  var _id = _ref2._id;
  var disableEditorBypass = _ref2.disableEditorBypass;
  var children = _ref2.children;

  var params = _objectWithoutProperties(_ref2, ['doc', '_id', 'disableEditorBypass', 'children']);

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
  var _context2 = context();

  var i18n = _context2.i18n;

  var locale = i18n.getLocale();
  var translationId = getTranslationId(props);
  var translation = getTranslation(i18n, props);

  var isEditMode = i18n.isEditMode();
  var gotoEdit = function gotoEdit() {
    if (_lodash2['default'].isFunction(i18n.editTranslationAction)) {
      // call function
      i18n.editTranslationAction(translationId);
    } else if (_lodash2['default'].isString(i18n.editTranslationAction)) {
      // call mantra action
      _lodash2['default'].invoke(props.actions, i18n.editTranslationAction, translationId);
    }
  };
  if (props.doc) {
    // no edit mode highlighting for docs yet and no gotoEdit;
    gotoEdit = _lodash2['default'].noop;
    isEditMode = false;
  }
  return { translationId: translationId, gotoEdit: gotoEdit, translation: translation, locale: locale, isEditMode: isEditMode };
};

var composer = function composer(_ref3, onData) {
  var context = _ref3.context;

  var props = _objectWithoutProperties(_ref3, ['context']);

  onData(null, getTranslationProps(context, props));
};
exports.composer = composer;
var depsMapper = function depsMapper(_context, actions) {
  return {
    context: function context() {
      return _context;
    },
    actions: actions
  };
};

exports.depsMapper = depsMapper;
var Component = function Component(_ref4) {
  var isEditMode = _ref4.isEditMode;
  var gotoEdit = _ref4.gotoEdit;
  var locale = _ref4.locale;
  var _tagType = _ref4._tagType;
  var _ref4$_props = _ref4._props;

  var _props = _ref4$_props === undefined ? {} : _ref4$_props;

  var translation = _ref4.translation;
  var children = _ref4.children;

  if (_lodash2['default'].isFunction(children)) {
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
  return _react2['default'].createElement(_tagType || 'span', _extends({}, _props, editorProps, {
    dangerouslySetInnerHTML: {
      __html: translation
    },
    key: locale
  }));
};

Component.displayName = 'T';

var composeWithTrackerServerSave = _lodash2['default'].get(global, 'Meteor.isServer') ? _mantraCore.compose : _mantraCore.composeWithTracker;
var T = (0, _mantraCore.composeAll)(composeWithTrackerServerSave(composer), (0, _mantraCore.useDeps)(depsMapper))(Component);

T.displayName = 'T';

(0, _reactKomposer.setComposerStub)(T, function (props) {
  var stubContext = function stubContext() {
    return {
      i18n: new _manulI18n2['default']({
        translationStore: {
          setLocale: _lodash2['default'].noop,
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

exports['default'] = T;
//# sourceMappingURL=translation_container.js.map