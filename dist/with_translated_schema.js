'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mantraCore = require('mantra-core');

var _translate_simple_schema = require('./translate_simple_schema');

var _translate_simple_schema2 = _interopRequireDefault(_translate_simple_schema);

/**
  withTranslatedSchema is a composer that translates the given schemas using .
  Pass a mapping-object where the keys are the properties containing these schemas
  and the values of the object are the i18n-namespaces

  e.g. withTranslatedSchema({companySchema: "companies"})
*/
var composer = function composer(mappingArrayOrFunction) {
  return function (_ref, onData) {
    var context = _ref.context;

    var props = _objectWithoutProperties(_ref, ['context']);

    var _context = context();

    var i18n = _context.i18n;
    var SimpleSchema = _context.SimpleSchema;

    if (!SimpleSchema) {
      throw new Error('If you want to use withTranslatedSchema, you have to provide SimpleSchema in your context');
    }
    var mapping = mappingArrayOrFunction;
    if (_lodash2['default'].isFunction(mappingArrayOrFunction)) {
      mapping = mappingArrayOrFunction(_extends({ context: context }, props));
    }
    var translatedProps = _lodash2['default'].mapValues(mapping, function (namespace, propName) {
      return (0, _translate_simple_schema2['default'])({ i18n: i18n, SimpleSchema: SimpleSchema })(props[propName], namespace);
    });
    onData(null, _extends({}, props, translatedProps));
  };
};

exports.composer = composer;

exports['default'] = function (mapping) {
  return (0, _mantraCore.composeWithTracker)(composer(mapping));
};
//# sourceMappingURL=with_translated_schema.js.map