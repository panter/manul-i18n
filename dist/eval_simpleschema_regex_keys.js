// allowes to use SimpleSchema.RegEx.Email keys in the translation file, instead of the actual regex
'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = evalSimpleSchemaRegexKeys;

function evalSimpleSchemaRegexKeys(messages) {
  if (messages && messages.regEx) {
    var regEx = messages.regEx.map(function (_ref) {
      var msg = _ref.msg;
      var exp = _ref.exp;
      return {
        msg: msg,
        exp: exp && exp.split('.').reduce(function (o, i) {
          return o && o[i];
        }, global)
      };
    });
    return _extends({}, messages, { regEx: regEx });
  }
  return messages;
}

module.exports = exports['default'];
//# sourceMappingURL=eval_simpleschema_regex_keys.js.map