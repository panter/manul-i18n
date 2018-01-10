'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composer = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _mapValues2 = require('lodash/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _composeWithTracker = require('./utils/composeWithTracker');

var _composeWithTracker2 = _interopRequireDefault(_composeWithTracker);

var _translate_simple_schema = require('./translate_simple_schema');

var _translate_simple_schema2 = _interopRequireDefault(_translate_simple_schema);

var _translate_simple_schema_ = require('./translate_simple_schema_1');

var _translate_simple_schema_2 = _interopRequireDefault(_translate_simple_schema_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  withTranslatedSchema is a composer that translates the given schemas using .
  Pass a mapping-object where the keys are the properties containing these schemas
  and the values of the object are the i18n-namespaces

  e.g. withTranslatedSchema({companySchema: "companies"})
*/
var composer = function composer(mappingArrayOrFunction) {
  return function (_ref, onData) {
    var context = _ref.context,
        props = (0, _objectWithoutProperties3.default)(_ref, ['context']);

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
      mapping = mappingArrayOrFunction((0, _extends3.default)({ context: context }, props));
    }
    var translateSimpleSchemaFunc = SimpleSchema.version === 2 ? _translate_simple_schema2.default : _translate_simple_schema_2.default;
    var translatedProps = (0, _mapValues3.default)(mapping, function (namespace, propName) {
      return translateSimpleSchemaFunc({ i18n: i18n, SimpleSchema: SimpleSchema })(props[propName], namespace);
    });
    onData(null, (0, _extends3.default)({}, props, translatedProps));
  };
};

exports.composer = composer;

exports.default = function (mapping) {
  return (0, _composeWithTracker2.default)(composer(mapping));
};
//# sourceMappingURL=with_translated_schema.js.map