/* global MO5 */
MO5("MO5.Map").
define("MO5.script.GlobalScope", function (Map) {

    function GlobalScope () {}
    
    GlobalScope.prototype.print = function (value) {
        console.log(value);
        return value;
    };
    
    GlobalScope.prototype.head = function (list) {
        return list[0];
    };
    
    GlobalScope.prototype.tail = function (list) {
        return list.slice(1);
    };
    
    GlobalScope.prototype["+"] = function () {
        
        var sum, i, len, args = [].slice.call(arguments);
        
        sum = +args[0];
        
        for (i = 1, len = args.length; i < len; i += 1) {
            sum += +args[i];
        }
        
        return sum;
        
    };
    
    GlobalScope.prototype["-"] = function () {
        
        var sum, i, len, args = [].slice.call(arguments);
        
        sum = +args[0];
        
        if (args.length < 2) {
            return -sum;
        }
        
        for (i = 1, len = args.length; i < len; i += 1) {
            sum -= +args[i];
        }
        
        return sum;
        
    };
    
    GlobalScope.prototype["*"] = function () {
        
        var result, i, len, args = [].slice.call(arguments);
        
        result = +args[0];
        
        for (i = 1, len = args.length; i < len; i += 1) {
            result *= +args[i];
        }
        
        return result;
        
    };
    
    GlobalScope.prototype["/"] = function () {
        
        var result, i, len, args = [].slice.call(arguments);
        
        result = +args[0];
        
        for (i = 1, len = args.length; i < len; i += 1) {
            result /= +args[i];
        }
        
        return result;
        
    };
    
    GlobalScope.prototype["="] = function (a, b) {
        return a === b;
    };
    
    GlobalScope.prototype["<"] = function (a, b) {
        return a < b;
    };
    
    GlobalScope.prototype[">"] = function (a, b) {
        return a > b;
    };
    
    GlobalScope.prototype["<="] = function (a, b) {
        return a <= b;
    };
    
    GlobalScope.prototype[">="] = function (a, b) {
        return a >= b;
    };
    
    GlobalScope.prototype.and = function (a, b) {
        return a && b;
    };
    
    GlobalScope.prototype.or = function (a, b) {
        return a || b;
    };
    
    GlobalScope.prototype.length = function (a) {
        return a.length;
    };
    
    GlobalScope.prototype["function?"] = function (a) {
        return typeof a === "function";
    };
    
    GlobalScope.prototype["nil?"] = function (a) {
        return a === null || a === undefined;
    };
    
    GlobalScope.prototype["boolean?"] = function (a) {
        return typeof a === "boolean";
    };
    
    GlobalScope.prototype["string?"] = function (a) {
        return typeof a === "string";
    };
    
    GlobalScope.prototype["number?"] = function (a) {
        return typeof a === "number";
    };
    
    GlobalScope.prototype["zero?"] = function (a) {
        return a === 0;
    };
    
    GlobalScope.prototype["arity?"] = function (a) {
        return a.__argsCount__ || a.length || 0;
    };
    
    GlobalScope.prototype.explain = function (a) {
        return a.__description__ || "No description available";
    };
    
    GlobalScope.prototype.type = function (a) {
        var type = typeof a;
        
        if (a === null || type === "undefined") {
            return "nil";
        }
        
        if (type === "boolean") {
            return "boolean";
        }
        
        if (type === "number") {
            return "number";
        }
        
        if (type === "function") {
            return "function";
        }
        
        if (type === "string") {
            return "string";
        }
        
        if (type === "object") {
            if (Array.isArray(a)) {
                return "list";
            }
            
            return "object";
        }
    };
    
    /**
     * Creates a hash table, which is an MO5.Map internally.
     */
    GlobalScope.prototype["#"] = function () {
        return new Map();
    };
    
    /**
     * Adds a key-value pair to a hash table.
     */
    GlobalScope.prototype["#-set"] = function (map, key, value) {
        
        if (key && key.value) {
            key = key.value;
        }
        
        map.set(key, value);
        
        return value;
    };
    
    /**
     * Returns the value at the specified key inside a hash table.
     */
    GlobalScope.prototype["#-get"] = function (map, key) {
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.get(key);
    };
    
    GlobalScope.prototype["#-has?"] = function (map, key) {
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.has(key);
    };
    
    /**
     * Removes a key-value pair from a hash table.
     */
    GlobalScope.prototype["#-remove"] = function (map, key) {
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.remove(key);
    };
    
    /**
     * Defers the execution of a function for $duration milliseconds.
     */
    GlobalScope.prototype.defer = function (fun, duration) {
        
        if (typeof fun !== "function") {
            throw new Error("Procedure defer expects parameter 1 to be of type function");
        }
        
        return setTimeout(fun, duration);
    };
    
    GlobalScope.prototype.range = function (start, end) {
        
        var range = [], i;
        
        start = start | 0;
        end = end | 0;
        
        if (start <= end) {
            for (i = start; i <= end; i += 1) {
                range.push(i);
            }
        }
        else {
            for (i = start; i >= end; i -= 1) {
                range.push(i);
            }
        }
        
        return range;
    };
    
    GlobalScope.prototype.random = function () {
        return Math.random();
    };
    
    GlobalScope.prototype.integer = function (a) {
        return a | 0;
    };
    
    GlobalScope.prototype.float = function (a) {
        return +a;
    };
    
    GlobalScope.prototype.string = function (a) {
        return "" + a;
    };
    
    GlobalScope.prototype.round = function (a) {
        return Math.round(a);
    };
    
    GlobalScope.prototype.each = function (arr, fun) {
        
        var returnValue;
        
        console.log("arr:", arr, typeof arr, Array.isArray(arr));
        
        if (!Array.isArray(arr)) {
            throw new Error("Procedure each expects parameter 1 to be of type list");
        }
        
        if (typeof fun !== "function") {
            throw new Error("Procedure each expects parameter 2 to be of type function");
        }
        
        arr.forEach(function (item, i) {
            returnValue = fun(typeof item.value === "undefined" ? item : item.value, i);
        });
        
        return returnValue;
    };
    
    return GlobalScope;
    
    
    ////////////////////////////////////
    // Helper functions
    ////////////////////////////////////

    function isString (thing) {
        return typeof thing === "string";
    }
    
    function assert (condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
});