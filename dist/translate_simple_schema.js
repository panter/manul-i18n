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
  return function (schema, namespace) {
    if (!SimpleSchema) {
      throw new Error('please provide SimpleSchema if you want to translate schemas');
    }
    // translate all the labels
    var translations = i18n.t(namespace);
    var translatedDef = {};
    var _addSubSchemaTranslations = function _addSubSchemaTranslations() {
      var parentFieldFullName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var parentTranslation = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      schema.objectKeys(parentFieldFullName).forEach(function (field) {
        var fullFieldName = parentFieldFullName ? parentFieldFullName + '.' + field : field;
        var fieldTranslation = _lodash2['default'].get(parentTranslation, field);
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
          if (_lodash2['default'].isString(fieldTranslation)) {
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
          uniforms: _extends({
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

    // can override default transform
    _addSubSchemaTranslations(null, translations);
    var translatedScheme = new SimpleSchema([schema, translatedDef]);
    var simpleSchemaMessages = (0, _eval_simpleschema_regex_keys2['default'])(i18n.t('simpleSchema'));
    translatedScheme.messages(simpleSchemaMessages);

    return translatedScheme;
  };
};

module.exports = exports['default'];
//# sourceMappingURL=translate_simple_schema.js.map