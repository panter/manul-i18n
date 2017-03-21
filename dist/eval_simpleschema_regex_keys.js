'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = evalSimpleSchemaRegexKeys;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// allowes to use SimpleSchema.RegEx.Email keys in the translation file, instead of the actual regex
function evalSimpleSchemaRegexKeys(messages) {
  if (messages && messages.regEx) {
    var regEx = messages.regEx.map(function (_ref) {
      var msg = _ref.msg,
          exp = _ref.exp;
      return {
        msg: msg,
        exp: exp && exp.split('.').reduce(function (o, i) {
          return o && o[i];
        }, global)
      };
    });
    return (0, _extends3.default)({}, messages, { regEx: regEx });
  }
  return messages;
}
//# sourceMappingURL=eval_simpleschema_regex_keys.js.map