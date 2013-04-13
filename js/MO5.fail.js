(function (out) {
    
    /**
     * A function to log errors with stack traces to the console.
     * Useful if you encounter some minor errors that are no show-stoppers
     * and should therefore not be thrown, but which can help
     * debug your code by looking at the console output.
     */
    out.fail = function (e) {
        
        if (console.error) {
            console.error(e.toString());
        }
        else {
            console.log(e.toString());
        }
        
        if (e.stack) {
            console.log(e.stack);
        }
    };
    
}(MO5));