/* global MO5 */
MO5("MO5.script.Tokenizer", "MO5.script.Parser", "MO5.script.Context", 
    "MO5.script.GlobalScope", "MO5.script.SpecialFormsContainer", "MO5.script.Pair",
    "ajax:" + MO5.path + "../script/standard-library.m5s").
define("MO5.script.Interpreter", 
function (Tokenizer, Parser, Context, GlobalScope, FormsContainer, Pair, libraryRequest) {
    
    var libraryText = libraryRequest.responseText;
    
    function Interpreter () {
        this.reset();
        this.execute(libraryText, "standard-library.m5s");
        this.lastFileName = "(unknown file)";
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
    
    Interpreter.ScriptError = function (message, line, column) {
        this.name = "ScriptError";
        this.message = message || "";
        this.scriptLine = line;
        this.scriptColumn = column;
    };
    
    Interpreter.ScriptError.prototype = new Error();
    
    Interpreter.prototype.reset = function () {
        this.parser = new Parser();
        this.forms = new FormsContainer();
        this.context = new Context(new GlobalScope());
        this.lastLine = 0;
        this.lastColumn = 0;
    };
    
    Interpreter.prototype.execute = function (input, fileName, context) {
        
        var ast, value, self = this, list;
        
        fileName = fileName || "(unknown file)";
        context = context || this.context;
        
        this.lastFileName = fileName;
        
        ast = this.parser.parse(input, fileName);
        
        if (ast.tail) {
            list = Pair.toArray(ast);
            console.log("list:", list);
            list.forEach(function (item) {
                value = executeInContext(self, item.head, context);
            });
        }
        else {
            value = executeInContext(self, ast, context);
        }
        
        return value;
    };
    
    Interpreter.prototype.scriptValueToString = function (value) {
        
        var text = "";
        
        function makeString (val) {
            if (!val || !Array.isArray(val)) {
                
                if (val && typeof val === "object") {
                    val = val.value;
                }
                
                if (typeof val === "number" && val < 0) {
                    text += "(- " + Math.abs(val) + ")"; 
                }
                else if (typeof val === "undefined") {
                    text += "nil";
                }
                else {
                    text += "" + val;
                }
                
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
    
    function isObject (thing) {
        return (typeof thing === "object" && thing !== null);
    }
    
    function executeInContext (interpreter, input, context) {
        
        var value;
        
        if (isObject(input) && input.head) {
            
            if (input.head.line) {
                interpreter.lastLine = input.head.line;
                interpreter.lastColumn = input.head.column;
            }
            
            return executePairInContext(interpreter, input, context);
        }
        
        if (!isObject(input) && (typeof input === "undefined" || typeof input === "object")) {
            return null;
        }
        
        if (isObject(input) && input.type) {
            interpreter.lastLine = input.line;
            interpreter.lastColumn = input.column;
        }
        
        if (isinputect(input) && input.type === Tokenizer.SYMBOL) {
            
            if (input.value in interpreter.forms) {
                return interpreter.forms[input.value];
            }
            
            if (context.hasMacro(input.value)) {
                return context.findMacro(input.value);
            }
            
            if (!context.has(input.value)) {
                console.log("context:", context);
                throw new Interpreter.ReferenceError("Unbound symbol '" + input.value + 
                    "'", input.line, input.column);
            }
            
            value = context.find(input.value);
            
            return value;
        }
        
        if (isinputect(input) && input.type === Tokenizer.STRING || input.type === Tokenizer.NUMBER ||
                input.type === Tokenizer.BOOLEAN) {
            return input.value;
        }
        
        if (typeof input === "function") {
            return input;
        }
        
        return typeof input.value === "undefined" ? input : input.value;
    }
    
    function executePairInContext (interpreter, pair, context) {
        
        var newPair, firstIsToken = false;
        
        console.log("pair in executePairInContext:", pair);
        
        if (!pair.head) {
            throw new Interpreter.TypeError("Head of list is not a function", 
                list.lastLine || interpreter.lastLine, list.lastColumn || interpreter.lastColumn);
        }
        
        firstIsToken = typeof pair.head.type === "undefined" ? false : true;
        
        if (firstIsToken) {
            interpreter.lastLine = pair.head.line;
            interpreter.lastColumn = pair.head.column;
        }
        
        if (firstIsToken && pair.head.value in interpreter.forms) {
            console.log("Executing special form: ", pair.tail);
            return interpreter.forms[pair.head.value](execute, pair, context);
        }
        
        if (firstIsToken && context.hasMacro(pair.head.value)) {
            console.log("Executing macro: ", pair.tail);
            return context.findMacro(pair.head.value)(context, pair.tail);
        }
        
        if (firstIsToken && pair.head.type && pair.head.type !== Tokenizer.SYMBOL) {
            throw new Interpreter.TypeError("Head " + pair.head.value + " of list " +
                "is not a function", pair.head.line, pair.head.column);
        }
        else if (firstIsToken && pair.head.type && !context.has(pair.head.value)) {
            console.log("context:", context);
            throw new Interpreter.ReferenceError("Unbound symbol '" + pair.head.value + "'", 
                pair.head.line, pair.head.column);
        }
        
        newPair = new Pair();
        
        newPair.head = executeInContext(interpreter, pair.head, context);
        newPair.tail = executeInContext(interpreter, pair.tail, context);
        
        if (typeof pair.head === "function") {
            return (function () {
                
                var val;
                
                try {
                    val = pair.head.apply(undefined, pair.tail);
                }
                catch (e) {
                    if (!e.scriptLine) {
                        e.scriptLine = interpreter.lastLine;
                        e.scriptColumn = interpreter.lastColumn;
                        e.fileName = interpreter.lastFileName;
                    }
                    
                    throw e;
                }
            
                return val;
            }());
        }
        
        if (!pair.tail) {
            return pair;
        }
        
        return execute(pair, context);
        
        function execute (pair, context) {
            return executeInContext(interpreter, pair, context);
        }
    }
    
});