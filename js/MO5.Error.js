(function (out) {
    
    out.Error = function (msg) {
        var e = new Error();
        
        Error.call(this);
        
        this.message = msg;
        this.name = "MO5.Error";
        
        if (e.stack) {
            this.stack = e.stack;
        }
    };
    
    out.Error.prototype = new Error();
    
    out.Error.prototype.toString = function () {
        return "[" + this.name + "] " + this.message;
    };
    
}(MO5));