import {
    act,
    Variables,
    Releaser
}
from '../src'
Variables.__polyfillTest__ = true;
let count,past,msg
let data = act({
    price: 5,
    quantity: 2,
    discount: 2.5,
    total: Releaser(self => self.price*self.quantity)
},function(dep){
    dep.get('price',()=>{
        count++
    })
    dep.set('quantity',()=>{
        count++
    })
    dep.add('luckyDraw',false)
    dep.common('set',(target,prop)=>{
        past = dep.past(prop)
    })
    dep.common('get',(target,prop)=>{
        msg = `get ${prop}`
    })
    dep.add('luckyDraw',false)
})

describe('dep.', () => {
    beforeEach(() => {
        count = 0
        past = 0
        msg = ''
    })
    test('get should work properly', (done) => {
        let price = data.price
        expect(price).toBe(5)
        expect(count).toBe(1)
        done()
    });
    test('set should work properly', (done) => {
        data.quantity++
        expect(data.quantity).toBe(3)
        expect(count).toBe(1)
        done()
    });
    test('add should work properly', (done) => {
        expect(data.luckyDraw).toBeDefined();
        expect(data.luckyDraw).toBeFalsy();
        done()
    });
    test('common should work properly', (done) => {
        data.price = 6
        data.luckyDraw = true
        expect(data.price).toBe(6);
        expect(data.luckyDraw).toBeTruthy();
        expect(past).toBeFalsy();
        expect(msg).toBe('get luckyDraw')
        done()
    });
    test('past should work properly', (done) => {
        data.price = 12
        data.price = 10
        expect(past).toBe(12);
        done()
    });
});

describe('Interpolater', () => {
    test('Releaser should work properly', (done) => {
        data.price = 5
        data.quantity = 2
        expect(data.total).toBe(10)
        data.price = 8
        expect(data.total).toBe(16)
        done()
    });
});