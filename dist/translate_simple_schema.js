'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _extend2 = require('lodash/extend');

var _extend3 = _interopRequireDefault(_extend2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _cloneDeep2 = require('lodash/cloneDeep');

var _cloneDeep3 = _interopRequireDefault(_cloneDeep2);

var _eval_simpleschema_regex_keys = require('./eval_simpleschema_regex_keys');

var _eval_simpleschema_regex_keys2 = _interopRequireDefault(_eval_simpleschema_regex_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var i18n = _ref.i18n,
      SimpleSchema = _ref.SimpleSchema;
  return function (schemaOrg, namespace) {
    if (!SimpleSchema) {
      throw new Error('please provide SimpleSchema if you want to translate schemas');
    }
    // clone the schema
    var schema = (0, _cloneDeep3.default)(schemaOrg);
    // translate all the labels
    var translations = i18n.t(namespace);

    var _translateSchemaObject = function _translateSchemaObject() {
      var parentFieldFullName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var parentTranslation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      schema.objectKeys(parentFieldFullName).forEach(function (field) {
        var fullFieldName = parentFieldFullName ? parentFieldFullName + '.' + field : field;
        var fieldTranslations = (0, _get3.default)(parentTranslation, field);
        var label = null;
        if (fieldTranslations) {
          if ((0, _isString3.default)(fieldTranslations)) {
            label = fieldTranslations;
          } else {
            label = fieldTranslations.label;
          }
        }
        var defaultTransform = function defaultTransform(value) {
          return (0, _get3.default)(fieldTranslations, value, value);
        };
        // we mutate now the schema
        var fieldSchema = schema.schema(fullFieldName);
        (0, _extend3.default)(fieldSchema, {
          label: label || namespace + '.' + fullFieldName,
          uniforms: (0, _extends3.default)({
            transform: defaultTransform,
            translations: fieldTranslations
          }, schemaOrg.getDefinition(fullFieldName).uniforms)
        });
        // recursivly translate subobjects and subschemas
        if (schema.objectKeys(fullFieldName).length > 0) {
          _translateSchemaObject(fullFieldName, fieldTranslations);
        }
      });
    };
    _translateSchemaObject(null, translations);

    // we do not use the locale feature of simpleschema (yet),
    // instead we just add the right translations
    // to the default locale (en) in messagebox
    schema.messageBox.messages({ en: (0, _eval_simpleschema_regex_keys2.default)(i18n.t('simpleSchema')) });

    return schema;
  };
};
//# sourceMappingURL=translate_simple_schema.js.map