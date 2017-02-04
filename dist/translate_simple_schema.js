'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _eval_simpleschema_regex_keys = require('./eval_simpleschema_regex_keys');

var _eval_simpleschema_regex_keys2 = _interopRequireDefault(_eval_simpleschema_regex_keys);

exports['default'] = function (_ref) {
  var i18n = _ref.i18n;
  var SimpleSchema = _ref.SimpleSchema;
  return function (schemaOrg, namespace) {
    if (!SimpleSchema) {
      throw new Error('please provide SimpleSchema if you want to translate schemas');
    }
    // clone the schema
    var schema = _lodash2['default'].cloneDeep(schemaOrg);
    // translate all the labels
    var translations = i18n.t(namespace);

    var _translateSchemaObject = function _translateSchemaObject() {
      var parentFieldFullName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var parentTranslation = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      schema.objectKeys(parentFieldFullName).forEach(function (field) {
        var fullFieldName = parentFieldFullName ? parentFieldFullName + '.' + field : field;
        var fieldTranslations = _lodash2['default'].get(parentTranslation, field);
        var label = null;
        if (fieldTranslations) {
          if (_lodash2['default'].isString(fieldTranslations)) {
            label = fieldTranslations;
          } else {
            label = fieldTranslations.label;
          }
        }
        var defaultTransform = function defaultTransform(value) {
          return _lodash2['default'].get(fieldTranslations, value, value);
        };
        // we mutate now the schema
        var fieldSchema = schema.schema(fullFieldName);
        _lodash2['default'].extend(fieldSchema, {
          label: label || namespace + '.' + fullFieldName,
          uniforms: _extends({
            transform: defaultTransform,
            translations: fieldTranslations
          }, schemaOrg.getDefinition(fullFieldName).uniforms)
        });
        // recursivly translate subobjects and subschemas
        // can override default transform
        if (schema.objectKeys(fullFieldName).length > 0) {
          _translateSchemaObject(fullFieldName, fieldTranslations);
        }
      });
    };
    _translateSchemaObject(null, translations);

    // we do not use the locale feature of simpleschema (yet),
    // instead we just add the right translations
    // to the default locale (en) in messagebox
    schema.messageBox.messages({ en: (0, _eval_simpleschema_regex_keys2['default'])(i18n.t('simpleSchema')) });

    return schema;
  };
};

module.exports = exports['default'];
//# sourceMappingURL=translate_simple_schema.js.map