import _ from 'lodash'
import evalSimpleSchemaRegexKeys from './eval_simpleschema_regex_keys'

export default ({ i18n, SimpleSchema }) => (schemaOrg, namespace) => {
  if (!SimpleSchema) {
    throw new Error(
      'please provide SimpleSchema if you want to translate schemas'
    )
  }
  // clone the schema
  const schema = _.cloneDeep(schemaOrg)
  // translate all the labels
  const translations = i18n.t(namespace)
  console.log(translations)

  const _translateSchemaObject = (
    parentFieldFullName = null,
    parentTranslation = {}
  ) => {
    schema.objectKeys(parentFieldFullName).forEach(field => {
      const fullFieldName = parentFieldFullName
        ? `${parentFieldFullName}.${field}`
        : field
      const fieldTranslations = _.get(parentTranslation, field)
      let label = null
      if (fieldTranslations) {
        if (_.isString(fieldTranslations)) {
          label = fieldTranslations
        } else {
          label = fieldTranslations.label
        }
      }
      const defaultTransform = value => _.get(fieldTranslations, value, value)
      // we mutate now the schema
      const fieldSchema = schema.schema(fullFieldName)
      _.extend(fieldSchema, {
        label: label || `${namespace}.${fullFieldName}`,
        uniforms: {
          transform: defaultTransform,
          translations: fieldTranslations,
          ...schemaOrg.getDefinition(fullFieldName).uniforms // can override default transform
        }
      })
      // recursivly translate subobjects and subschemas
      if (schema.objectKeys(fullFieldName).length > 0) {
        _translateSchemaObject(fullFieldName, fieldTranslations)
      }
      // or if array

      if (schema.objectKeys(`${fullFieldName}.$`).length > 0) {
        _translateSchemaObject(`${fullFieldName}.$`, fieldTranslations)
      }
    })
  }
  _translateSchemaObject(null, translations)

  // we do not use the locale feature of simpleschema (yet),
  // instead we just add the right translations
  // to the default locale (en) in messagebox
  schema.messageBox.messages({
    en: evalSimpleSchemaRegexKeys(i18n.t('simpleSchema'))
  })

  return schema
}
