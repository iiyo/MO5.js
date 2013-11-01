/* global MO5 */
MO5().define("MO5.script.Context", function () {
    
    function makeKey (name) {
        return "MO5.Script." + name;
    }

    /**
     * A class representing the context in which a script
     * or part of a script is executed in.
     * @param scope The default scope of this context.
     * @param parentScope The parent scope of the current scope. Is optional.
     */
    function  Context (scope, parentContext) {
        this.scope = {};
        this.macros = {};
        this.parentContext = parentContext;
        
        for (var key in scope) {
            this.scope[makeKey(key)] = scope[key];
        }
    }
    
    /**
     * Looks up a symbol in the current scope. If it is not found
     * it looks up the symbol in the parent scope, if there is one.
     * If the symbol is neither in the current scope nor in the parent scope
     * the method returns undefined.
     * @param symbol The name of the symbol to find.
     */
    Context.prototype.find = function (symbol) {
        
        if (makeKey(symbol) in this.scope) {
            return this.scope[makeKey(symbol)];
        }
        
        if (this.parentContext) {
            return this.parentContext.find(symbol);
        }
    };
    
    Context.prototype.findMacro = function (name) {
        
        if (makeKey(name) in this.macros) {
            return this.macros[makeKey(name)];
        }
        
        if (this.parentContext) {
            return this.parentContext.findMacro(name);
        }
    };
    
    Context.prototype.set = function (name, value) {
        this.scope[makeKey(name)] = value;
    };
    
    Context.prototype.setMacro = function (name, value) {
        this.macros[makeKey(name)] = value;
    };
    
    Context.prototype.has = function (name) {
        return makeKey(name) in this.scope || 
            (this.parentContext && this.parentContext.has(name));
    };
    
    Context.prototype.hasMacro = function (name) {
        return makeKey(name) in this.macros || 
            (this.parentContext && this.parentContext.hasMacro(name));
    };
    
    Context.prototype.change = function (name, value) {
        if (makeKey(name) in this.scope) {
            this.scope[makeKey(name)] = value;
        }
        else {
            if (!this.parentContext) {
                throw new Error("Unknown variable");
            }
            else {
                this.parentContext.change(name, value);
            }
        }
    };
    
    Context.prototype.changeMacro = function (name, value) {
        if (makeKey(name) in this.macros) {
            this.macros[makeKey(name)] = value;
        }
        else {
            if (!this.parentContext) {
                throw new Error("Unknown variable");
            }
            else {
                this.parentContext.changeMacro(name, value);
            }
        }
    };

    return Context;
    
});