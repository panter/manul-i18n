'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composer = undefined;

var _mapValues2 = require('lodash/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _mantraCore = require('mantra-core');

var _translate_simple_schema = require('./translate_simple_schema');

var _translate_simple_schema2 = _interopRequireDefault(_translate_simple_schema);

var _translate_simple_schema_ = require('./translate_simple_schema_1');

var _translate_simple_schema_2 = _interopRequireDefault(_translate_simple_schema_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
  withTranslatedSchema is a composer that translates the given schemas using .
  Pass a mapping-object where the keys are the properties containing these schemas
  and the values of the object are the i18n-namespaces

  e.g. withTranslatedSchema({companySchema: "companies"})
*/
var composer = function composer(mappingArrayOrFunction) {
  return function (_ref, onData) {
    var context = _ref.context,
        props = _objectWithoutProperties(_ref, ['context']);

    var _context = context(),
        i18n = _context.i18n;

    var SimpleSchema = void 0;
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

    var mapping = mappingArrayOrFunction;
    if ((0, _isFunction3.default)(mappingArrayOrFunction)) {
      mapping = mappingArrayOrFunction(_extends({ context: context }, props));
    }
    var translateSimpleSchemaFunc = SimpleSchema.version === 2 ? _translate_simple_schema2.default : _translate_simple_schema_2.default;
    var translatedProps = (0, _mapValues3.default)(mapping, function (namespace, propName) {
      return translateSimpleSchemaFunc({ i18n: i18n, SimpleSchema: SimpleSchema })(props[propName], namespace);
    });
    onData(null, _extends({}, props, translatedProps));
  };
};

exports.composer = composer;

exports.default = function (mapping) {
  return (0, _mantraCore.composeWithTracker)(composer(mapping));
};
//# sourceMappingURL=with_translated_schema.js.map