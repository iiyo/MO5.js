(function (out) {
    
    var MSG_EXPECTED_CANVAS_OBJECT = "Parameter 1 is expected to be of type " +
        "MO5.canvas.CanvasObject.";
    
    out.canvas = out.canvas || {};
    
    out.canvas.Layer = function () {
        
        out.Object.call(this);
        
        this.objects = new out.Map();
        this.interactiveObjects = new out.Map();
        this.unsubscribers = new out.Map();
        
    };
    
    out.canvas.Layer.prototype = new out.Object();
    
    out.canvas.Layer.prototype.draw = function (environment) {
        
        this.objects.forEach(function (item) {
            item.draw(environment);
        });
        
        return this;
    };
    
    out.canvas.Layer.prototype.objectAtOffset = function (x, y) {
        
        var keys = new out.Queue(this.interactiveObjects.keys());
        var obj = null, cur;
        
        while (keys.hasNext()) {
            cur = this.interactiveObjects.get(keys.next());
            
            if (cur.isAtOffset(x, y)) {
                obj = cur;
                break;
            }
        }
        
        return obj;
    };
    
    out.canvas.Layer.prototype.objectsAtOffset = function (x, y) {
        var objects = [], cur;
        
        this.interactiveObjects.forEach(function (item) {
            if (item.isAtOffset(x, y)) {
                objects.push(item);
            }
        });
        
        return objects;
    };
    
    out.canvas.Layer.prototype.add = function (item) {
        
        var interactiveObjects = this.interactiveObjects;
        
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.set(+item, item);
        
        if (item.getProperty("interactive") === true) {
            interactiveObjects.set(+item, item);
        }
        
        function listener (data) {
            
            if (data.key === "interactive") {
                
                if (data.value === true) {
                    if (!interactiveObjects.has(+item)) {
                        interactiveObjects.set(+item, item);
                    }
                }
                else {
                    if (interactiveObjects.has(+item)) {
                        interactiveObjects.remove(+item);
                    }
                }
            }
        }
        
        this.unsubscribers.set(+item, listener);
        item.subscribe(listener, "propertyChange");
        
        return this;
    };
    
    out.canvas.Layer.prototype.remove = function (item) {
        
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.remove(+item);
        
        if (this.interactiveObjects.has(+item)) {
            item.unsubscribe(this.unsubscribers.get(+item), "propertyChange");
            this.interactiveObjects.remove(+item);
        }
        
        return this;
    };
    
    out.canvas.Layer.prototype.has = function (item) {
        
        if (!(item instanceof out.canvas.CanvasObject)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        return this.objects.has(+item);
    };
    
}(MO5));