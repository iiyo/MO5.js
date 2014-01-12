/* global MO5 */
MO5("MO5.Map", "MO5.script.Tokenizer", "MO5.script.Pair", "MO5.script.Printer").
define("MO5.script.GlobalScope", function (Map, Tokenizer, Pair, Printer) {
    
    var printer = new Printer();

    function GlobalScope () {}
    
    GlobalScope.prototype.pair = function (head, tail) {
        var pair = new Pair();
        
        pair.head = head;
        pair.tail = tail;
        
        console.log(JSON.stringify(pair));
        
        return pair;
    };
    
    GlobalScope.prototype.apply = function (fun, args) {
        return fun.apply(undefined, args.toArray());
    };
    
    GlobalScope.prototype.call = function (fun) {
        return fun.apply(undefined, [].slice.call(arguments, 1));
    };
    
    GlobalScope.prototype.print = function (value) {
        console.log(printer.print(value));
        return value;
    };
    
    GlobalScope.prototype.head = function (list) {
        assert(list instanceof Pair, "Procedure head expects its argument to be a list");
        return list.head;
    };
    
    GlobalScope.prototype.tail = function (list) {
        assert(list instanceof Pair, "Procedure tail expects its argument to be a list");
        return list.tail;
    };
    
    GlobalScope.prototype.list = function () {
        return [].slice.call(arguments);
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
    
    GlobalScope.prototype.not = function (a) {
        return !a;
    };
    
    GlobalScope.prototype.length = function (a) {
        return Pair.toArray(a).length;
    };
    
    GlobalScope.prototype["procedure?"] = function (a) {
        return !!(typeof a === "function" && !a.isMacro);
    };
    
    GlobalScope.prototype["macro?"] = function (a) {
        return !!(typeof a === "function" && a.isMacro);
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
    
    GlobalScope.prototype.arity = function (a) {
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
    
    GlobalScope.prototype["append!"] = function (item, list) {
        
        var arr, newPair;
        
        assert(list instanceof Pair, "Procedure append! expects a list as its second argument");
        
        newPair = new Pair();
        arr = list.segments();
        arr[arr.length - 1].tail = newPair;
        newPair.head = item;
        
        return list;
    };
    
    GlobalScope.prototype["prepend!"] = function (item, list) {
        
        var newPair;
        
        assert(list instanceof Pair, "Procedure prepend! expects a list as its second argument");
        
        newPair = new Pair();
        newPair.head = list.head;
        newPair.tail = list.tail;
        list.head = item;
        list.tail = newPair;
        
        return list;
    };
    
    GlobalScope.prototype.append = makeAddItemToListFn("push", "append");
    GlobalScope.prototype.prepend = makeAddItemToListFn("unshift", "prepend");
    
    function makeAddItemToListFn (type, name) {
        return function (item, list) {
            var newList;
        
            assert(Array.isArray(list), "Procedure " + name + " expects a list as its second argument");
            
            newList = list.slice(0);
            newList[type](item);
            
            return newList;
        };
    }
    
    /**
     * Creates a hash table, which is an MO5.Map internally.
     */
    GlobalScope.prototype["#"] = function () {
        return new Map();
    };
    
    GlobalScope.prototype["#?"] = function (map) {
        return (map.id && map.implements(new Map())) ? true : false;
    };
    
    /**
     * Adds a key-value pair to a hash table.
     */
    GlobalScope.prototype["#-set"] = function (map, key, value) {
        
        assert(map.id && map.implements(new Map()), "Procedure #-set expects its " +
            "first argument to be a #");
        
        if (Array.isArray(key)) {
            if (key[0].type === Tokenizer.SYMBOL && key[0].value === "quote") {
                console.log("is quote");
                key = key[1];
            }
            else {
                console.log("is not a quote");
                key = key[0];
            }
        }
        
        if (key && key.value) {
            key = key.value;
        }
        
        console.log("Setting key/value on #:", key, value);
        
        map.set(key, value);
        
        return value;
    };
    
    /**
     * Returns the value at the specified key inside a hash table.
     */
    GlobalScope.prototype["#-get"] = function (map, key) {
        
        assert(map.id && map.implements(new Map()), "Procedure #-get expects its " +
            "first argument to be a #");
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.get(key);
    };
    
    GlobalScope.prototype["#-has?"] = function (map, key) {
        
        assert(map.id && map.implements(new Map()), "Procedure #-has? expects its " +
            "first argument to be a #");
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.has(key);
    };
    
    /**
     * Removes a key-value pair from a hash table.
     */
    GlobalScope.prototype["#-remove"] = function (map, key) {
        
        assert(map.id && map.implements(new Map()), "Procedure #-remove expects its " +
            "first argument to be a #");
        
        if (key && key.value) {
            key = key.value;
        }
        
        return map.remove(key);
    };
    
    /**
     * Defers the execution of a function for $duration milliseconds.
     */
    GlobalScope.prototype.defer = function (duration, fun) {
        
        assert(typeof fun === "function", 
            "Procedure defer expects a procedure as its second argument");
        
        return setTimeout(fun, duration);
    };
    
    GlobalScope.prototype.range = function (start, end) {
        
        var range = new Pair(), i, current = range;
        
        console.log("arguments in range():", arguments);
        
        assert(arguments.length === 2, "Procedure range expects exactly 2 arguments: start, end");
        assert(typeof start === "number" && typeof end === "number", "Procedure range expects" +
            " both its arguments to be of type number");
        
        start = start | 0;
        end = end | 0;
        
        if (start <= end) {
            for (i = start; i <= end; i += 1) {
                appendItemToRange(i);
            }
        }
        else {
            for (i = start; i >= end; i -= 1) {
                appendItemToRange(i);
            }
        }
        
        console.dir(range);
        
        return range.tail || new Pair();
        
        function appendItemToRange (i) {
            current.tail = new Pair();
            current.tail.head = i;
            current = current.tail;
        }
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
    
    GlobalScope.prototype.string = function () {
        
        var out = "";
        
        [].forEach.call(arguments, function (part) {
            out += "" + part;
        });
        
        return out;
    };
    
    GlobalScope.prototype.string.__description__ = 
        "Builds one string from one or more arguments, converting any non-string values.";
    
    GlobalScope.prototype.round = function (a) {
        assert(typeof a === "number", "Procedure round expects its parameter to be a number");
        return Math.round(a);
    };
    
    GlobalScope.prototype.each = function (arr, fun) {
        
        var returnValue;
        
        if (!Pair.isPair(arr)) {
            throw new Error("Procedure each expects parameter 1 to be a list");
        }
        
        if (typeof fun !== "function") {
            throw new Error("Procedure each expects parameter 2 to be of a procedure");
        }
        
        arr.each(function (item, i) {
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