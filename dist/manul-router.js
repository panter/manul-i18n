'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _create_nav_item = require('./create_nav_item');

var _create_nav_item2 = _interopRequireDefault(_create_nav_item);

var _disable_flowrouter_click_detection = require('./disable_flowrouter_click_detection');

var _disable_flowrouter_click_detection2 = _interopRequireDefault(_disable_flowrouter_click_detection);

/**

  const manulRouter = new ManulRouter(
    {FlowRouter, Meteor, i18n},
    {
      // onRoute will be called when route is changed
      // it will be called with the navItem and a next-function
      // route will continue if you either return true or call the next-function
      // otherwise, route change is canceled.
      onRoute(navItem:Object, next:Function)
    }
  );
**/

var _default = (function () {
  function _default(_ref) {
    var FlowRouter = _ref.FlowRouter;
    var Meteor = _ref.Meteor;
    var i18n = _ref.i18n;
    var globals = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, _default);

    this.FlowRouter = FlowRouter;
    this.i18n = i18n;
    this.routeConfirmCallback = null;
    this.globals = globals;

    this.createNavItem = (0, _create_nav_item2['default'])(this);

    (0, _disable_flowrouter_click_detection2['default'])({ FlowRouter: FlowRouter, Meteor: Meteor });
  }

  _createClass(_default, [{
    key: 'createNavItemForCurrentPage',
    value: function createNavItemForCurrentPage() {
      var newParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var newQueryParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var current = this.FlowRouter.current();
      return this.createNavItem({
        routeName: current.route.path, // this is the route definition / path with placeholders!
        params: _extends({}, current.params, newParams),
        queryParams: _extends({}, current.queryParams, newQueryParams)
      });
    }

    /**
      current route name (reactive)
    **/
  }, {
    key: 'getRouteName',
    value: function getRouteName() {
      return this.FlowRouter.getRouteName();
    }

    /**
    get the current path (non-reactive)
    **/
  }, {
    key: 'getCurrentPath',
    value: function getCurrentPath() {
      return this.FlowRouter.current().path;
    }

    /**
    get the current route defininition (non-reactive)
    **/
  }, {
    key: 'getCurrentRoute',
    value: function getCurrentRoute() {
      return this.FlowRouter.current().route;
    }

    /**
    get a url path param by name, tracker-reactive
    **/
  }, {
    key: 'getParam',
    value: function getParam(paramName) {
      return this.FlowRouter.getParam(paramName);
    }

    /**
    set a url path param in the current route
    **/
  }, {
    key: 'setParams',
    value: function setParams(newParams) {
      this.FlowRouter.setParams(newParams);
    }

    /**
    get queryparams, tracker-reactive
    **/
  }, {
    key: 'getQueryParam',
    value: function getQueryParam(queryStringKey) {
      return this.FlowRouter.getQueryParam(queryStringKey);
    }

    /**
      set queryString params, you can pass an object with key:values
    **/
  }, {
    key: 'setQueryParams',
    value: function setQueryParams(newQueryParams) {
      this.FlowRouter.setQueryParams(newQueryParams);
    }

    /**
      construct a path by the routeName, params and queryParams.
      It automatically adds the locale to the route if it is a localeRoute
    **/
  }, {
    key: 'getPath',
    value: function getPath(routeName, params, queryParams) {
      return this.FlowRouter.path(routeName, _extends({ locale: this.i18n.getLocale() }, params), queryParams).
      // flow router does escape "/" in the route-params, but we like to keep them
      // FIXME: may break cases where / is in a queryParam
      replace(/%252F/g, '/');
    }

    /**
    got to the given route. The arguments can be:
    - routeName, params, queryParams
    - a path (string)
    - a navItem (created with createNavItem)
      This will trigger route-callbacks (onRoute)
     you can additionally pass a callback as the last param,
    this will be called after all onRoute-Callbacks has been resolved
      **/
  }, {
    key: 'go',
    value: function go() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var nav = this._wrapAsNavItemIfneeded(args);
      var allOnRoutes = _lodash2['default'].flatten([nav.onRoute, this.globals.onRoute]);
      allOnRoutes.reduce(function (promiseChain, onRoute) {
        return promiseChain.then(function () {
          return new _Promise(function (next) {
            if (_lodash2['default'].isFunction(onRoute)) {
              // onRoute can either return true/ false
              // or call its second arg (next) with no value or true
              var should = onRoute(nav, function () {
                var s = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
                return s && next();
              });
              if (_lodash2['default'].isBoolean(should) && should) {
                next();
              }
            } else {
              next();
            }
          });
        });
      }, _Promise.resolve()).then(function () {
        _this.FlowRouter.go(nav.href);
        // check if last arg is a callback function and execute
        if (_lodash2['default'].isFunction(_lodash2['default'].last(args))) {
          _lodash2['default'].last(args)();
        }
      });
    }
  }, {
    key: 'createLocaleRoutesGroup',
    value: function createLocaleRoutesGroup() {
      var baseRoutes = arguments.length <= 0 || arguments[0] === undefined ? this.FlowRouter : arguments[0];

      return baseRoutes.group({
        prefix: '/:locale?',
        triggersEnter: [this._setLocaleByRoute.bind(this)]
      });
    }
  }, {
    key: '_setLocaleByRoute',
    value: function _setLocaleByRoute(_ref2, redirect, stop) {
      var locale = _ref2.params.locale;

      if (this.i18n.supports(locale)) {
        this.i18n.setLocale(locale);
      } else {
        this.setParams({ locale: this.i18n.getFallbackLocale(locale) });
        stop();
      }
    }
  }, {
    key: 'redirect',
    value: function redirect() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var nav = this._wrapAsNavItemIfneeded(args);
      this.FlowRouter.redirect(nav.href);
    }
  }, {
    key: '_wrapAsNavItemIfneeded',
    value: function _wrapAsNavItemIfneeded(args) {
      var firstArg = args[0];
      if (_lodash2['default'].has(firstArg, 'href')) {
        // is already a nav item
        return args[0];
      }
      return this.createNavItem({
        routeName: args[0],
        params: args[1],
        queryParams: args[2]
      });
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];
//# sourceMappingURL=manul-router.js.map