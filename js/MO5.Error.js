(function (out) {
    
    out.Error = function (msg) {
        var e = Error.apply(null, arguments), key;
        
        // we need to copy the properties manually since
        // Javascript's Error constructor ignores the first
        // parameter used with .call()...
        for (key in e) {
            this[key] = e[key];
        }
        
        this.message = msg;
        this.name = "MO5.Error";
    };
    
    out.Error.prototype = new Error();
    out.Error.prototype.constructor = out.Error;
    
    //out.Error.prototype.toString = function () {
    //    return "[" + this.name + "] " + this.message;
    //};
    
}(MO5));