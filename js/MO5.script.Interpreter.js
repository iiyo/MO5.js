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
            ast.each(function (item) {
                value = evaluate(item, context, self);
            });
        }
        else {
            value = evaluate(ast.head, context, this);
        }
        
        return value;
    };
    
    return Interpreter;
    
    //////////////////////////////////////
    // Helper functions
    //////////////////////////////////////
    
    function isObject (thing) {
        return (typeof thing === "object" && thing !== null);
    }
    
    function isLiteral (thing) {
        
        var type = typeof thing;
        var isNumber = type === "number";
        var isString = type === "string";
        
        if (!thing) {
            return true;
        }
        
        if (isNumber || isString) {
            return true;
        }
        
        return thing.type === Tokenizer.BOOLEAN || thing.type === Tokenizer.NUMBER ||
            thing.type === Tokenizer.STRING || thing.type === Tokenizer.NIL;
    }
    
    function getLiteralValue (input) {
        
        if (isObject(input)) {
            return input.value;
        }
        
        return input;
    }
    
    function isSymbol (input) {
        
        if (isObject(input) && input.type && input.type === Tokenizer.SYMBOL) {
            return true;
        }
        
        return false;
    }
    
    function isSpecialForm (input, interpreter) {
        return isSymbol(input) && (input.value in interpreter.forms);
    }
    
    function isMacro (input, context) {
        return isSymbol(input) && context.hasMacro(input.value);
    }
    
    function resolveSymbol (symbol, context, interpreter) {
        
        var symbolName = symbol.value;
        
        if (symbolName in interpreter.forms) {
            return interpreter.forms[symbolName];
        }
        
        if (context.hasMacro(symbolName)) {
            return context.findMacro(symbolName);
        }
        
        if (context.has(symbolName)) {
            return context.find(symbolName);
        }
        
        throw new Interpreter.ReferenceError("Unbound symbol '" + symbolName + "'", symbol.line, symbol.column);
    }
    
    function evaluate (input, context, interpreter) {
        
        var head;
        
        if (isLiteral(input)) {
            return getLiteralValue(input);
        }
        
        if (isSymbol(input)) {
            return resolveSymbol(input, context, interpreter);
        }
        
        head = evaluate(input.head, context, interpreter);
        
        if (typeof head !== "function") {
            throw new Interpreter.TypeError("Head '" + head +
                "' of list is not a procedure", input.head.line, input.head.column);
        }
        
        if (isSpecialForm(input.head, interpreter)) {
            return head(execute, input, context);
        }
        
        if (isMacro(input.head, context)) {
            return head(context, input);
        }
        
        return head.apply(undefined, evaluateList(input.tail, context, interpreter));
        
        function execute (pair, ctx) {
            return evaluate(pair, ctx, interpreter);
        }
    }
        
    function evaluateList (input, context, interpreter) {
        var map = [], current = input, i = 0;
        
        while (current) {
            map[i] = evaluate(current.head, context, interpreter);
            i += 1;
            current = current.tail;
        }
        
        return map;
    }
});