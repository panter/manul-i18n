import _ from 'lodash';
import { composeWithTracker } from 'mantra-core';

import translateSimpleSchema from './translate_simple_schema';
/**
  withTranslatedSchema is a composer that translates the given schemas using .
  Pass a mapping-object where the keys are the properties containing these schemas
  and the values of the object are the i18n-namespaces

  e.g. withTranslatedSchema({companySchema: "companies"})
*/
export const composer = mappingArrayOrFunction => ({ context, ...props }, onData) => {
  const { i18n, SimpleSchema } = context();
  if (!SimpleSchema) {
    throw new Error('If you want to use withTranslatedSchema, you have to provide SimpleSchema in your context');
  }
  let mapping = mappingArrayOrFunction;
  if (_.isFunction(mappingArrayOrFunction)) {
    mapping = mappingArrayOrFunction({ context, ...props });
  }
  const translatedProps = _.mapValues(
    mapping,
    (namespace, propName) => (
      translateSimpleSchema({ i18n, SimpleSchema })(props[propName], namespace)
    ),
  );
  onData(null, { ...props, ...translatedProps });
};

export default mapping => composeWithTracker(composer(mapping));
