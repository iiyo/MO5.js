/* global MO5 */

MO5("MO5.Exception").define("MO5.assert", function (Exception) {
    
    function AssertionException () {
        Exception.apply(this, arguments);
        this.name = "AssertionException";
    }
    
    AssertionException.prototype = new Exception();
    
    function assert (condition, message) {
        if (!condition) {
            throw new AssertionException(message);
        }
    }
    
    return assert;
    
});