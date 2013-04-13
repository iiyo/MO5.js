(function (out) {
    
    out.Queue = function (arr) {
        out.Object.call(this);
        
        if (arr && !(arr instanceof Array)) {
            throw new out.Error("Parameter 1 is expected to be of type Array.");
        }
        
        this.arr = arr || [];
    };
    
    out.Queue.prototype = new out.Object();
    out.Queue.prototype.constructor = out.Queue;
    
    out.Queue.prototype.length = function () {
        return this.arr.length;
    };
    
    out.Queue.prototype.add = function (val) {
        var self = this, index = this.arr.length;
        
        if (val instanceof out.Object) {
            
            if (val.destroyed) {
                throw new out.Error("Trying to add an MO5.Object that has already been destroyed.");
            }
            
            val.once(function () { if (!self.destroyed) { self.arr.splice(index, 1); } }, "destroyed");
        }
        
        this.arr.push(val);
        this.trigger("updated");
        this.trigger("added", val);
        
        return this;
    };
    
    out.Queue.prototype.replace = function (arr) {
        if (!(arr instanceof Array)) {
            throw new out.Error("Parameter 1 is expected to be of type Array.");
            return this;
        }
        
        this.arr = arr;
        
        this.trigger("updated");
        this.trigger("replaced", arr);
        
        return this;
    };
    
    out.Queue.prototype.next = function () {
        
        if (!this.hasNext()) {
            throw new out.Error("Calling next() on empty queue.");
        }
        
        var ret = this.arr.shift();
        
        this.trigger("updated");
        this.trigger("next");
        
        if (this.arr.length < 1) {
            this.trigger("emptied");
        }
        
        return ret;
    };
    
    out.Queue.prototype.hasNext = function () {
        return this.arr.length > 0;
    };
    
    out.Queue.prototype.clear = function () {
        this.arr = [];
        this.trigger("updated");
        this.trigger("cleared");
        
        return this;
    };
    
    out.Queue.prototype.clone = function () {
        return new out.Queue(this.arr.slice());
    };
}(MO5));