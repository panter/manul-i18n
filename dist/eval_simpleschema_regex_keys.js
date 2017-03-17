'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = evalSimpleSchemaRegexKeys;
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
    return _extends({}, messages, { regEx: regEx });
  }
  return messages;
}
//# sourceMappingURL=eval_simpleschema_regex_keys.js.map