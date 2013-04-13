(function (out) {
    
    out.canvas = out.canvas || {};

    out.canvas.CanvasObject = function (canvas, args) {
        args = args || {};
        
        out.Object.call(this);
        
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 1;
        this.height = args.height || 1;
        this.canvas = canvas;
        this.layer = args.layer || 0;
        this.alpha = args.alpha || 1;
        this.rotation = args.rotation || 0;
        this.pivotX = args.pivotX || this.x;
        this.pivotY = args.pivotY || this.y;
    };
    
    out.canvas.CanvasObject.prototype = new out.Object();
    
    out.canvas.CanvasObject.prototype.move = function (x, y, args) {
        
        var dx, dy;
        
        args = args || {};
        dx = this.x + x;
        dy = this.y + y;
        
        return this.moveTo(dx, dy, args);
    };
    
    out.canvas.CanvasObject.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var t0, t1, self = this, watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.x = v;
                },
                this.x,
                x,
                args
            )
         ).addTimer(
            out.transform(
                function (v)
                {
                    self.y = v;
                },
                this.y,
                y,
                args
            )
        );
    };
    
    out.canvas.CanvasObject.prototype.fadeIn = function (args) {
        
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
    
    out.canvas.CanvasObject.prototype.fadeOut = function (args) {
        
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
    
    out.canvas.CanvasObject.prototype.display = function () {
        
        var self = this;
        
        this.canvas.addCallback(
            this.id, 
            function () {
                self.draw();
            }, 
            this.layer || 0, 
            this
        );
    };
    
    out.canvas.CanvasObject.prototype.hide = function () {
        this.canvas.removeCallback(this.id);
    };
    
    out.canvas.CanvasObject.prototype.getCenter = function () {
        
        var x = (this.x + (this.width / 2)),
            y = (this.y + (this.height / 2));
        
        return new out.Point(x, y);
    };
    
    out.canvas.CanvasObject.prototype.change = function (key, value) {
        this[key] = value;
        this.updated = true;
    };
    
}(MO5));