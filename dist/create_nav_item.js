'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

// use this from context()

exports['default'] = function (manulRouter) {
  return function (nav) {
    var label = nav.label;
    var routeName = nav.routeName;
    var disabled = nav.disabled;
    var params = nav.params;
    var queryParams = nav.queryParams;

    var path = routeName && !disabled ? manulRouter.getPath(routeName, params, queryParams) : null;

    var currentPath = manulRouter.getCurrentPath();
    var active = currentPath === path;
    var navItem = _extends({}, nav, {
      href: path,
      active: active,
      childActive: !active && _lodash2['default'].startsWith(currentPath, path),
      label: label
    });
    var go = function go() {
      return manulRouter.go(navItem);
    };
    var onClick = function onClick(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (navItem.active) {
        return;
      }
      _lodash2['default'].defer(go);
    };

    return _extends({
      go: go
    }, navItem, {
      // overridable, if not falsy, spreading navItem after this does not handle this correctly
      onClick: nav.onClick || onClick

    });
  };
};

module.exports = exports['default'];
//# sourceMappingURL=create_nav_item.js.map