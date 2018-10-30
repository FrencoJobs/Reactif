import {
    isProxySupported,
    $$Variables,
    createMap,
    createArrayMap,
    createObservableMap,
    depManager,
    isObject,
    err,
    recommend
} from './utils'

let Interpolaters = {}
export let Variables = $$Variables 
/**
 * Transform an object into a Reactive Object, by Proxying or getter/setter configuring
 * @export
 * @param {Object} reactable object that will later transform into a reactive one
 * @param {Function} associator allow the user to pass the functions, asscoiated the reactive object
 * @returns Object
 */
export function act(reactable, associator){
    let map = createMap({})
    let commonMap = createArrayMap({})
    let states = JSON.parse(JSON.stringify(reactable))
    associator(depManager(map,reactable,commonMap,states))
    let observableMap = createObservableMap(map)
    if(isProxySupported && !Variables.__polyfillTest__){
        return new Proxy(reactable,{
            get(target,prop){
                if(commonMap.getter.length > 0) commonMap.getter.forEach(work => work.bind(target)(target,prop))
                if(observableMap.getter.hasOwnProperty(prop)){
                    observableMap.getter[prop]
                    .subscribe({ next: w => w.bind(target)(target,prop) })
                }
                return getValueOf(target[prop],target);
            },
            set(target,prop,newValue){
                target[prop] = newValue
                if(commonMap.setter.length > 0) commonMap.setter.forEach(work => work.bind(target)(target,prop))
                if(observableMap.setter.hasOwnProperty(prop)){
                    observableMap.setter[prop]
                    .subscribe({ next: w =>w.bind(target)(target,prop) })
                }
                states[prop] = newValue
                return true
            },
            deleteProperty(target,prop){
                if(prop in target){
                    delete target[prop]
                    if(commonMap.deleter.length > 0) commonMap.deleter.forEach(work => work.bind(target)(target,prop))
                    if(observableMap.deleter.hasOwnProperty(prop)){
                        observableMap.deleter[prop]
                        .subscribe({ next: w => w.bind(target)(target,prop) })
                    }
                    return true;
                } else /* istanbul ignore next */{
                    err(`Property Not Found : ${prop}`)
                    return false;
                }
            }
        })
    } else {
    function defineProp(target){
        Object.keys(target).forEach(prop =>{
            let interValue = target[prop]
            Object.defineProperty(target,prop,{
                get(){
                    if(commonMap.getter.length > 0) commonMap.getter.forEach(work => work.bind(target)(target,prop))
                    if(observableMap.getter.hasOwnProperty(prop)){
                        observableMap.getter[prop]
                        .subscribe({ next: w => w.bind(target)(target,prop) })
                    }
                    return getValueOf(interValue,target)
                },
                set(newValue){
                    interValue = newValue
                    if(commonMap.setter.length > 0) commonMap.setter.forEach(work => work.bind(target)(target,prop))
                    if(observableMap.setter.hasOwnProperty(prop)){
                        observableMap.setter[prop]
                        .subscribe({ next: w =>w.bind(target)(target,prop) })
                    }
                    states[prop] = newValue
                    return true
                }
            })
        })
    }
    recommend(`Unfortunately, your browser doesn't support Proxy,so as a polyfill, we used ES5 getters and setters,some functions will not be available in this browser.`)
    defineProp(reactable);
    return reactable
}
}
/**
 * Define an interpolater, for dynamically changing values by transforming it
 * @export
 * @class Interpolater
 */
export class Interpolater{
    constructor(type,consumer){
            if(!Interpolaters.hasOwnProperty(type)){
        Interpolaters[type] = consumer
    } else /* istanbul ignore next */{
        err('Interpolater already exist.')
    }
    }
}
/**
 * Check and work if a property is in interpolater
 * @param {property} val 
 * @param {Object} self 
 */
function getValueOf(val,self){
    let result = val
    if(isObject(val) && val.hasOwnProperty('$$type')){
        result = Interpolaters.hasOwnProperty(val.$$type)
        ? Interpolaters[val.$$type](val,self)
        : undefined
    }
    return result;
}
new Interpolater('Releaser',function(config,self){
    return config.$$value(self)
})
/**
 * Release values dynamically by Releaser
 * @param {Function} fn function that will run everytime the property is called
 */
export function Releaser(fn){
    return {
        $$type: 'Releaser',
        $$value: fn
    }
}