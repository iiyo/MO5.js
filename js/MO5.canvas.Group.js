(function (out) {
    
    out.canvas.Group = function () {
        
        out.Object.call(this);
        
        this.objects = new out.Map();
        
    };
    
    out.canvas.Group.prototype = new out.Object();
    
    out.canvas.Group.prototype.add = function (obj) {
        
        if (!(obj instanceof out.canvas.Object)) {
            throw new out.Error("Parameter 1 must be an instance of " +
                "MO5.canvas.Object.");
        }
        
        this.objects.set(+obj, obj);
        
        return this;
    };
    
    out.canvas.Group.prototype.remove = function (obj) {
        this.objects.remove(+obj);
        return this;
    };
    
    out.canvas.Group.prototype.forEach = function (cb) {
        this.objects.forEach(cb);
        return this;
    };
    
    out.canvas.Group.prototype.callMethod = function (name, args) {
        
        this.objects.forEach(function (item) {
            
            if (!item[name] || typeof item[name] !== "function") {
                return;
            }
            
            item[name].apply(item[name], args);
        });
        
        return this;
    };
    
    out.canvas.Group.prototype.applyProperty = function (name, value) {
        
        this.objects.forEach(function (item) {
            item[name] = value;
        });
        
        return this;
    };
    
}(MO5));