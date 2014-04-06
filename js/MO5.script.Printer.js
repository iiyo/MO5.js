/* global MO5 */
MO5("MO5.types", "MO5.script.Tokenizer").
define("MO5.script.Printer", function (types, Tokenizer) {

    function Printer () {}
    
    Printer.prototype.stringify = function (value) {
        
        var text = "";
        
        function makeString (val, i) {
            
            var lastChar = text[text.length - 1], isString = false, isTokenObject = false;
            
            if (types.isObject(val) && val.isPair) {
                
                if (lastChar && lastChar !== "(") {
                    text += " ";
                }
                
                if ((!types.isObject(val.tail) && val.tail !== null) ||
                        (types.isObject(val.tail) && val.tail.type)) {
                    text += "(pair ";
                    
                    if (!types.isObject(val.head)) {
                        text += "" + val.head;
                    }
                    else if (typeof val.head.value !== "undefined") {
                        text += "" + val.head.value;
                    }
                    else {
                        makeString(val.head);
                    }
                    
                    text += " ";
                    makeString(val.tail);
                    text += ")";
                    
                    return;
                }
                
                text += "(";
                val.each(makeString);
                text += ")";
                
                return;
            }
            
            if (val && typeof val === "object") {
                
                isTokenObject = true;
                
                if (val.type === Tokenizer.STRING) {
                    isString = true;
                }
                
                val = val.value;
            }
            
            if (typeof val === "number" && val < 0) {
                text += "(- " + Math.abs(val) + ")";
                return;
            }
            else if (typeof val === "undefined") {
                text += "nil";
                return;
            }
            
            if (i > 0 && lastChar !== "'") {
                text += " ";
            }
            
            if ((isTokenObject && isString) || (!isTokenObject && typeof val === "string")) {
                text += '"' + val + '"';
            }
            else if (typeof val === "function") {
                if (val.__ast__) {
                    makeString(val.__ast__);
                }
                else {
                    text += "#<" + (val.__name__ ? (val.isMacro ? val.name : "procedure") + 
                        ":" + val.__name__ : "procedure:" + (val.name ? val.name : "?")) +">";
                }
            }
            else if (val === undefined) {
                text += "nil";
            }
            else {
                text += "" + val;
            }
        }
        
        makeString(value, 0, true);
        
        return text;
    };
    
    Printer.prototype.print = function (value) {
        console.log(this.stringify(value));
    };
    
    return Printer;
    
});