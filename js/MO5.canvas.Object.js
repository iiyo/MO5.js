(function (out) {
    
    out.canvas = out.canvas || {};

    out.canvas.Object = function (args) {
        args = args || {};
        
        out.Object.call(this);
        
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 1;
        this.height = args.height || 1;
        this.layer = args.layer || 0;
        this.alpha = args.alpha || 1;
        this.rotation = args.rotation || 0;
        this.pivotX = args.pivotX || this.x;
        this.pivotY = args.pivotY || this.y;
    };
    
    out.canvas.Object.prototype = new out.Object();
    
    out.canvas.Object.prototype.move = function (x, y, args) {
        
        args = args || {};
        
        return this.moveTo(this.x + x, this.y + y, args);
    };
    
    out.canvas.Object.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var t0, t1, self = this, watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.x = v | 0;
                },
                this.x,
                x,
                args
            )
         ).addTimer(
            out.transform(
                function (v)
                {
                    self.y = v | 0;
                },
                this.y,
                y,
                args
            )
        );
    };
    
    out.canvas.Object.prototype.fadeIn = function (args) {
        
        var self = this, watcher;
        
        args = args || {};
        watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.opacity = v;
                },
                this.opacity,
                1,
                args
            )
        );
    };
    
    out.canvas.Object.prototype.fadeOut = function (args) {
        
        var self = this;
        
        args = args || {};
        watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.opacity = v;
                },
                this.opacity,
                0,
                args
            )
        );
    };
    
    out.canvas.Object.prototype.getCenter = function () {
        
        var x = (this.x + (this.width / 2)),
            y = (this.y + (this.height / 2));
        
        return new out.Point(x, y);
    };
    
    out.canvas.Object.prototype.isAtOffset = function (x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    };
    
    out.canvas.Object.prototype.change = function (key, value) {
        this[key] = value;
        this.updated = true;
        this.trigger("updated");
    };
    
}(MO5));