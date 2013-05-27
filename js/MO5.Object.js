(function (out) {
    
    var propertyTable = {};
    
    /**
     * The MO5 base type for almost all other types used in MO5.
     * 
     * All MO5.Object instances are observable by subscribing
     * to the events that it emits. Please see the documentation
     * of the Squiddle.js library for more details on this.
     * 
     * @event destroyed()
     */
    out.Object = function (args) {
        
        args = args || {};
        args.bus = args.bus || {};
        
        this.id = out.tools.getUniqueId();
        this.destroyed = false;
        
        Squiddle.inject(this, args.bus);
        
        propertyTable[this.id] = {};
    };
    
    out.Object.prototype.getProperty = function (key) {
        
        if (!propertyTable[this.id] 
        || !(propertyTable[this.id].hasOwnProperty(key))) {
            return;
        }
        
        return propertyTable[this.id][key];
    };
    
    out.Object.prototype.setProperty = function (key, value) {
        
        if (!propertyTable[this.id]) {
            return;
        }
        
        propertyTable[this.id][key] = value;
        
        this.trigger("propertyChange", {key: key, value: value});
    }
    
    out.Object.prototype.hasProperty = function (key) {
        return propertyTable[this.id] && 
            propertyTable[this.id].hasOwnProperty(key);
    }
    
    out.Object.prototype.connect = function (event1, obj2, event2, async) {
        
        var self = this;
        
        event1 = event1 || "*";
        event2 = event2 || "*";
        
        if (!obj2 || !(obj2 instanceof out.Object)) {
            out.fail(new out.Error("Cannot connect events: Parameter 3 is expected to be of type MO5.Object."));
            return this;
        }
        
        function listener (data, info) {
            
            data = data || null;
            
            if (typeof async !== "undefined" && (async === true || async === false)) {
                obj2.trigger(event2, data, async);
            }
            else {
                obj2.trigger(event2, data);
            }
        }
        
        this.subscribe(listener, event1);
        
        obj2.once(function () { obj1.unsubscribe(listener, event1); }, "destroyed");
        
        return this;
    };
    
    /**
     * MO5.Object instances have a unique ID; when used as a string,
     * the ID of the object is used as a representation.
     */
    out.Object.prototype.toString = function () {
        return "" + this.id;
    };
    
    /**
     * Emits the destroyed() event and deletes all of the instances properties.
     * After this method has been called on an MO5.Object, it can not be used
     * anymore and should be considered dead.
     * 
     * All users of an MO5.Object should hook to the destroyed() event and delete
     * there references to the MO5.Object when its destroyed() event is emitted.
     */
    out.Object.prototype.destroy = function () {
        
        var id = this.id;
        
        this.destroyed = true;
        this.trigger("destroyed", null, false);
        
        for (var key in this) {
            this[key] = null;
        }
        
        delete propertyTable[id];
        
        this.destroyed = true;
        this.id = id;
    };
    
}(MO5));