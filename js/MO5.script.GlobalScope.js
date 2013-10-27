/* global MO5 */
MO5().define("MO5.script.GlobalScope", function () {

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
    
    return GlobalScope;

});