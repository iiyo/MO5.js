/* global MO5 */
MO5("MO5.types", "MO5.script.errors", "MO5.script.Tokenizer", "MO5.script.Parser", 
    "MO5.script.Context", "MO5.script.GlobalScope", "MO5.script.SpecialFormsContainer", 
    "MO5.script.Pair", "MO5.script.Printer", 
    "ajax:" + MO5.path + "../script/standard-library.m5s").
define("MO5.script.Interpreter", function (types, errors, Tokenizer, Parser, Context, GlobalScope, 
       FormsContainer, Pair, Printer, libraryRequest) {
    
    var libraryText = libraryRequest.responseText, printer = new Printer();
    
    function Interpreter (args) {
        
        args = args || {};
        
        this.reset();
        
        this.debug = typeof args.debug !== "undefined" ? args.debug : false;
        this.breakpoints = {};
        
        this.execute(libraryText, "standard-library.m5s");
        this.lastFileName = "(unknown file)";
    }
    
    Interpreter.prototype.reset = function () {
        this.parser = new Parser();
        this.forms = new FormsContainer();
        this.context = new Context(new GlobalScope());
        this.lastLine = 0;
        this.lastColumn = 0;
        this.recursionLevel = 0;
    };
    
    ///////////////////////////////////////////
    // Debugging API
    ///////////////////////////////////////////
    
    /**
     * Constructs a breakpoint.
     */
    Interpreter.Breakpoint = function (file, line) {
        this.file = file;
        this.line = line;
        this.silenced = false;
    };
    
    Interpreter.prototype.setBreakpoint = function (file, line) {
        var breakpoint = new Interpreter.Breakpoint(file, line);
        this.breakpoints[makeBreakpointPath(file, line)] = breakpoint;
    };
    
    Interpreter.prototype.hasBreakpoint = function (file, line) {
        return ((makeBreakpointPath(file, line)) in this.breakpoints);
    };
    
    Interpreter.prototype.removeBreakpoint = function (file, line) {
        if (!this.hasBreakpoint(file, line)) {
            throw new Error("No such breakpoint");
        }
        
        delete this.breakpoints[makeBreakpointPath(file, line)];
    };
    
    Interpreter.prototype.enableDebugMode = function () {
        this.debug = true;
    };
    
    Interpreter.prototype.disableDebugMode = function () {
        this.debug = false;
    };
    
    ////////////////////////////////////////////
    // Evaluation
    ////////////////////////////////////////////
    
    Interpreter.prototype.execute = function (input, fileName, context) {
        
        var ast, value, self = this;
        
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
    
    /**
     * The real magic happens here. Evaluates an expression.
     * Uses a SpecialFormContainer instance for looking up all special forms
     * and and a Context instance to lookup the variables and macros in
     * the current scope.
     */
    function evaluate (input, context, interpreter) {
        
        var head;
    
        while (true) {
            
            if (typeof input === "function") {
                return input;
            }
            
            if (isLiteral(input)) {
                return getLiteralValue(input);
            }
            
            if (isSymbol(input)) {
                interpreter.lastLine = input.line;
                interpreter.lastColumn = input.column;
                return resolveSymbol(input, context, interpreter);
            }
            
            head = evaluate(input.head, context, interpreter);
            
            if (typeof head !== "function") {
                throw new errors.TypeError("Head " + printer.stringify(head) +
                    " of list is not a procedure", input.head.head.line || interpreter.lastLine,
                    input.head.head.column || interpreter.lastColumn,
                    input.head.head.file || interpreter.lastFileName);
            }
            
            if (isSpecialForm(input.head, interpreter)) {
                if (head.__useTco__) {
                    input = head(execute, input, context);
                }
                else {
                    return head(execute, input, context);
                }
            }
            else if (isMacro(input.head, context)) {
                input = head(context, input);
            }
            else {
                try {
                    input = head.apply(undefined, evaluateList(input.tail, context, interpreter));
                    
                    if (typeof input !== "function") {
                        return input;
                    }
                }
                catch (e) {
                    throw new errors.ScriptError(e.message, interpreter.lastLine, 
                        interpreter.lastColumn, interpreter.lastFileName);
                }
            }
        }
        
        //return value;
        
        function execute (pair, ctx) {
            return evaluate(pair, ctx, interpreter);
        }
    }
    
    /**
     * Evaluates the arguments to a function and returns the results
     * in an array that can be applied to the head of a list.
     */
    function evaluateList (input, context, interpreter) {
        
        var map = [], current = input, i = 0;
        
        while (current) {
            map[i] = evaluate(current.head, context, interpreter);
            i += 1;
            current = current.tail;
        }
        
        return map;
    }
    
    return Interpreter;
    
    //////////////////////////////////////
    // Helper functions
    //////////////////////////////////////
    
    /**
     * Checks whether something is a primitive value or a symbol object containing
     * a primitive value.
     */
    function isLiteral (thing) {
        
        var type = typeof thing;
        var isNumber = type === "number";
        var isString = type === "string";
        var isBoolean = type === "boolean";
        
        if (!thing) {
            return true;
        }
        
        if (isNumber || isString || isBoolean) {
            return true;
        }
        
        return thing.type === Tokenizer.BOOLEAN || thing.type === Tokenizer.NUMBER ||
            thing.type === Tokenizer.STRING || thing.type === Tokenizer.NIL;
    }
    
    /**
     * Makes sure that we use the real value, not a symbol object.
     */
    function getLiteralValue (input) {
        
        if (types.isObject(input)) {
            return input.value;
        }
        
        return input;
    }
    
    function isSymbol (input) {
        
        if (types.isObject(input) && input.type && input.type === Tokenizer.SYMBOL) {
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
    
    /**
     * Grabs a symbol's value from either a SpecialFormsContainer or
     *  the macros and variables visible in the current scope.
     */
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
        
        throw new errors.ReferenceError("Unbound symbol '" + symbolName + "'", 
            symbol.line || interpreter.lastLine, symbol.column || interpreter.lastColumn, 
            symbol.file || interpreter.lastFileName);
    }
    
    function makeBreakpointPath (file, line) {
        return "file>>>" + file + ">>>line>>>" + line;
    }
    
    function trampoline (fn) {
        
        while (fn && typeof fn === "function") {
            fn = fn();
        }
        
        return fn;
    }
});