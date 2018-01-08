import _ from 'lodash';
import { composeWithTracker } from '@storybook/mantra-core';

import translateSimpleSchema from './translate_simple_schema';
import translateSimpleSchemaLegacy from './translate_simple_schema_1';
/**
  withTranslatedSchema is a composer that translates the given schemas using .
  Pass a mapping-object where the keys are the properties containing these schemas
  and the values of the object are the i18n-namespaces

  e.g. withTranslatedSchema({companySchema: "companies"})
*/
export const composer = mappingArrayOrFunction => ({ context, ...props }, onData) => {
  const { i18n } = context();

  let SimpleSchema;
  try {
    // try load simpleSchema form npm
    /* eslint global-require: 0 */
    /* eslint import/no-unresolved: 0 */
    SimpleSchema = require('simpl-schema').default;
  } catch (e) {
  // load from context
    SimpleSchema = context().SimpleSchema;
  }
  if (!SimpleSchema) {
    throw new Error('Please provice SimpleSchema as npm module (recomended) or in context to use withTranslatedSchema');
  }

  let mapping = mappingArrayOrFunction;
  if (_.isFunction(mappingArrayOrFunction)) {
    mapping = mappingArrayOrFunction({ context, ...props });
  }
  const translateSimpleSchemaFunc = (
    SimpleSchema.version === 2 ?
    translateSimpleSchema :
    translateSimpleSchemaLegacy
  );
  const translatedProps = _.mapValues(
    mapping,
    (namespace, propName) => (
      translateSimpleSchemaFunc({ i18n, SimpleSchema })(props[propName], namespace)
    ),
  );
  onData(null, { ...props, ...translatedProps });
};

export default mapping => composeWithTracker(composer(mapping));
