'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _eval_simpleschema_regex_keys = require('./eval_simpleschema_regex_keys');

var _eval_simpleschema_regex_keys2 = _interopRequireDefault(_eval_simpleschema_regex_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** legacy version for simpleschema 1 **/
exports.default = function (_ref) {
  var i18n = _ref.i18n,
      SimpleSchema = _ref.SimpleSchema;
  return function (schema, namespace) {
    if (!SimpleSchema) {
      throw new Error('please provide SimpleSchema if you want to translate schemas');
    }
    // translate all the labels
    var translations = i18n.t(namespace);
    var translatedDef = {};
    var _addSubSchemaTranslations = function _addSubSchemaTranslations() {
      var parentFieldFullName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var parentTranslation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      schema.objectKeys(parentFieldFullName).forEach(function (field) {
        var fullFieldName = parentFieldFullName ? parentFieldFullName + '.' + field : field;
        var fieldTranslation = (0, _get3.default)(parentTranslation, field);
        var fieldDefinition = schema.getDefinition(fullFieldName);
        var defaultTransform = function defaultTransform(value) {
          return fieldTranslation && fieldTranslation[value] || value;
        };
        var label = null;
        var hintText = null;
        var hintTitle = null;
        var listAdd = null;
        var listDel = null;
        var toggleOptionalLabel = null;
        if (fieldTranslation) {
          if ((0, _isString3.default)(fieldTranslation)) {
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
          label: label || namespace + '.' + fullFieldName,
          uniforms: (0, _extends3.default)({
            transform: defaultTransform,
            hintText: hintText,
            hintTitle: hintTitle,
            listAdd: listAdd,
            listDel: listDel,
            toggleOptionalLabel: toggleOptionalLabel
          }, fieldDefinition.uniforms)
        };
      });
    };

    _addSubSchemaTranslations(null, translations);
    var translatedScheme = new SimpleSchema([schema, translatedDef]);
    var simpleSchemaMessages = (0, _eval_simpleschema_regex_keys2.default)(i18n.t('simpleSchema'));
    translatedScheme.messages(simpleSchemaMessages);

    return translatedScheme;
  };
};
//# sourceMappingURL=translate_simple_schema_1.js.map