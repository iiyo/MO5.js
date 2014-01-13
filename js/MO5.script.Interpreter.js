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
        
        var ast, results;
        
        fileName = fileName || "(unknown file)";
        context = context || this.context;
        this.lastFileName = fileName;
        
        ast = this.parser.parse(input, fileName);
        results = evaluateList(ast, context, this);
        
        if (results.length > 0) {
            return results[results.length - 1];
        }
        
        return null;
    };
    
    /**
     * The real magic happens here. Evaluates an expression.
     * Uses a SpecialFormContainer instance for looking up all special forms
     * and and a Context instance to lookup the variables and macros in
     * the current scope.
     */
    function evaluate (input, context, interpreter) {
        
        var head, expressions;
    
        while (true) {
            
            if (isLiteral(input)) {
                return getLiteralValue(input);
            }
            
            if (isSymbol(input)) {
                interpreter.lastLine = input.line;
                interpreter.lastColumn = input.column;
                
                return resolveSymbol(input, context, interpreter);
            }
                
            if (isLambdaDeclaration(input)) {
                return new Lambda(input.second(), input.tail.tail, context);
            }
            
            if (isSpecialForm(input.head, interpreter)) {
                
                head = evaluate(input.head, context, interpreter);
                
                if (!head.__useTco__) {
                    return head(execute, input, context);
                }
                
                input = head(execute, input, context);
            }
            else if (isMacro(input.head, context)) {
                head = evaluate(input.head, context, interpreter);
                input = head(context, input);
            }
            else {
                expressions = evaluateList(input, context, interpreter);
                head = expressions[0];
                
                if (head instanceof Lambda) {
                    context = new Context(createScope(head.params, expressions.slice(1)), context);
                    input = head.expressions;
                }
                else if (typeof head === "function") {
                    return head.apply(null, expressions.slice(1));
                }
                else {
                    if (expressions.length > 0) {
                        return expressions[expressions.length - 1];
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        
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
    
    function isLambdaDeclaration (input) {
        return (
            types.isObject(input.head) &&
            input.head.type === Tokenizer.SYMBOL &&
            input.head.value === "lambda"
        );
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
    
    function Lambda (params, expressions, context) {
        this.params = params;
        this.expressions = expressions;
        this.context = context;
    }
    
    function createScope (expression, args) {
        
        var params, scope = {};
        
        if (!expression) {
            params = [];
        }
        else {
            params = expression.toArray();
        }
        
        if (params.length > args.length) {
            throw new errors.ScriptError("Not enough arguments in call to procedure",
                expression.line, expression.column, expression.file);
        }
        
        params.forEach(function (param, i) {
            scope[param.value] = args[i];
        });
        
        scope.arguments = args;
        
        return scope;
    }
});