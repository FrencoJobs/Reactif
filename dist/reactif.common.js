/*!
* Reactif - v1.0.3
* MIT License
* Copyright (c) 2018 Frenco W. Jobs
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var isProxySupported = typeof Proxy !== 'undefined';
var inBrowser = typeof window !== 'undefined';
var hasConsole = typeof console !== 'undefined';
var $$Variables = {
  __polyfillTest__: false,
  __version__: '0.0.0-development'
  /**
   * Check if it's an Object or not, excluded `null`
   */

};
function isObject(obj) {
  return obj !== null && _typeof(obj) === 'object';
}
/**
 * Do Nothing.
 */

var noop = function noop(a) {};

var err = noop;
var recommend = noop;

{
  /**
     * Notified with an error message
     */
  err = function err(msg) {
    hasConsole && inBrowser ? console.info("%c[Reactif error]: %c" + msg, 'font-weight:bold;color:red;', 'font-weight:bold;color:black')
    /* istanbul ignore next */
    : console.info("[Reactif error]:" + msg);
    return false;
  };
  /**
     * Notified with a recommendation message
     */


  recommend = function recommend(msg) {
    hasConsole && inBrowser ? console.info("%c[Reactif ".concat($$Variables.__version__, "]: %c") + msg, 'font-weight:bold;color:green;', 'font-weight:bold;color:black')
    /* istanbul ignore next */
    : console.info("[Reactif ".concat($$Variables.__version__, "]:") + msg);
    return true;
  };
}
/**
 * Create a Map within standards used
 */


function createMap(boundry) {
  boundry.getter = {};
  boundry.setter = {};
  boundry.deleter = {};
  return boundry;
}
/**
 * Create an Array Map within standards used
 */

function createArrayMap(boundry) {
  boundry.getter = [];
  boundry.setter = [];
  boundry.deleter = [];
  return boundry;
}
/**
 * Add an property into a Map
 */

function addPropToMap(map, name, func) {
  if (!map.hasOwnProperty(name)) map[name] = [];
  map[name].push(func);
}
/**
 * Observables are of Functional Reactive Programming,
 * They simply allow you to add instantly-worked properties, when you've define
 * what to do as a subscriber
 * @export
 * @class Observable
 */

var Observable =
/*#__PURE__*/
function () {
  function Observable(subscriberFunction) {
    _classCallCheck(this, Observable);

    this.subscriberFunction = subscriberFunction;
  }

  _createClass(Observable, [{
    key: "subscribe",
    value: function subscribe(observer) {
      this.subscriberFunction(observer);
    }
  }]);

  return Observable;
}();
/* istanbul ignore next */

function depManager(map, reactable, commonMap, states) {
  var get = function get(name, func) {
    addPropToMap(map.getter, name, func);
  };

  var set = function set(name, func) {
    addPropToMap(map.setter, name, func);
  };

  var del = function del(name, func) {
    addPropToMap(map.deleter, name, func);
  };

  var add = function add(name, value) {
    reactable[name] = value;
    states[name] = value;
  };

  var common = function common(type, func) {
    switch (type) {
      case 'get':
        commonMap['getter'].push(func);
        break;

      case 'set':
        commonMap['setter'].push(func);
        break;

      case 'del':
        commonMap['deleter'].push(func);
        break;

      /* istanbul ignore next */

      default:
        err('Illegally using common Function');
    }
  };

  var past = function past(name) {
    return name ? states[name] : false;
  };

  return {
    get: get,
    set: set,
    del: del,
    add: add,
    common: common,
    past: past
  };
}
/* istanbul ignore next */

function createObservableMap(map) {
  var res = createMap({});

  var _loop = function _loop(prop) {
    var _loop2 = function _loop2(key) {
      res[prop][key] = new Observable(function (observer) {
        map[prop][key].forEach(function (x) {
          observer.next(x);
        });
      });
    };

    for (var key in map[prop]) {
      _loop2(key);
    }
  };

  for (var prop in res) {
    _loop(prop);
  }

  return res;
}

var Interpolaters = {};
var Variables = $$Variables;
/**
 * Transform an object into a Reactive Object, by Proxying or getter/setter configuring
 * @export
 * @param {Object} reactable object that will later transform into a reactive one
 * @param {Function} associator allow the user to pass the functions, asscoiated the reactive object
 * @returns Object
 */

function act(reactable, associator) {
  var map = createMap({});
  var commonMap = createArrayMap({});
  var states = JSON.parse(JSON.stringify(reactable));
  associator(depManager(map, reactable, commonMap, states));
  var observableMap = createObservableMap(map);

  if (isProxySupported && !Variables.__polyfillTest__) {
    return new Proxy(reactable, {
      get: function get(target, prop) {
        if (commonMap.getter.length > 0) commonMap.getter.forEach(function (work) {
          return work.bind(target)(target, prop);
        });

        if (observableMap.getter.hasOwnProperty(prop)) {
          observableMap.getter[prop].subscribe({
            next: function next(w) {
              return w.bind(target)(target, prop);
            }
          });
        }

        return getValueOf(target[prop], target);
      },
      set: function set(target, prop, newValue) {
        target[prop] = newValue;
        if (commonMap.setter.length > 0) commonMap.setter.forEach(function (work) {
          return work.bind(target)(target, prop);
        });

        if (observableMap.setter.hasOwnProperty(prop)) {
          observableMap.setter[prop].subscribe({
            next: function next(w) {
              return w.bind(target)(target, prop);
            }
          });
        }

        states[prop] = newValue;
        return true;
      },
      deleteProperty: function deleteProperty(target, prop) {
        if (prop in target) {
          delete target[prop];
          if (commonMap.deleter.length > 0) commonMap.deleter.forEach(function (work) {
            return work.bind(target)(target, prop);
          });

          if (observableMap.deleter.hasOwnProperty(prop)) {
            observableMap.deleter[prop].subscribe({
              next: function next(w) {
                return w.bind(target)(target, prop);
              }
            });
          }

          return true;
        } else
          /* istanbul ignore next */
          {
            err("Property Not Found : ".concat(prop));
            return false;
          }
      }
    });
  } else {
    Object.keys(reactable).forEach(function (prop) {
      var interValue = reactable[prop];
      Object.defineProperty(reactable, prop, {
        get: function get() {
          if (commonMap.getter.length > 0) commonMap.getter.forEach(function (work) {
            return work.bind(reactable)(reactable, prop);
          });

          if (observableMap.getter.hasOwnProperty(prop)) {
            observableMap.getter[prop].subscribe({
              next: function next(w) {
                return w.bind(reactable)(reactable, prop);
              }
            });
          }

          return getValueOf(interValue, reactable);
        },
        set: function set(newValue) {
          interValue = newValue;
          if (commonMap.setter.length > 0) commonMap.setter.forEach(function (work) {
            return work.bind(reactable)(reactable, prop);
          });

          if (observableMap.setter.hasOwnProperty(prop)) {
            observableMap.setter[prop].subscribe({
              next: function next(w) {
                return w.bind(reactable)(reactable, prop);
              }
            });
          }

          states[prop] = newValue;
          return true;
        }
      });
    });
    recommend("Unfortunately, your browser doesn't support Proxy,so as a polyfill, we used ES5 getters and setters,some functions will not be available in this browser.");
    return reactable;
  }
}
/**
 * Define an interpolater, for dynamically changing values by transforming it
 * @export
 * @class Interpolater
 */

var Interpolater = function Interpolater(type, consumer) {
  _classCallCheck(this, Interpolater);

  if (!Interpolaters.hasOwnProperty(type)) {
    Interpolaters[type] = consumer;
  } else
    /* istanbul ignore next */
    {
      err('Interpolater already exist.');
    }
};
/**
 * Check and work if a property is in interpolater
 * @param {property} val
 * @param {Object} self
 */

function getValueOf(val, self) {
  var result = val;

  if (isObject(val) && val.hasOwnProperty('$$type')) {
    result = Interpolaters.hasOwnProperty(val.$$type) ? Interpolaters[val.$$type](val, self) : undefined;
  }

  return result;
}

new Interpolater('Releaser', function (config, self) {
  return config.$$value(self);
});
/**
 * Release values dynamically by Releaser
 * @param {Function} fn function that will run everytime the property is called
 */

function Releaser(fn) {
  return {
    $$type: 'Releaser',
    $$value: fn
  };
}

exports.Variables = Variables;
exports.act = act;
exports.Interpolater = Interpolater;
exports.Releaser = Releaser;
