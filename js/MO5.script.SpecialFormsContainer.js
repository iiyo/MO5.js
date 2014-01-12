/* global MO5 */
MO5("MO5.script.errors", "MO5.script.Context", "MO5.script.Tokenizer", 
    "MO5.script.Pair", "MO5.types").
define("MO5.script.SpecialFormsContainer", function (errors, Context, Tokenizer, Pair, types) {

    function SpecialFormsContainer () {}
    
    SpecialFormsContainer.prototype.progn = function (execute, pair, context) {
        
        var returnValue;
        
        pair.tail.each(function (item) {
            returnValue = execute(item, context);
        });
        
        return returnValue;
    };
    
    SpecialFormsContainer.prototype.progn.__useTco__ = true;
    
    SpecialFormsContainer.prototype["eval"] = function (execute, pair, context) {
        var pairToEvaluate;
        
        if (pair.segments().length !== 2) {
            throw new errors.ScriptError("Special form eval takes exactly one argument.", 
                pair.head.line, pair.head.column);
        }
        
        pairToEvaluate = execute(pair.tail.head, context);
        
        return execute(pairToEvaluate, context);
    };
    
    SpecialFormsContainer.prototype["eval"].__useTco__ = true;
    
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
    
    SpecialFormsContainer.prototype.macro.__useTco__ = true;
    
    SpecialFormsContainer.prototype["exists?"] = function (execute, pair, context) {
        return !!(pair.tail && pair.tail.type && pair.tail.type === Tokenizer.SYMBOL && 
            (context.has(pair.tail.value) || context.hasMacro(pair.tail.value)));
    };
    
    SpecialFormsContainer.prototype["exists?"].__useTco__ = true;
    
    SpecialFormsContainer.prototype.define = function (execute, pair, context) {
        
        var name, value, lambdaList, description;
        
        if (pair.tail.head.head) {
            name = pair.tail.head.head.value;
            lambdaList = new Pair({type: Tokenizer.SYMBOL, value: "lambda"});
            
            lambdaList.tail = new Pair(pair.second().tail, pair.tail.tail);
            
            if (pair.tail.tail.head && types.isObject(pair.tail.tail.head) && 
                    pair.tail.tail.head.type && pair.tail.tail.head.type === Tokenizer.STRING) {
                description = pair.tail.tail.head.value;
                pair.tail.tail = pair.tail.tail.tail;
            }
            
            value = execute(lambdaList, context);
            
            value.__name__ = name;
            value.__description__ = description;
            value.__ast__ = pair;
        }
        else {
            name = pair.tail.head.value;
            value = pair.tail.tail.value ? pair.tail.tail.value : execute(pair.tail.tail.head, context);
        }
        
        context.set(name, value);
        
        return value;
    };
    
    SpecialFormsContainer.prototype["set!"] = function (execute, pair, context) {
        
        var name, value;
        
        name = pair.second().value;
        value =  execute(pair.third(), context);
        
        try {
            context.change(name, value);
        }
        catch (e) {
            throw new errors.ReferenceError("Cannot set value on undefined symbol '" + name + "'",
                pair.head.line, pair.head.column, pair.head.file);
        }
        
        return value;
    };
    
    SpecialFormsContainer.prototype["if"] = function (execute, pair, context) {
        
        if (execute(pair.second(), context)) {
            return execute(pair.third(), context);
        }
        
        return execute(pair.fourth(), context);
    };
    
    SpecialFormsContainer.prototype["if"].__useTco__ = true;
    
    SpecialFormsContainer.prototype["if"].__description__ = 
        "Evaluates the first argument " +
        " ('condition') and checks whether the result is true. \n" +
        "If it the result true it evaluates the second argument ('then').\n" +
        "If it the result is false it evaluates the third argument (else) instead.\n\n" +
        "Form: (if [condition] [then] [else])";
    
    SpecialFormsContainer.prototype.quote = function (execute, pair) {
        return pair.tail.head;
    };
    
    SpecialFormsContainer.prototype.quote.__description__ = "Returns an expression unevaluated.";
    
    SpecialFormsContainer.prototype["to-quote"] = function (execute, pair) {
        
        var quote = {
            type: Tokenizer.SYMBOL,
            value: "quote",
            line: pair.head.line,
            column: pair.head.column
        };
        
        return new Pair(quote, pair.tail);
    };
    
    SpecialFormsContainer.prototype.lambda = function (execute, pair, context) {
        
        if (pair.second()) {
            pair.second().each(function (item) {
                if (!types.isObject(item) || item.type !== Tokenizer.SYMBOL) {
                    throw new errors.ScriptError("Lambda parameters must be symbols", 
                        pair.head.line, pair.head.column, pair.head.file);
                }
            });
        }
        
        function lambda () {
            var scope = {}, args = arguments, ret, newContext;
            
            if (types.isObject(pair.tail) && types.isObject(pair.tail.head) && 
                    pair.tail.head.isPair) {
                pair.tail.head.each(function (item, i) {
                    scope[item.value] = args[i];
                });
            }
            
            scope.arguments = Pair.fromArray([].slice.call(arguments));
            
            newContext = new Context(scope, context);
            
            if (types.isObject(pair.tail) && types.isObject(pair.tail.tail) && 
                    pair.tail.tail.isPair) {
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
    
    SpecialFormsContainer.prototype.lambda.__useTco__ = true;
    
    SpecialFormsContainer.prototype.lambda.__description__ = "Defines an anonymous procedure.";
    
    return SpecialFormsContainer;
    
});