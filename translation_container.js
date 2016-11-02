import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
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
export const composer = ({ context, doc = null, _id: _idParam = null, children, disableEditorBypass = false, ...params }, onData) => {
  const { i18n, routeUtils } = context();
  const locale = i18n.getLocale();
  const _id = _idParam || (_.isString(children) ? children : 'missing _id!');
  const isEditor = i18n.isEditor();
  let translation = '';
  let gotoEdit = _.noop;
  // editModeHighlighting is already handled by i18n.t, (editModeHighlighting = true shows the _id instead of the translation)
  let editModeHighlighting = i18n.editModeHighlighting();
  if (!doc) {
    translation = i18n.t(_id, params, { disableEditorBypass });
    // we also want to allow to click on it to jump to the translation when bypassing is active
    gotoEdit = () => routeUtils.go(i18n.editRoute, { _id });
  } else {
    translation = _.get(doc, `${_id}.${locale}`);
    // do not highlight
    editModeHighlighting = false;
    // no support for gotoEdit yet.
  }

  onData(null, { _id, gotoEdit, translation, locale, isEditor, editModeHighlighting });
};
export const depsMapper = (context, actions) => ({
  context: () => context,
});

const Component = ({ isEditor, editModeHighlighting, gotoEdit, locale, _id, _tagType, _props = {}, translation, children }) => {
  const editorProps = {};
  if (_.isFunction(children)) {
    return children(translation);
  }
  if (isEditor) {
    editorProps.title = _id;
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

setComposerStub(T, props =>
   ({ translation: props.children })
);


export default T;
