/* global using, module, require, window */

(function MO5SetBootstrap () {
    
    if (typeof using === "function") {
        using("MO5.CoreObject", "MO5.types").
        define("MO5.Set", MO5SetModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.Set = MO5SetModule(MO5.CoreObject, MO5.types);
    }
    else {
        module.exports = MO5SetModule(require("./CoreObject.js"), require("./types.js"));
    }
    
    function MO5SetModule (CoreObject, types) {
        
        var KEY_PREFIX = "MO5Set_";
        
        /**
         * A set implementation that is similar to the ES6 Set, but knows about CoreObjects.
         *
         * @type void|[any] -> Set
         * @param items Optional array or other .forEach()-implementing object with items to add.
         */
        function Set (items) {
            
            CoreObject.call(this);
            
            // We need to hold onto CoreObject listeners to unsubscribe them
            // when the item gets deleted from the set:
            this._unsubscribers = {};
            
            // An object where the keys are "hashes" for simple values or CoreObject IDs:
            this._stringItems = {};
            
            // An array that holds non-"hashable" items, that is arrays and non-CoreObject objects:
            this._items = [];
            
            if (items && types.hasForEach(items)) {
                this.addMany(items);
            }
        }
        
        Set.fromRange = function (first, last) {
            
            var set = new Set(), i;
            
            for (i = first; i <= last; i += 1) {
                set.add(i);
            }
            
            return set;
        };
        
        Set.prototype = new CoreObject();
        
        /**
         * Checks whether an item is contained in the set.
         *
         * @type any -> boolean
         * @param item The item to check.
         * @return Is the item contained in the set?
         */
        Set.prototype.has = function (item) {
            
            var i, length;
            
            if (canBeConvertedToKey(item)) {
                return (toKey(item) in  this._stringItems);
            }
            else {
                
                for (i = 0, length = this._items.length; i < length; i += 1) {
                    if (this._items[i] === item) {
                        return true;
                    }
                }
                
                return false;
            }
        };
        
        /**
         * Adds an item to the set.
         *
         * @type any -> Set
         * @param item The item to add.
         * @return The Set object.
         */
        Set.prototype.add = function (item) {
            
            var key;
            
            if (this.has(item)) {
                return this;
            }
            
            if (canBeConvertedToKey(item)) {
                
                key = toKey(item);
                this._stringItems[key] = item;
                
                if (CoreObject.isCoreObject(item)) {
                    this._unsubscribers[key] = this.delete.bind(this, item);
                    item.subscribe("destroyed", this._unsubscribers[key]);
                }
            }
            else {
                this._items.push(item);
            }
            
            return this;
        };
        
        /**
         * Removes an item from the set.
         *
         * @type any -> boolean
         * @param item The item to remove.
         * @return Has the item been deleted?
         */
        Set.prototype.delete = function (item) {
            
            var key;
            
            if (!this.has(item)) {
                return false;
            }
            
            if (canBeConvertedToKey(item)) {
                
                key = toKey(item);
                
                delete this._stringItems[key];
                
                if (CoreObject.isCoreObject(item)) {
                    item.unsubscribe("destroyed", this._unsubscribers[key]);
                    delete this._unsubscribers[key];
                }
            }
            else {
                this._items.splice(this._items.indexOf(item), 1);
            }
            
            return true;
        };
        
        /**
         * Removes all items from the set.
         *
         * @type void -> undefined
         */
        Set.prototype.clear = function () {
            this._items.forEach(this.delete.bind(this));
            this._items = [];
            this._stringItems = {};
            this._unsubscribers = {};
        };
        
        /**
         * Calls a callback for each of the items in the set with the following arguments:
         * 1) the item
         * 2) the index - this should be in the order in which the items have been added
         * 3) the set itself
         *
         * @type function -> undefined
         * @param fn A callback function.
         */
        Set.prototype.forEach = function (fn) {
            
            var key, i = 0;
            
            for (key in this._stringItems) {
                fn(this._stringItems[key], i, this);
                i += 1;
            }
            
            this._items.forEach(function (item) {
                fn(item, i, this);
                i += 1;
            }.bind(this));
        };
        
        /**
         * Returns all items in the set as an array.
         *
         * @type void -> [any]
         */
        Set.prototype.values = function () {
            
            var values = [];
            
            this.forEach(function (item) {
                values.push(item);
            });
            
            return values;
        };
        
        Set.prototype.keys = Set.prototype.values;
        
        /**
         * Adds many items to the set at once.
         *
         * @type [any] -> Set
         * @param items An array or other iterable object with a .forEach() method.
         * @return The Set object.
         */
        Set.prototype.addMany = function (items) {
            items.forEach(this.add.bind(this));
            return this;
        };
        
        Set.prototype.intersection = function (otherSet) {
            
            var result = new Set();
            
            otherSet.forEach(function (item) {
                if (this.has(item)) {
                    result.add(item);
                }
            }.bind(this));
            
            return result;
        };
        
        Set.prototype.difference = function (otherSet) {
            
            var result = new Set(this.values());
            
            otherSet.forEach(function (item) {
                if (result.has(item)) {
                    result.delete(item);
                }
                else {
                    result.add(item);
                }
            });
            
            return result;
        };
        
        Set.prototype.size = function () {
            
            var length = this._items.length, key;
            
            for (key in this._stringItems) {
                length += 1;
            }
            
            return length;
        };
        
        return Set;
        
        /**
         * Checks whether an item can be converted to string in some form to be used as a key.
         *
         * @type any -> boolean
         * @param item The item to check.
         * @return Can the item be converted to key?
         */
        function canBeConvertedToKey (item) {
            
            if (types.isObject(item)) {
                
                if (types.isNumber(item.id)) {
                    return true;
                }
                
                return false;
            }
            
            return true;
        }
        
        /**
         * Converts an item to a key that can be used as a primitive "hash" to identifiy
         * the object inside the set.
         *
         * @type any -> string
         * @param item The item to convert to key.
         * @return The key as a string.
         */
        function toKey (item) {
            
            if (types.isObject(item)) {
                return KEY_PREFIX + "MO5CoreObject_" + item.id;
            }
            
            return KEY_PREFIX + "SimpleValue_" + JSON.stringify(item);
        }
        
    }
    
}());
