/* global MO5, window, module */

(function MO5typesBootstrap () {
    
    if (typeof MO5 === "function") {
        MO5().define("MO5.types", MO5typesModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.types = MO5typesModule();
    }
    else {
        module.exports = MO5typesModule();
    }
    
    function MO5typesModule () {

        var types = {};

        types.isObject = function (thing) {
            return (typeof thing === "object" && thing !== null);
        };

        types.isString = function (thing) {
            return typeof thing === "string";
        };
        
        types.isNumber = function (thing) {
            return typeof thing === "number";
        };

        types.isArray = function (thing) {

            if (Array.isArray) {
                return Array.isArray(thing);
            }
            
            if (!types.isObject(thing)) {
                return false;
            }

            return thing instanceof Array;
        };

        return types;

    }
}());