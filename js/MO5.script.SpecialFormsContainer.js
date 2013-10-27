/* global MO5 */
MO5("MO5.script.Context", "MO5.script.Tokenizer").
define("MO5.script.SpecialFormsContainer", function (Context, Tokenizer) {

    function SpecialFormsContainer () {}
    
    SpecialFormsContainer.prototype.define = function (execute, list, context) {
        
        var name, value, lambdaList;
        
        if (Array.isArray(list[1])) {
            name = list[1][0].value;
            lambdaList = [{type: Tokenizer.SYMBOL, value: "lambda"}, list[1].slice(1), list.slice(2)[0]];
            value = execute(lambdaList, context);
        }
        else {
            name = list[1].value;
            value = list[2].value ? list[2].value : execute(list[2], context);
        }
        
        context.set(name, value);
        
        return value;
    };
    
    SpecialFormsContainer.prototype["if"] = function (execute, list, context) {
        
        console.log("list[1] in if: ", list[1]);
        
        if (execute(list[1], context)) {
            return execute(list[2], context);
        }
        
        return execute(list[3], context);
    };
    
    SpecialFormsContainer.prototype.quote = function (execute, list, context) {
        return list[1];
    };
    
    SpecialFormsContainer.prototype.lambda = function (execute, list, context) {
        
        function lambda () {
            var scope = {}, args = arguments;
            
            console.log("list in call to lambda: ", list, "; context:", context);
            
            list[1].forEach(function (item, i) {
                scope[item.value] = args[i];
            });
            
            return execute(list[2], new Context(scope, context));
        }
        
        return lambda;
        
    };
    
    return SpecialFormsContainer;
    
});