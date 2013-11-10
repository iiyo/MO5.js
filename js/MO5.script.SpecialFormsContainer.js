/* global MO5 */
MO5("MO5.script.Context", "MO5.script.Tokenizer", "MO5.script.Pair").
define("MO5.script.SpecialFormsContainer", function (Context, Tokenizer, Pair) {

    function SpecialFormsContainer () {}
    
    SpecialFormsContainer.prototype.progn = function (execute, pair, context) {
        
        var returnValue;
        
        pair.eachTail(function (item) {
            returnValue = execute(item, context);
        });
        
        return returnValue;
    };
    
    SpecialFormsContainer.prototype["eval"] = function (execute, pair, context) {
        var pairToEvaluate, error;
        
        if (pair.length !== 2) {
            throw new Error("Special form eval takes exactly one argument.");
        }
        
        if (pair.second() && pair.second().head && pair.second().head.type === Tokenizer.SYMBOL && 
                pair.second().head.value === "quote") {
            pairToEvaluate = pair.third();
        }
        else {
            pairToEvaluate = pair.second();
        }
        
        //console.log("pairToEvaluate:", pairToEvaluate);
        
        if (pairToEvaluate.type && pairToEvaluate.type === Tokenizer.SYMBOL) {
            if (!context.has(pairToEvaluate.value)) {
                error = new Error("Unbound symbol '" + pairToEvaluate.value + "'");
                error.scriptLine = pairToEvaluate.line;
                error.scriptColumn = pairToEvaluate.column;
                error.fileName = "(eval'd code)";
                throw error;
            }
            
            pairToEvaluate = context.find(pairToEvaluate.value);
        }
        
        return execute(pairToEvaluate, context);
    };
    
    SpecialFormsContainer.prototype["dump-context"] = function (execute, pair, context) {
        console.log(context);
    };
    
    SpecialFormsContainer.prototype.macro = function (execute, pair, context) {
        
        var name;
        
        name = pair.tail.head.head.value;
        
        function macro (ctx) {
            var scope = {}, args = [].slice.call(arguments, 1), ret, newContext;
            
            //console.log("pair in call to macro: ", pair, "; context:", context);
            
            pair.tail.head.eachTail(function (item, i) {
                scope[item.head.value] = args[0][i];
            });
            
            scope.$arguments = args[0];
            
            //console.log("scope in macro:", scope);
            
            newContext = new Context(scope, ctx);
            
            pair.tail.tail.tail.eachTail(function (item) {
                ret = execute(item, newContext);
            });
            
            return ret;
        }
        
        macro.__argsCount__ = pair.tail.length || 0;
        macro.isMacro = true;
        
        context.setMacro(name, macro);
        
        return macro;
    };
    
    SpecialFormsContainer.prototype["exists?"] = function (execute, pair, context) {
        return !!(pair.tail && pair.tail.type && pair.tail.type === Tokenizer.SYMBOL && 
            (context.has(pair.tail.value) || context.hasMacro(pair.tail.value)));
    };
    
    SpecialFormsContainer.prototype.define = function (execute, pair, context) {
        
        var name, value, lambdaList, last;
        
        if (pair.tail.head.head) {
            name = pair.tail.head.head.value;
            lambdaList = new Pair({type: Tokenizer.SYMBOL, value: "lambda"}, pair.tail);
            
            last = lambdaList;
            
            pair.tail.head.eachTail(function (item) {
                last.tail = item;
                last = item;
            });
            
            value = execute(lambdaList, context);
        }
        else {
            name = pair.tail.head.value;
            value = pair.tail.tail.value ? pair.tail.tail.value : execute(pair.tail.tail, context);
        }
        
        context.set(name, value);
        
        return value;
    };
    
    SpecialFormsContainer.prototype.set = function (execute, pair, context) {
        
        var name, value;
        
        name = pair.tail.value;
        value = pair.tail.tail.value ? pair.tail.tail.value : execute(pair.tail.tail, context);
        
        try {
            context.change(name, value);
        }
        catch (e) {
            throw new Error("Cannot set value on undefined symbol '" + name + "'");
        }
        
        return value;
    };
    
    SpecialFormsContainer.prototype["if"] = function (execute, pair, context) {
        
        //console.log("pair[1] in if: ", pair[1]);
        
        if (execute(pair.tail, context)) {
            return execute(pair.tail.tail, context);
        }
        
        return execute(pair.tail.tail.tail, context);
    };
    
    SpecialFormsContainer.prototype.quote = function (execute, pair, context) {
        return pair.tail;
    };
    
    function isPrimitive (type) {
        return type === Tokenizer.NUMBER || type === Tokenizer.STRING || type === Tokenizer.BOOLEAN;
    }
    
    SpecialFormsContainer.prototype["to-quote"] = function (execute, pair, context) {
        
        var quote = {
            type: Tokenizer.SYMBOL,
            value: "quote",
            line: pair.head.line,
            column: pair.head.column
        };
        
        return new Pair(quote, pair.tail);
    };
    
    SpecialFormsContainer.prototype.lambda = function (execute, pair, context) {
        
        function lambda () {
            var scope = {}, args = arguments, ret, newContext;
            
            //console.log("pair in call to lambda: ", pair, "; context:", context);
            
            pair.eachTail(function (item, i) {
                scope[item.value] = args[i];
            });
            
            scope.arguments = [].slice.call(args);
            
            newContext = new Context(scope, context);
            
            pair.tail.eachTail(function (item) {
                ret = execute(item, newContext);
            });
            
            return ret;
        }
        
        lambda.__argsCount__ = pair.tail.length || 0;
        
        return lambda;
        
    };
    
    SpecialFormsContainer.prototype.lambda.__description__ = "Defines an anonymous procedure.";
    
    return SpecialFormsContainer;
    
});