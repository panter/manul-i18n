import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
import I18nClient from '/manul-i18n/client';
import React from 'react';
import _ from 'lodash';
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

  If i18n.editModeHighlighting() returns true (reactivly),
  it will render the key instead of the translation (does not work for doc-paths currently).

  pass property disableEditorBypass to disable this feature on a <T>:
  <T disableEditorBypass>path.to.key</T>

  if i18n-service provides a edit-route and i18n.editModeHighlighting() is true
  a click on <T> will jump to this route.

  inspired by https://github.com/vazco/meteor-universe-i18n
  © Panter 2016

**/

const getTranslationId = ({ children, _id }) => (
  _id || (_.isString(children) ? children : null)
);

const getTranslation = (i18n, { doc, _id, disableEditorBypass, children, ...params }) => {
  const translationId = getTranslationId({ children, _id });
  if (doc) {
    return i18n.tDoc(doc, translationId);
  }
  return i18n.t(translationId, params, { disableEditorBypass });
};

/**
this function is outside of the composer so that it can be used in stubbing mode more easily
**/
const getTranslationProps = (context, props) => {
  const { i18n, routeUtils } = context();
  const locale = i18n.getLocale();
  const isEditor = i18n.isEditor();
  const translationId = getTranslationId(props);
  const translation = getTranslation(i18n, props);
  let editModeHighlighting = i18n.editModeHighlighting();
  let gotoEdit = () => routeUtils.go(i18n.editRoute, { _id: translationId });
  if (props.doc) {
      // no edit mode highlighting for docs yet and no gotoEdit;
    gotoEdit = _.noop;
    editModeHighlighting = false;
  }
  return { translationId, gotoEdit, translation, locale, isEditor, editModeHighlighting };
};


export const composer = ({ context, ...props }, onData) => {
  onData(null, getTranslationProps(context, props));
};
export const depsMapper = (context, actions) => ({
  context: () => context,
});

const Component = ({ isEditor, editModeHighlighting, gotoEdit, locale, translationId, _tagType, _props = {}, translation, children }) => {
  const editorProps = {};
  if (_.isFunction(children)) {
    return children(translation);
  }
  if (isEditor) {
    editorProps.title = translationId;
    editorProps.style = { cursor: editModeHighlighting ? 'pointer' : null, textTransform: editModeHighlighting && 'none' };
    editorProps.onClick = () => (editModeHighlighting && gotoEdit ? gotoEdit() : null);
  }
  return React.createElement(_tagType || 'span', {
    ..._props,
    ...editorProps,
    dangerouslySetInnerHTML: {
      __html: translation,
    }, key: locale,
  });
};


Component.displayName = 'T';

const composeWithTrackerServerSave = _.get(global, 'Meteor.isServer') ? compose : composeWithTracker;
const T = composeAll(
  composeWithTrackerServerSave(composer),
  useDeps(depsMapper)
)(Component);


setComposerStub(T, (props) => {
  const stubContext = () => ({
    i18n: new I18nClient({
      translationStore: {
        setLocale: _.noop,
        getLocale: () => 'de',
        translate: key => key,
      },
      supportedLocales: ['de'],
      defaultLocale: 'de',
    }),
    routeUtils: {
      go: _.noop,
    },
  });
  return getTranslationProps(stubContext, props);
});


export default T;
