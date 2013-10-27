/* global MO5 */
MO5().define("MO5.script.Context", function () {

    /**
     * A class representing the context in which a script
     * or part of a script is executed in.
     * @param scope The default scope of this context.
     * @param parentScope The parent scope of the current scope. Is optional.
     */
    function  Context (scope, parentContext) {
        this.scope = scope;
        this.parentContext = parentContext;
    }
    
    /**
     * Looks up a symbol in the current scope. If it is not found
     * it looks up the symbol in the parent scope, if there is one.
     * If the symbol is neither in the current scope nor in the parent scope
     * the method returns undefined.
     * @param symbol The name of the symbol to find.
     */
    Context.prototype.find = function (symbol) {
        
        if (symbol in this.scope) {
            return this.scope[symbol];
        }
        
        if (this.parentContext) {
            return this.parentContext.find(symbol);
        }
    };
    
    Context.prototype.set = function (name, value) {
        this.scope[name] = value;
    };

    return Context;
    
});