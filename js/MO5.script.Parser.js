/* global MO5 */
MO5("MO5.Exception", "MO5.script.Tokenizer", "MO5.script.Pair").
define("MO5.script.Parser", function (Exception, Tokenizer, Pair) {

    /**
     * Parser class for parsing MO5 Script or another
     * Lisp dialect.
     */
    function Parser () {
        this.tokenizer = new Tokenizer();
        this.currentFileName = "(unknown file)";
    }
    
    /**
     * Parses an input string and returns an abstract syntax tree.
     */
    Parser.prototype.parse = function (input, fileName) {
        
        var tokens, ast, counter, lastItem;
        
        this.currentFileName = fileName;
        counter = {opParens: 0, clParens: 0};
        tokens = expandQuotes(this.tokenizer.tokenize(input, fileName));
        ast = tokensToList(tokens, counter);
        
        if (counter.opParens !== counter.clParens) {
            lastItem = counter.lastToken;
            throw new Tokenizer.ParseError("Unexpected end of input", lastItem.line, lastItem.column);
        }
        
        return ast;
    };
    
    function expandQuotes (tokens) {
        
        var i, len, token, newTokens = [], nextToken, parenLevel = 0;
        
        for (i = 0, len = tokens.length; i < len; i += 1) {
            token = tokens[i];
            
            if (token.type !== Tokenizer.QUOTE) {
                newTokens.push(token);
                continue;
            }
            
            nextToken = tokens[i + 1];
            
            if (!nextToken) {
                throw new Tokenizer.ParseError("Unexpected end of input", token.line, token.column);
            }
            
            newTokens.push({
                type: Tokenizer.OPENING_PAREN,
                value: "(",
                line: token.line,
                column: token.column,
                length: 0
            });
            
            newTokens.push({
                type: Tokenizer.SYMBOL,
                value: "quote",
                line: token.line,
                column: token.column,
                length: 1
            });
            
            if (nextToken.type === Tokenizer.SYMBOL) {
                
                newTokens.push(nextToken);
                
                i += 1;
            }
            else if (nextToken.type === Tokenizer.OPENING_PAREN) {
                while (true) {
                    i += 1;
                    token = tokens[i];
                    
                    if (!token) {
                        throw new Tokenizer.ParseError("Unexpected end of input");
                    }
                    
                    newTokens.push(token);
                    
                    if (token.type === Tokenizer.OPENING_PAREN) {
                        parenLevel += 1;
                    }
                    
                    if (token.type === Tokenizer.CLOSING_PAREN) {
                        parenLevel -= 1;
                        
                        if (parenLevel === 0) {
                            break;
                        }
                    }
                    
                }
            }
            else {
                throw new Tokenizer.ParseError(
                    "Unexpected non-quotable token after quote", token.line, token.column);
            }
            
            newTokens.push({
                type: Tokenizer.CLOSING_PAREN,
                value: ")",
                line: token.line,
                column: token.column,
                length: 0
            });
        }
        
        return newTokens;
    }
    
    function toQuote (ast, i) {
        var leaf = ast[i];
        var next = ast[i + 1];
        
        leaf.type = Tokenizer.SYMBOL;
        leaf.value = "quote";
        
        ast.splice(i + 1, 1);
        
        if (next && next.type === Tokenizer.QUOTE) {
            return [leaf, toQuote(ast, i)];
        }
        else {
            return [leaf, next];
        }
    }
    
    function tokensToList (tokens, counter) {
        
        var token = tokens.shift(), pair;
        
        if (typeof token === "undefined") {
            return null;
        }
        
        counter.lastToken = token;
        
        if (token.type === Tokenizer.CLOSING_PAREN) {
            
            counter.clParens += 1;
            
            if (counter.opParens < counter.clParens) {
                throw new Tokenizer.ParseError("Unexpected closing paren", token.line, token.column);
            }
            
            return null;
        }
        
        if (token.type === Tokenizer.OPENING_PAREN) {
            counter.opParens += 1;
            
            pair = new Pair();
            
            pair.head = tokensToList(tokens, counter);
            pair.tail = tokensToList(tokens, counter);
            
            return pair;
        }
        
        pair = new Pair();
        pair.head = token;
        pair.tail = tokensToList(tokens, counter);
        
        return pair;
    }
    
    return Parser;
    
});