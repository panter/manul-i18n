import _ from 'lodash';
import evalSimpleSchemaRegexKeys from './eval_simpleschema_regex_keys';

export default ({ i18n, SimpleSchema }) => (schema, namespace) => {
  if (!SimpleSchema) {
    throw new Error('please provide SimpleSchema if you want to translate schemas');
  }
  // translate all the labels
  const translations = i18n.t(namespace);
  const translatedDef = {};
  const _addSubSchemaTranslations = (parentFieldFullName = null, parentTranslation = {}) => {
    schema.objectKeys(parentFieldFullName).forEach((field) => {
      const fullFieldName = parentFieldFullName ? `${parentFieldFullName}.${field}` : field;
      const fieldTranslation = parentTranslation[field];
      const fieldDefinition = schema.getDefinition(fullFieldName);
      const defaultTransform = value => (fieldTranslation && fieldTranslation[value]) || value;
      let label = null;
      let hintText = null;
      let hintTitle = null;
      let listAdd = null;
      let listDel = null;
      let toggleOptionalLabel = null;
      if (fieldTranslation) {
        if (_.isString(fieldTranslation)) {
          label = fieldTranslation;
        } else {
          label = fieldTranslation.label;
          hintText = fieldTranslation.hintText;
          hintTitle = fieldTranslation.hintTitle;
          toggleOptionalLabel = fieldTranslation.toggleOptionalLabel;
          listAdd = fieldTranslation.listAdd;
          listDel = fieldTranslation.listDel;
        }
      }
      // recursivly add subfields as well, but flat
      if (schema.objectKeys(fullFieldName).length > 0) {
        _addSubSchemaTranslations(fullFieldName, fieldTranslation);
      }
      translatedDef[fullFieldName] = {
        label: label || `${namespace}.${fullFieldName}`,
        uniforms: {
          transform: defaultTransform,
          hintText,
          hintTitle,
          listAdd,
          listDel,
          toggleOptionalLabel,
          ...fieldDefinition.uniforms, // can override default transform
        },
      };
    });
  };

  _addSubSchemaTranslations(null, translations);
  const translatedScheme = new SimpleSchema([schema, translatedDef]);
  const simpleSchemaMessages = evalSimpleSchemaRegexKeys(
    i18n.t('simpleSchema'),
  );
  translatedScheme.messages(simpleSchemaMessages);

  return translatedScheme;
};
