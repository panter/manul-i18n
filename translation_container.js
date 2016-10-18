import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
import React from 'react';

export const composer = ({ context, children, ...params }, onData) => {
  const { i18n, routeUtils } = context();
  const translation = i18n.t(children, params);
  const locale = i18n.getLocale();
  const isEditor = i18n.isEditor();
  const shouldBypass = i18n.shouldBypass();
  const gotoEdit = () => routeUtils.go(i18n.editRoute, { _id: children });
  // shouldBypass is already handled by i18n.t, (shouldBypass = true shows the key instead of the translation)
  // but we also want to allow to click on it to jump to the translation when bypassing is active
  onData(null, { gotoEdit, translation, locale, isEditor, shouldBypass });
};
export const depsMapper = (context, actions) => ({
  context: () => context,
});

const Component = ({ isEditor, shouldBypass, gotoEdit, locale, children, _tagType, _props = {}, translation }) => {
  const editorProps = {};
  if (isEditor) {
    editorProps.title = children;
    editorProps.style = { cursor: shouldBypass ? 'pointer' : null };
    editorProps.onClick = () => (shouldBypass ? gotoEdit() : null);
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

const T = composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Component);

setComposerStub(T, (props) => {
  return { translation: props.children };
});


export default T;
