(function (out) {
    
    out.Map = function () {
        
        out.Object.call(this);
        
        this.items = {};
        this.unsubscribers = {};
        this.count = 0;
    };
    
    out.Map.prototype = new out.Object();
    
    out.Map.prototype.length = function () {
        return this.count;
    };
    
    out.Map.prototype.set = function (key, value) {
        
        var self = this, whenDestroyed;
        
        if (!key) {
            throw new out.Error("MO5.Map keys cannot be falsy.");
        }
        
        if (this.has(key)) {
            this.remove(key);
        }
        
        if (value && value instanceof out.Object) {
            
            if (value.destroyed) {
                throw new out.Error("Trying to add an MO5.Object that has already been destroyed.");
            }
            
            whenDestroyed = function () {
                delete self.items[key];
                self.count -= 1;
            };
            
            value.subscribe(whenDestroyed, "destroyed");
            
            this.unsubscribers[key] = function () {
                value.unsubscribe(whenDestroyed, "destroyed");
            };
        }
        
        this.items[key] = value;
        this.count += 1;
        
        this.trigger("updated", null, false);
        this.trigger("set", key, false);
        
        return this;
    };
    
    out.Map.prototype.get = function (key) {
        
        if (!this.items.hasOwnProperty(key)) {
            return undefined;
        }
        
        return this.items[key];
    };
    
    out.Map.prototype.remove = function (key) {
        
        if (!this.has(key)) {
            throw new out.Error("Trying to remove an unknown key from an MO5.Map.");
        }
        
        if (this.unsubscribers.hasOwnProperty(key)) {
            this.unsubscribers[key]();
            delete this.unsubscribers[key];
        }
        
        delete this.items[key];
        this.count -= 1;
        
        this.trigger("updated", null, false);
        this.trigger("removed", key, false);
        
        return this;
    };
    
    out.Map.prototype.has = function (key) {
        return this.items.hasOwnProperty(key);
    };
    
    out.Map.prototype.destroy = function () {
        
        for (var key in this.unsubscribers) {
            this.unsubscribers[key]();
            delete this.unsubscribers[key];
        }
        
        out.Object.prototype.destroy.call(this);
    };
    
    out.Map.prototype.forEach = function (fn) {
        
        if (!fn || typeof fn !== "function") {
            throw new out.Error("Parameter 1 is expected to be of type function.");
        }
        
        for (var key in this.items) {
            fn(this.items[key], key, this);
        }
        
        return this;
    };
    
    out.Map.prototype.clone = function () {
        var clone = new out.Map();
        
        this.forEach(function (item, key) {
            clone.set(key, item);
        });
        
        return clone;
    };
    
}(MO5));