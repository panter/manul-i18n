'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

/* eslint no-param-reassign: 0*/

exports['default'] = function (_ref) {
  var FlowRouter = _ref.FlowRouter;
  var Meteor = _ref.Meteor;

  // patch FlowRouter
  // because of https://github.com/kadirahq/flow-router/issues/705
  FlowRouter._askedToWait = true;
  FlowRouter._linkDetectionDisabled = true;
  Meteor.startup(function () {
    var oldPage = FlowRouter._page;
    FlowRouter._page = function _page() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (_lodash2['default'].isObject(args[0])) {
        args[0].click = false;
      }
      return oldPage.call.apply(oldPage, [this].concat(args));
    };
    _lodash2['default'].assign(FlowRouter._page, oldPage); // copy properties

    FlowRouter.initialize();
  });
};

module.exports = exports['default'];
//# sourceMappingURL=disable_flowrouter_click_detection.js.map