/* global MO5 */
MO5("MO5.Exception", "MO5.script.Tokenizer").
define("MO5.script.Parser", function (Exception, Tokenizer) {

    /**
     * Parser class for parsing MO5 Script or another
     * Lisp dialect.
     */
    function Parser () {
        this.tokenizer = new Tokenizer();
    }
    
    /**
     * Parses an input string and returns an abstract syntax tree.
     */
    Parser.prototype.parse = function (input) {
        
        var tokens, ast, counter, lastItem;
        
        counter = {opParens: 0, clParens: 0};
        tokens = this.tokenizer.tokenize(input);
        ast = tokensToList(tokens, [], counter);
        
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
                //leaf.type = Tokenizer.SYMBOL;
                //leaf.value = "quote";
                //ast[i] = [leaf, ast[i + 1]];
                //ast.splice(i + 1, 1);
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
    
    function tokensToList (tokens, list, counter) {
        
        var token = tokens.shift(), subList;
        
        if (typeof token === "undefined") {
            return list;
        }
        
        counter.lastToken = token;
        
        if (token.type === Tokenizer.CLOSING_PAREN) {
            
            counter.clParens += 1;
            
            list.lastLine = token.line;
            list.lastColumn = token.column;
            
            if (counter.opParens < counter.clParens) {
                throw new Tokenizer.ParseError("Unexpected closing paren", token.line, token.column);
            }
            
            return list;
        }
        
        if (token.type === Tokenizer.OPENING_PAREN) {
            counter.opParens += 1;
            subList = [];
            
            subList.firstLine = token.line;
            subList.firstColumn = token.column;
            
            list.push(tokensToList(tokens, subList, counter));
            
            return tokensToList(tokens, list, counter);
        }
        
        list.push(token);
        
        return tokensToList(tokens, list, counter);
    }
    
    return Parser;
    
});