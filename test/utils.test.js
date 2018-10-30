import {
    isObject,
    createMap,
    createArrayMap,
    addPropToMap,
    inBrowser,
    hasConsole,
    $$Variables,
    Observable,
    err,
    recommend
} from '../src/utils'

describe('Checkings -->', () => {
    test('inBrowser should return false', () => {
        expect(inBrowser).toBeTruthy()
    })
    test('hasConsole should return true', () => {
        expect(hasConsole).toBeTruthy()
    })
    test('isObject should return', () => {
        expect(isObject({})).toBeTruthy()
        expect(isObject([])).toBeTruthy()
        expect(isObject(new Map())).toBeTruthy()
        expect(isObject(new Set())).toBeTruthy()
        expect(isObject(null)).toBeFalsy();
        expect(isObject()).toBeFalsy()
    })
})

describe('Observables', () => {
    test('should be subscribe-able', () => {
        let msg;
        new Observable(function(observer){ observer.next('Hello, World') })
        .subscribe({
            next: _msg=> msg =_msg
        })
        expect(msg).toBe('Hello, World');
    })
})

describe('Helpers -->', () => {
    test('createMap should return ', () => {
        expect(createMap({})).toEqual({getter:{},setter:{},deleter:{}});
    });
    test('createArrayMap should return ', () => {
        expect(createArrayMap({})).toEqual({getter:[],setter:[],deleter:[]});
    });
    test('addPropToMap should work properly', () => {
        let map = createMap({})
        addPropToMap(map.getter,'price',1)
        expect(map).toEqual({getter:{price:[1]},setter:{},deleter:{}})
    });
    test('Notifiers should work', () => {
        expect(err('')).toBeFalsy();
        expect(recommend('')).toBeTruthy();
    });
});