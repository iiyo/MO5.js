(function (out) {
    
    out.canvas = out.canvas || {};
    
    out.canvas.Layer = function () {
        
        out.Object.call(this);
        
        this.objects = new out.Map();
        
    };
    
    out.canvas.Layer.prototype = new out.Object();
    
    out.canvas.Layer.prototype.draw = function (canvas) {
        this.objects.forEach(function (item) {
            item.draw(canvas);
        });
        
        return this;
    };
    
    out.canvas.Layer.prototype.add = function (item) {
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error("Parameter 1 is expected to be of type MO5.canvas.CanvasObject.");
        }
        
        this.objects.set(+item, item);
        
        return this;
    };
    
    out.canvas.Layer.prototype.remove = function (item) {
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error("Parameter 1 is expected to be of type MO5.canvas.CanvasObject.");
        }
        
        this.objects.remove(+item);
        
        return this;
    };
    
    out.canvas.Layer.prototype.has = function (item) {
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error("Parameter 1 is expected to be of type MO5.canvas.CanvasObject.");
        }
        
        return this.objects.has(+item);
    };
    
}(MO5));