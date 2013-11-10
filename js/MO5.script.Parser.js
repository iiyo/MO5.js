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
        tokens = this.tokenizer.tokenize(input, fileName);
        ast = tokensToList(tokens, counter);
        
        console.log(ast);
        
        if (counter.opParens !== counter.clParens) {
            lastItem = counter.lastToken;
            throw new Tokenizer.ParseError("Unexpected end of input", lastItem.line, lastItem.column);
        }
        
        expandQuotes(ast);
        
        return ast;
    };
    
    function expandQuotes (ast) {
        
        var leaf, i;
        
        for (i = 0; i < ast.length; i += 1) {
            
            leaf = ast[i];
            
            if (Array.isArray(leaf)) {
                expandQuotes(leaf);
                continue;
            }
            
            if (leaf.type === Tokenizer.QUOTE) {
                ast[i] = toQuote(ast, i);
            }
        }
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