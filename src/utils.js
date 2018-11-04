export let isProxySupported = (typeof Proxy !== 'undefined')
export let inBrowser = (typeof window !== 'undefined')
export let hasConsole = (typeof console !== 'undefined')
export let $$Variables = {
  __polyfillTest__: false,
  __version__: '0.0.0-development'
}

/**
 * Check if it's an Object or not, excluded `null`
 */
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}
/**
 * Do Nothing.
 */
let noop = (a) => {}
export let err = noop
export let recommend = noop
if ('ENV' !== 'production') {
  /**
     * Notified with an error message
     */
  err = (msg) => {
    hasConsole && inBrowser
      ? console.info(`%c[Reactif error]: %c` + msg, 'font-weight:bold;color:red;', 'font-weight:bold;color:black')
    /* istanbul ignore next */
      : console.info(`[Reactif error]:` + msg)
    return false
  }
  /**
     * Notified with a recommendation message
     */
  recommend = (msg) => {
    hasConsole && inBrowser
      ? console.info(`%c[Reactif ${$$Variables.__version__}]: %c` + msg, 'font-weight:bold;color:green;', 'font-weight:bold;color:black')
    /* istanbul ignore next */
      : console.info(`[Reactif ${$$Variables.__version__}]:` + msg)
    return true
  }
}
/**
 * Create a Map within standards used
 */
export function createMap (boundry) {
  boundry.getter = {}
  boundry.setter = {}
  boundry.deleter = {}
  return boundry
}
/**
 * Create an Array Map within standards used
 */
export function createArrayMap (boundry) {
  boundry.getter = []
  boundry.setter = []
  boundry.deleter = []
  return boundry
}
/**
 * Add an property into a Map
 */
export function addPropToMap (map, name, func) {
  if (!map.hasOwnProperty(name)) map[name] = []
  map[name].push(func)
}
/**
 * Observables are of Functional Reactive Programming,
 * They simply allow you to add instantly-worked properties, when you've define
 * what to do as a subscriber
 * @export
 * @class Observable
 */
export class Observable {
  constructor (subscriberFunction) {
    this.subscriberFunction = subscriberFunction
  }
  subscribe (observer) {
    this.subscriberFunction(observer)
  }
}
/* istanbul ignore next */
export function depManager (map, reactable, commonMap, states) {
  let get = (name, func) => {
    addPropToMap(map.getter, name, func)
  }
  let set = (name, func) => {
    addPropToMap(map.setter, name, func)
  }
  let del = (name, func) => {
    addPropToMap(map.deleter, name, func)
  }
  let add = (name, value) => {
    reactable[name] = value
    states[name] = value
  }
  let common = (type, func) => {
    switch (type) {
      case 'get':
        commonMap['getter'].push(func)
        break
      case 'set':
        commonMap['setter'].push(func)
        break
      case 'del':
        commonMap['deleter'].push(func)
        break
        /* istanbul ignore next */
      default:
        err('Illegally using common Function')
    }
  }
  let past = name => {
    return name ? states[name] : false
  }
  return { get, set, del, add, common, past }
}

/* istanbul ignore next */
export function createObservableMap (map) {
  let res = createMap({})
  for (let prop in res) {
    for (let key in map[prop]) {
      res[prop][key] = new Observable(function (observer) {
        map[prop][key].forEach(x => { observer.next(x) })
      })
    }
  }
  return res
}
