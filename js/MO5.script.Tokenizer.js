/* global MO5 */
MO5().define("MO5.script.Tokenizer", function () {
    
    "use strict";
    
    function Tokenizer () {}
    
    // Token types:
    [
        "ILLEGAL_TOKEN", "COMMENT", "STRING", "OPENING_PAREN", 
        "CLOSING_PAREN", "SYMBOL", "NUMBER", "BOOLEAN", "QUOTE",
        "BACKQUOTE", "COMMA", "NIL"
    ].forEach((function () {
        var i = -1;
        
        return function (type) {
            Tokenizer[type] = i;
            i += 1;
        }; 
    }()));
    
    // Error messages:
    var E_UNEXPECTED_EOF_IN_STRING = "Unexpected end of file while parsing string";
    var E_RATIO_NOT_SUPPORTED = "Ratios are not supported";
    var E_MALFORMED_NUMBER = "Malformed number";
    
    Tokenizer.ParseError = function (message, line, column) {
        this.name = "ParseError";
        this.message = message || "";
        this.scriptLine = line;
        this.scriptColumn = column;
    };
    
    Tokenizer.ParseError.prototype = new Error();
    
    Tokenizer.tokenIdToTypeName = function (id) {
        
        for (var key in Tokenizer) {
            if (!(Tokenizer.hasOwnProperty(key))) {
                continue;
            }
            
            if (Tokenizer[key] === id) {
                return key;
            }
        }
        
        return undefined;
    };
    
    Tokenizer.prototype.tokenize = function (text, fileName) {
    
        var tokens = [], line = 0, column = 0, charOffset = -1, currentChar = null, lastColumn = 0;
        
        while (advance()) {
            advanceToken();
        }
        
        //////////////////////////
        // Helper functions
        //////////////////////////
        
        function peek () {
            return text[charOffset + 1];
        }
        
        function advance () {
            
            lastColumn = column;
            charOffset += 1;
            column += 1;
            currentChar = text[charOffset];
            
            if (currentChar === "\n") {
                line += 1;
                column = 0;
            }
            
            return currentChar;
        }
        
        function advanceAll (char) {
            var token = currentChar;
            
            while (peek() && peek().match(char)) {
                advance();
                token += currentChar;
            }
            
            return token;
        }
        
        function advanceUntil (endChar, escapeChar, exclusive) {
            
            var token = currentChar;
            
            exclusive = exclusive || false;
            
            while (peek()) {
                
                if (peek().match(endChar)) {
                    if (!exclusive) {
                        token += advance();
                    }
                    
                    break;
                }
                
                token += advance();
            }
            
            return token;
        }
        
        function advanceExclusiveUntil (endChar, escapeChar) {
            return advanceUntil(endChar, escapeChar, true);
        }
        
        function advanceString (endChar) {
            
            var token = "", escapeChar = "\\", i = 0, endCharFound = false;
            var currentCharIsEscaped = false;
            
            while (peek()) {
                
                i += 1;
                
                if (currentChar === escapeChar && !currentCharIsEscaped) {
                    currentCharIsEscaped = true;
                    token = removeLastChar(token);
                    token += insertEscapedChar(peek());
                    advance();
                    continue;
                }
                currentCharIsEscaped = false;
                
                if (peek() === endChar) {
                    endCharFound = true;
                    advance();
                    break;
                }
                
                token += advance();
            }
            
            if (!endCharFound) {
                throw new Tokenizer.ParseError(E_UNEXPECTED_EOF_IN_STRING, line + 1, column);
            }
            
            return token;
            
            function removeLastChar (text) {
                return text.slice(0, text.length - 1);
            }
            
            function insertEscapedChar (char) {
                switch (char) {
                    case "n":
                        return "\u000A";
                    case "b":
                        return "\u0008";
                    case "f":
                        return "\u000C";
                    case "t":
                        return "\u0009";
                    case "v":
                        return "\u000B";
                    default:
                        return char;
                }
            }
        }
        
        function advanceToken () {
            
            var char = currentChar, token;
            
            if (!char) {
                return false;
            }
            
            if (char === " " || char === "\n" || char === " ") {
                return true;
            }
            else if (char === ";") {
                advanceComment();
                return true;
            }
            else if (char === '"') {
                token = advanceDoubleQuotedString();
            }
            else if (char.match(/[0-9]/)) {
                token = advanceNumber();
            }
            else if (isOperator(char)) {
                token = advanceOperator();
            }
            else {
                token = advanceName();
            }
            
            tokens.push(token);
            
            return true;
        }
        
        function makeToken (type, value, realLength, realLine, realColumn) {
            
            realLength = typeof realLength === "number" ? realLength : ("" + value).length;
            realLine = typeof realLine === "number" ? realLine : line + 1;
            realColumn = typeof realColumn === "number" ? realColumn : column - realLength + 1;
            
            return {
                type: type,
                line: realLine,
                column: realColumn,
                value: value,
                length: realLength,
                file: fileName,
                toString: function () { return value; }
            };
        }
        
        function advanceComment () {
            return makeToken(Tokenizer.COMMENT, advanceExclusiveUntil(/\n/));
        }
        
        function advanceDoubleQuotedString () {
            var realLine = line + 1, realColumn = column, text = advanceString('"');
            return makeToken(Tokenizer.STRING, text, text.length + 2, realLine, realColumn);
        }
        
        function advanceName () {
            var word = advanceAll(/[^\(\) \n]/);
            
            if (word === "nan") {
                return makeToken(Tokenizer.NAN, NaN, 3);
            }
            else if (word === "infinity") {
                return makeToken(Tokenizer.INFINITY, Infinity, "infinity".length);
            }
            else if (word === "nil") {
                return makeToken(Tokenizer.NIL, null, 3);
            }
            else if (word === "true" || word === "false") {
                return makeToken(Tokenizer.BOOLEAN, word === "true" ? true : false, 
                    word.length);
            }
            
            return makeToken(Tokenizer.SYMBOL, word);
        }
        
        function advanceNumber () {
            var word = advanceExclusiveUntil(/[^0-9a-fx\-\+\.]/i);
            var nextChar = peek();
            
            if (nextChar === "/") {
                throw new Tokenizer.ParseError(E_RATIO_NOT_SUPPORTED, line + 1, column);
            }
            
            if (nextChar) {
                if (nextChar !== "(" && nextChar !== ")" && nextChar !== " " && nextChar !== "\n") {
                    throw new Tokenizer.ParseError(E_MALFORMED_NUMBER, line + 1, column);
                }
            }
            
            if (!isOctalNumber(word) && isNaN(word)) {
                throw new Tokenizer.ParseError(E_MALFORMED_NUMBER, line + 1, column);
            }
            
            return makeToken(Tokenizer.NUMBER, +word);
        }
        
        function isOctalNumber (number) {
            if (number.match(/0[0-7]+/i)) {
                if (number.match(/[^0-9]/)) {
                    throw new Tokenizer.ParseError(E_MALFORMED_NUMBER, line + 1, column);
                }
                
                return true;
            }
            
            return false;
        }
        
        function advanceQuotedExpression () {
            var expression = currentChar, opParens = 0, clParens = 0;
            
            while (advance()) {
                if (opParens === 0 && currentChar !== "(") {
                    expression += advanceAll(/[^\(\) \n']/);
                    break;
                }
                
                if (currentChar === "(") {
                    opParens += 1;
                }
                
                if (currentChar === ")") {
                    clParens += 1;
                }
                
                expression += currentChar;
                
                if (opParens === clParens) {
                    break;
                }
            }
            
            return makeToken(Tokenizer.QUOTE, expression);
        }
        
        function advanceOperator () {
            
            if (currentChar === "(") {
                return makeToken(Tokenizer.OPENING_PAREN, currentChar);
            }
            else if (currentChar === ")") {
                return makeToken(Tokenizer.CLOSING_PAREN, currentChar);
            }
            else if (currentChar === ",") {
                return makeToken(Tokenizer.COMMA, currentChar);
            }
            else if (currentChar === "'") {
                //return advanceQuotedExpression();
                return makeToken(Tokenizer.QUOTE, currentChar);
            }
            else if (currentChar === "`") {
                return makeToken(Tokenizer.BACKQUOTE, currentChar);
            }
            
            return makeToken(Tokenizer.ILLEGAL_TOKEN, currentChar);
        }
        
        function isOperator (char) {
            return char && char.match(/[\(\),'`]/);
        }
        
        return tokens;
    };
    
    return Tokenizer;
    
});