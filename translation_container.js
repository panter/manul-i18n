import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { setComposerStub } from 'react-komposer';
import React from 'react';

export const composer = ({ context, children, ...params }, onData) => {
  const { i18n, Meteor } = context();
  const translation = i18n.t(children, params);
  const locale = i18n.getLocale();
  const isDevelopment = Meteor.isDevelopment;
  onData(null, { translation, locale, isDevelopment });
};
export const depsMapper = (context, actions) => ({
  context: () => context,
});

const Component = ({ isDevelopment, locale, children, _tagType, _props = {}, translation }) => {
  const devProps = {};
  if (isDevelopment) {
    devProps.title = children;
  }
  return React.createElement(_tagType || 'span', {
    ..._props,
    ...devProps,
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
  return { translation: () => props.children };
});


export default T;
