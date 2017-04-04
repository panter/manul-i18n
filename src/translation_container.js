import React from 'react';
import { get, noop, isString, isFunction, invokeArgs } from 'lodash/fp';
import { pure } from 'recompose';
import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
import I18nService from './i18n_service';


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

const getTranslationId = ({ children, _id }) => (
  _id || (isString(children) ? children : null)
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
const getTranslationProps = (context, { gotoEdit, ...props }) => {
  const { i18n } = context();
  const locale = i18n.getLocale();
  const translationId = getTranslationId(props);
  const translation = getTranslation(i18n, props);

  let isEditMode = i18n.isEditMode();

  if (props.doc) {
    // no edit mode highlighting for docs yet and no gotoEdit;
    /* eslint no-param-reassign: 0*/
    gotoEdit = noop;
    isEditMode = false;
  }
  return { translationId, gotoEdit, translation, locale, isEditMode };
};

export const composer = ({ context, ...props }, onData) => {
  onData(null, getTranslationProps(context, props));
};

export const depsMapper = (context, actions) => ({
  gotoEdit: (translationId) => {
    if (isFunction(context.i18n.editTranslationAction)) {
      // call function
      context.i18n.editTranslationAction(translationId);
    } else if (isString(context.i18n.editTranslationAction)) {
      // call mantra action
      invokeArgs(context.i18n.editTranslationAction, [translationId], actions);
    }
  },
  context: () => context,
});

const Component = (
  { isEditMode, gotoEdit, translationId, locale, _tagType, _props = {}, translation, children },
) => {
  if (isFunction(children)) {
    return children(translation);
  }
  const editorProps = {
    style: {
      cursor: isEditMode && 'pointer',
      textTransform: isEditMode && 'none',
    },
    onClick: (e) => {
      if (isEditMode && gotoEdit) {
        e.preventDefault();
        gotoEdit(translationId);
      }
    },
  };
  return React.createElement(_tagType || 'span', {
    ..._props,
    ...editorProps,
    dangerouslySetInnerHTML: {
      __html: translation,
    },
    key: locale,
  });
};

Component.displayName = 'T';

const composeWithTrackerServerSave = get('Meteor.isServer', global) ? compose : composeWithTracker;
const T = composeAll(
  composeWithTrackerServerSave(composer),
  useDeps(depsMapper),
  pure,
)(Component);

T.displayName = 'T';

setComposerStub(T, (props) => {
  const stubContext = () => ({
    i18n: new I18nService({
      translationStore: {
        setLocale: noop,
        getLocale: () => 'de',
        translate: key => key,
      },
      supportedLocales: ['de'],
      defaultLocale: 'de',
    }),
  });
  return getTranslationProps(stubContext, props);
});

export default T;
