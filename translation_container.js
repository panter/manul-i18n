import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
import React from 'react';

export const composer = ({ context, children, disableEditorBypass = false, ...params }, onData) => {
  const { i18n, routeUtils } = context();
  const translation = i18n.t(children, params, { disableEditorBypass });
  const locale = i18n.getLocale();
  const isEditor = i18n.isEditor();
  const editModeHighlighting = i18n.editModeHighlighting();
  const gotoEdit = () => routeUtils.go(i18n.editRoute, { _id: children });
  // editModeHighlighting is already handled by i18n.t, (editModeHighlighting = true shows the key instead of the translation)
  // but we also want to allow to click on it to jump to the translation when bypassing is active
  onData(null, { gotoEdit, translation, locale, isEditor, editModeHighlighting });
};
export const depsMapper = (context, actions) => ({
  context: () => context,
});

const Component = ({ isEditor, editModeHighlighting, gotoEdit, locale, children, _tagType, _props = {}, translation }) => {
  const editorProps = {};
  if (isEditor) {
    editorProps.title = children;
    editorProps.style = { cursor: editModeHighlighting ? 'pointer' : null };
    editorProps.onClick = () => (editModeHighlighting ? gotoEdit() : null);
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

const composeWithTrackerServerSave = Meteor.isServer ? compose : composeWithTracker;
const T = composeAll(
  composeWithTrackerServerSave(composer),
  useDeps(depsMapper)
)(Component);

setComposerStub(T, props =>
   ({ translation: props.children })
);


export default T;
