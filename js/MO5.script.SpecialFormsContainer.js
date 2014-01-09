/* global MO5 */
MO5("MO5.script.Context", "MO5.script.Tokenizer", "MO5.script.Pair").
define("MO5.script.SpecialFormsContainer", function (Context, Tokenizer, Pair) {

    function SpecialFormsContainer () {}
    
    SpecialFormsContainer.prototype.progn = function (execute, pair, context) {
        
        var returnValue;
        
        pair.tail.each(function (item) {
            returnValue = execute(item, context);
        });
        
        return returnValue;
    };
    
    SpecialFormsContainer.prototype["eval"] = function (execute, pair, context) {
        var pairToEvaluate;
        
        if (pair.segments().length !== 2) {
            throw new Error("Special form eval takes exactly one argument.");
        }
        
        pairToEvaluate = execute(pair.tail.head, context);
        
        //console.log("pairToEvaluate:", pairToEvaluate);
        
        /*
        if (pairToEvaluate.type && pairToEvaluate.type === Tokenizer.SYMBOL) {
            if (!context.has(pairToEvaluate.value)) {
                error = new Error("Unbound symbol '" + pairToEvaluate.value + "'");
                error.scriptLine = pairToEvaluate.line;
                error.scriptColumn = pairToEvaluate.column;
                error.fileName = "(eval'd code)";
                throw error;
            }
            
            pairToEvaluate = context.find(pairToEvaluate.value);
        }*/
        
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
            
            pair.tail.head.tail.each(function (item, i) {
                scope[item.value] = args[0].nth(i + 2);
            });
            
            scope.$arguments = args[0].tail;
            
            //console.log("scope in macro:", scope);
            
            newContext = new Context(scope, ctx);
            
            pair.tail.tail.each(function (item) {
                ret = execute(item, newContext);
            });
            
            return ret;
        }
        
        macro.__argsCount__ = pair.tail.length || 0;
        macro.isMacro = true;
        macro.__name__ = name;
        
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
            
            if (pair.tail.head.tail) {
                pair.tail.head.tail.each(function (item) {
                    last.tail = item;
                    last = item;
                });
            }
            
            value = execute(lambdaList, context);
            
            value.__name__ = name;
        }
        else {
            name = pair.tail.head.value;
            value = pair.tail.tail.value ? pair.tail.tail.value : execute(pair.tail.tail.head, context);
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
        
        if (execute(pair.tail.head, context)) {
            return execute(pair.tail.tail.head, context);
        }
        
        return execute(pair.tail.tail.tail, context);
    };
    
    SpecialFormsContainer.prototype.quote = function (execute, pair, context) {
        return pair.tail.head;
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
            
            console.log("pair in call to lambda: ", pair, "; context:", context);
            
            if (isObject(pair.tail) && isObject(pair.tail.head) && pair.tail.head.isPair) {
                pair.tail.head.each(function (item, i) {
                    scope[item.value] = args[i];
                });
            }
            
            scope.arguments = Pair.fromArray([].slice.call(arguments));
            console.log("scope.arguments in call to lambda:", scope.arguments);
            
            newContext = new Context(scope, context);
            
            if (isObject(pair.tail) && isObject(pair.tail.tail) && pair.tail.tail.isPair) {
                pair.tail.tail.each(function (item) {
                    ret = execute(item, newContext);
                });
            }
            
            return ret;
        }
        
        lambda.__argsCount__ = pair.tail.length || 0;
        lambda.__ast__ = pair;
        
        return lambda;
        
    };
    
    SpecialFormsContainer.prototype.lambda.__description__ = "Defines an anonymous procedure.";
    
    return SpecialFormsContainer;
    
    function isObject (thing) {
        return (typeof thing === "object" && thing !== null);
    }
    
});