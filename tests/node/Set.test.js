/* global require, describe, it */

var assert = require("assert");
var CoreObject = require("../../js/CoreObject.js");
var Set = require("../../js/Set.js");

describe("MO5.Set", function () {
    
    describe("constructor", function () {
        
        it("should add the items given to it as an array.", function (done) {
            
            var o = {foo: "bar"};
            var co = new CoreObject();
            var items = [1, 2, 3, "foo", "bar", o, co];
            var s = new Set(items);
            
            items.forEach(function (item) {
                assert(s.has(item), "The item should be in the set.");
            });
            
            done();
        });
        
    });
    
    describe(".prototype.add(item)", function () {
        
        it("should add any type of item to the set and return the Set object.", function (done) {
            
            var o = {foo: "bar"};
            var co = new CoreObject();
            var items = [1, 2, 3, "foo", "bar", o, co, null, undefined, 2.22, [1, 2, 3]];
            var s = new Set();
            
            items.forEach(function (item) {
                assert(s.add(item) instanceof Set, "The Set object must be returned.");
                assert(s.has(item), "The item should be in the set.");
            });
            
            done();
        });
        
    });
    
    describe(".prototype.delete(item)", function () {
        
        it("should delete an item from the Set object and return a boolean.", function (done) {
            
            var o = {foo: "bar"};
            var co = new CoreObject();
            var items = [1, 2, 3, "foo", "bar", o, co, null, undefined, 2.22, [1, 2, 3]];
            var itemsToDelete = ["bar", 1, 2, o, co, null];
            var s = new Set();
            
            items.forEach(s.add.bind(s));
            
            itemsToDelete.forEach(function (item) {
                assert.equal(typeof s.delete(item), "boolean", "The return value must be a boolean.");
                assert(!s.has(item), "The item should be deleted.");
            });
            
            done();
        });
        
    });
    
    describe(".prototype.has(item)", function () {
        
        it("should return true for added items.", function (done) {
            
            var o = {foo: "bar"};
            var co = new CoreObject();
            var items = [1, 2, 3, "foo", "bar", o, co, null, undefined, 2.22, [1, 2, 3]];
            var s = new Set();
            
            items.forEach(function (item) {
                s.add(item);
                assert(typeof s.has(item), "boolean", "The return value must be boolean.");
                assert(s.has(item) === true, "The return value must be true");
            });
            
            done();
        });
        
        it("should return false for items not in the set.", function (done) {
            
            var o = {foo: "bar"};
            var co = new CoreObject();
            var items = [1, 2, 3, "foo", "bar", o, co, null, undefined, 2.22, [1, 2, 3]];
            var s = new Set();
            
            items.forEach(function (item) {
                assert(typeof s.has(item), "boolean", "The return value must be boolean.");
                assert(s.has(item) === false, "The return value must be false");
            });
            
            done();
        });
        
        it("should return false for destroyed CoreObjects.", function (done) {
            
            var items = [new CoreObject(), new CoreObject(), 1, 2, new CoreObject()];
            var s = new Set();
            
            items.forEach(function (item) {
                
                s.add(item);
                
                if (CoreObject.isCoreObject(item)) {
                    item.destroy();
                    assert(s.has(item) === false, "Return value should be false for CoreObejcts.");
                }
                else {
                    assert(s.has(item) === true, "Return value should be true for other items.");
                }
            });
            
            done();
        });
        
    });
    
});
