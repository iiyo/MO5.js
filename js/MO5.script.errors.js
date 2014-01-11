/* global MO5 */
MO5().define("MO5.script.errors", function () {
    
    var errors = {};
    
    errors.ScriptError = function (message, line, column, file) {
        this.name = "ScriptError";
        this.message = message || "";
        this.scriptLine = line;
        this.scriptColumn = column;
        this.scriptFile = file;
    };
    
    errors.ScriptError.prototype = new Error();
    
    createError("TypeError");
    createError("ReferenceError");

    return errors;
    
    function createError (name) {
        
        errors[name] = function () {
            errors.ScriptError.apply(this, arguments);
            this.name = name;
        };
        
        errors[name].prototype = new errors.ScriptError();
    }
});