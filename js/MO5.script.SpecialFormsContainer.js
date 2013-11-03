/* global MO5 */
MO5("MO5.script.Context", "MO5.script.Tokenizer").
define("MO5.script.SpecialFormsContainer", function (Context, Tokenizer) {

    function SpecialFormsContainer () {}
    
    SpecialFormsContainer.prototype.progn = function (execute, list, context) {
        
        var returnValue;
        
        list.slice(1).forEach(function (item) {
            returnValue = execute(item, context);
        });
        
        return returnValue;
    };
    
    SpecialFormsContainer.prototype["eval"] = function (execute, list, context) {
        var listToEvaluate, error;
        
        if (list.length !== 2) {
            throw new Error("Special form eval takes exactly one argument.");
        }
        
        if (list[1] && list[1][0] && list[1][0].type === Tokenizer.SYMBOL && 
                list[1][0].value === "quote") {
            listToEvaluate = list[1][1];
        }
        else {
            listToEvaluate = list[1];
        }
        
        //console.log("listToEvaluate:", listToEvaluate);
        
        if (listToEvaluate.type && listToEvaluate.type === Tokenizer.SYMBOL) {
            if (!context.has(listToEvaluate.value)) {
                error = new Error("Unbound symbol '" + listToEvaluate.value + "'");
                error.scriptLine = listToEvaluate.line;
                error.scriptColumn = listToEvaluate.column;
                error.fileName = "(eval'd code)";
                throw error;
            }
            
            listToEvaluate = context.find(listToEvaluate.value);
        }
        
        return execute(listToEvaluate, context);
    };
    
    SpecialFormsContainer.prototype["dump-context"] = function (execute, list, context) {
        console.log(context);
    };
    
    SpecialFormsContainer.prototype.macro = function (execute, list, context) {
        
        var name;
        
        name = list[1][0].value;
        
        function macro (ctx) {
            var scope = {}, args = [].slice.call(arguments, 1), ret, newContext;
            
            //console.log("list in call to macro: ", list, "; context:", context);
            
            list[1].slice(1).forEach(function (item, i) {
                scope[item.value] = args[0][i];
            });
            
            scope.$arguments = args[0];
            
            //console.log("scope in macro:", scope);
            
            newContext = new Context(scope, ctx);
            
            list.slice(2).forEach(function (item) {
                ret = execute(item, newContext);
            });
            
            return ret;
        }
        
        macro.__argsCount__ = list[1].length || 0;
        macro.isMacro = true;
        
        context.setMacro(name, macro);
        
        return macro;
    };
    
    SpecialFormsContainer.prototype["exists?"] = function (execute, list, context) {
        return !!(list[1] && list[1].type && list[1].type === Tokenizer.SYMBOL && 
            (context.has(list[1].value) || context.hasMacro(list[1].value)));
    };
    
    SpecialFormsContainer.prototype.define = function (execute, list, context) {
        
        var name, value, lambdaList;
        
        if (Array.isArray(list[1])) {
            name = list[1][0].value;
            lambdaList = [{type: Tokenizer.SYMBOL, value: "lambda"}, list[1].slice(1)];
            
            list.slice(2).forEach(function (item) {
                lambdaList.push(item);
            });
            
            value = execute(lambdaList, context);
        }
        else {
            name = list[1].value;
            value = list[2].value ? list[2].value : execute(list[2], context);
        }
        
        context.set(name, value);
        
        return value;
    };
    
    SpecialFormsContainer.prototype.set = function (execute, list, context) {
        
        var name, value;
        
        name = list[1].value;
        value = list[2].value ? list[2].value : execute(list[2], context);
        
        try {
            context.change(name, value);
        }
        catch (e) {
            throw new Error("Cannot set value on undefined symbol '" + name + "'");
        }
        
        return value;
    };
    
    SpecialFormsContainer.prototype["if"] = function (execute, list, context) {
        
        //console.log("list[1] in if: ", list[1]);
        
        if (execute(list[1], context)) {
            return execute(list[2], context);
        }
        
        return execute(list[3], context);
    };
    
    SpecialFormsContainer.prototype.quote = function (execute, list, context) {
        
        if (Array.isArray(list[1])) {
            list[1].forEach(function (item, i) {
                list[1][i] = item.type && isPrimitive(item.type) ? item.value : item;
            });
            return list[1];
        }
        
        return list[1];
    };
    
    function isPrimitive (type) {
        return type === Tokenizer.NUMBER || type === Tokenizer.STRING || type === Tokenizer.BOOLEAN;
    }
    
    SpecialFormsContainer.prototype["to-quote"] = function (execute, list, context) {
        
        var quote = {
            type: Tokenizer.SYMBOL,
            value: "quote",
            line: list[0].line,
            column: list[0].column
        };
        
        return [quote, list[1]];
    };
    
    SpecialFormsContainer.prototype.lambda = function (execute, list, context) {
        
        function lambda () {
            var scope = {}, args = arguments, ret, newContext;
            
            //console.log("list in call to lambda: ", list, "; context:", context);
            
            list[1].forEach(function (item, i) {
                scope[item.value] = args[i];
            });
            
            scope.arguments = [].slice.call(args);
            
            newContext = new Context(scope, context);
            
            list.slice(2).forEach(function (item) {
                ret = execute(item, newContext);
            });
            
            return ret;
        }
        
        lambda.__argsCount__ = list[1].length || 0;
        
        return lambda;
        
    };
    
    SpecialFormsContainer.prototype.lambda.__description__ = "Defines an anonymous procedure.";
    
    return SpecialFormsContainer;
    
});