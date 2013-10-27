/* global MO5 */
MO5("MO5.script.Tokenizer", "MO5.script.Parser", "MO5.script.Context", 
    "MO5.script.GlobalScope", "MO5.script.SpecialFormsContainer").
define("MO5.script.Interpreter", 
function (Tokenizer, Parser, Context, GlobalScope, FormsContainer) {
    
    function Interpreter () {
        this.parser = new Parser();
        this.forms = new FormsContainer();
        this.context = new Context(new GlobalScope());
        this.lastLine = 0;
        this.lastColumn = 0;
    }
    
    Interpreter.TypeError = function (message, line, column) {
        this.name = "TypeError";
        this.message = message || "";
        this.scriptLine = line;
        this.scriptColumn = column;
    };
    
    Interpreter.TypeError.prototype = new Error();
    
    Interpreter.ReferenceError = function (message, line, column) {
        this.name = "ReferenceError";
        this.message = message || "";
        this.scriptLine = line;
        this.scriptColumn = column;
    };
    
    Interpreter.ReferenceError.prototype = new Error();
    
    Interpreter.prototype.execute = function (input, context) {
        
        var ast, value, self = this;
        
        context = context || this.context;
        
        ast = this.parser.parse(input);
        
        ast.forEach(function (leaf) {
            value = executeInContext(self, leaf, context);
        });
        
        return value;
    };
    
    Interpreter.prototype.scriptValueToString = function (value) {
        
        var text = "";
        
        console.log("value in scriptValueToString: ", value);
        
        function makeString (val) {
            if (!val || !Array.isArray(val)) {
                
                if (val && typeof val === "object") {
                    val = val.value;
                }
                
                text += "" + val;
                
                return;
            }
            
            text += "(";
            
            val.forEach(function (item, i) {
                if (i === 0) {
                    makeString(item);
                }
                else {
                    text += " ";
                    makeString(item);
                }
            });
            
            text += ")";
        }
        
        makeString(value);
        
        return text;
    };
    
    return Interpreter;
    
    
    function executeInContext (interpreter, input, context) {
        
        var value;
        
        if (Array.isArray(input)) {
            
            if (input.firstLine) {
                interpreter.lastLine = input.firstLine;
                interpreter.lastColumn = input.firstColumn;
            }
            
            return executeListInContext(interpreter, input, context);
        }
        
        if (input.type) {
            interpreter.lastLine = input.line;
            interpreter.lastColumn = input.column;
        }
        
        if (input.type === Tokenizer.SYMBOL) {
            
            if (input.value in interpreter.forms) {
                return interpreter.forms[input.value];
            }
            
            value = context.find(input.value);
            
            if (typeof value === "undefined") {
                throw new Interpreter.ReferenceError("Unbound symbol '" + input.value + "'", input.line, input.column);
            }
            
            return value;
        }
        
        return input.value;
    }
    
    function executeListInContext (interpreter, list, context) {
        
        var executedList, firstIsToken = false;
        
        if (list.length < 1) {
            throw new Interpreter.TypeError("Unquoted empty list", 
                list.lastLine || interpreter.lastLine, list.lastColumn || interpreter.lastColumn);
        }
        
        if (!list[0]) {
            throw new Interpreter.TypeError("Head of list is not a function", 
                list.lastLine || interpreter.lastLine, list.lastColumn || interpreter.lastColumn);
        }
        
        firstIsToken = typeof list[0].type === "undefined" ? false : true;
        
        if (firstIsToken) {
            interpreter.lastLine = list[0].line;
            interpreter.lastLine = list[0].column;
        }
        
        if (firstIsToken && list[0].value in interpreter.forms) {
            //console.log("Executing special form: ", list[0]);
            return interpreter.forms[list[0].value](execute, list, context);
        }
        
        if (firstIsToken && list[0].type && list[0].type !== Tokenizer.SYMBOL) {
            throw new Interpreter.TypeError("Head " + list[0].value + " of list " +
                "is not a function", list[0].line, list[0].column);
        }
        else if (firstIsToken && list[0].type && context.find(list[0].value) === undefined) {
            throw new Interpreter.ReferenceError("Unbound symbol '" + list[0].value + "'", 
                list[0].line, list[0].column);
        }
        
        
        executedList = list.map(function (item) {            
            return executeInContext(interpreter, item, context);
        });
        
        if (typeof executedList[0] === "function") {
            return executedList[0].apply(undefined, executedList.slice(1));
        }
        
        return execute(executedList, context);
        
        function execute (list, context) {
            return executeInContext(interpreter, list, context);
        }
    }
    
});