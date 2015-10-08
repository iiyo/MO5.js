/* global MO5, window, module */

(function MO5rangeBootstrap () {
    
    if (typeof using === "function") {
        using().define("MO5.range", MO5rangeModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.range = MO5rangeModule();
    }
    else {
        module.exports = MO5rangeModule();
    }
    
    function MO5rangeModule () {
        
        function range (first, last) {
            
            var bag = [], i;
            
            for (i = first; i <= last; i += 1) {
                bag.push(i);
            }
            
            return bag;
        }
        
        return range;
    }
    
}());