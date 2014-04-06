/* global MO5 */
MO5().define("MO5.types", function () {

    var types = {};
    
    types.isObject = function (thing) {
        return (typeof thing === "object" && thing !== null);
    };
    
    return types;

});