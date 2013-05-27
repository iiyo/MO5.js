(function (out) {
    
    out.AnimationError = function (msg) {
        Error.call(this);
        out.Error.call(this);
        
        this.message = msg;
        this.name = "MO5.AnimationError";
    };
    
    out.AnimationError.prototype = new out.Error();
    
    
    /**
     * Uses callbacks to animate.
     * @param callbacks Optional list of callbacks. Can be of type Array or MO5.Queue.
     */
    out.Animation = function (callbacks) {
        out.Object.call(this);
        
        this.callbacks = new out.Queue();
        this.queue = new out.Queue();
        this.running = false;
        this.canceled = false;
        this.paused = false;
        this.limit = 0;
        this.count = 0;
        this.currentWatcher = null;
        
        if (callbacks && callbacks instanceof out.Queue) {
            this.callbacks = callbacks;
        }
        else if (callbacks && callbacks instanceof Array) {
            this.callbacks.replace(callbacks.slice());
        }
        else if (callbacks) {
            throw new out.AnimationError("Parameter 1 is expected to be of type Array or MO5.Queue.");
        }
    };
    
    out.Animation.prototype = new out.Object();
    out.Animation.prototype.constructor = out.Animation;
    
    out.Animation.prototype.addStep = function (cb) {
        if (this.running) {
            throw new out.AnimationError("Cannot add steps to a running animation.");
        }
        
        this.callbacks.add(cb);
        this.trigger("updated", null, false);
        
        return this;
    };
    
    out.Animation.prototype.isRunning = function () {
        return this.running;
    };
    
    out.Animation.prototype.isCanceled = function () {
        return this.canceled;
    };
    
    out.Animation.prototype.isPaused = function () {
        return this.paused;
    };
    
    out.Animation.prototype.start = function () {
        var fn, self = this, cbs;
        
        if (this.running) {
            throw new out.AnimationError("Animation is already running.");
        }
        
        cbs = this.callbacks.clone();
        this.queue = cbs;
        
        this.running = true;
        this.canceled = false;
        
        fn = function () {
            var next, watcher;
            
            if (!cbs.hasNext()) {
                
                self.count += 1;
                
                if (self.isRunning()) {
                    
                    if (self.limit && self.count == self.limit) {
                        
                        self.running = false;
                        self.trigger("stopped", null, false);
                        self.count = 0;
                        self.limit = 0;
                        
                        return;
                    }
                    
                    cbs = self.callbacks.clone();
                    this.queue = cbs;
                    setTimeout(fn, 0);
                    
                    return;
                }
                
                self.trigger("stopped", null, false);
                
                return;
            }
            
            next = cbs.next();
            watcher = next();
            
            if (watcher && watcher instanceof out.TimerWatcher) {
                self.currentWatcher = watcher;
                watcher.once(fn, "stopped");
            }
            else {
                setTimeout(fn, 0);
            }
        };
        
        setTimeout(fn, 0);
        
        return this;
    };
    
    out.Animation.prototype.pause = function () {
        if (this.paused) {
            throw new out.AnimationError("Trying to pause an already paused animation.");
        }
        
        this.paused = true;
        
        if (this.currentWatcher) {
            this.currentWatcher.pauseAll();
        }
        
        this.trigger("paused", null, false);
        
        return this;
    };
    
    out.Animation.prototype.resume = function () {
        if (!this.paused) {
            throw new out.AnimationError("Trying to resume an animation that isn't paused.");
        }
        
        this.paused = false;
        
        if (this.currentWatcher) {
            this.currentWatcher.resumeAll();
        }
        
        this.trigger("resumed", null, false);
        
        return this;
    };
    
    out.Animation.prototype.cancel = function () {
        if (this.canceled) {
            throw new out.AnimationError("Trying to cancel an already canceled animation.");
        }
        
        this.canceled = true;
        this.running = false;
        this.count = 0;
        this.limit = 0;
        
        if (this.currentWatcher) {
            this.currentWatcher.cancelAll();
        }
        
        this.trigger("canceled", null, false);
        
        return this;
    };
    
    out.Animation.prototype.stop = function () {
        
        if (!this.running) {
            throw new out.AnimationError("Trying to stop an animation that isn't running. " + 
                "Check isRunning() beforehand.");
        }
        
        this.running = false;
        this.count = 0;
        this.limit = 0;
        
        return this;
    };
    
    out.Animation.prototype.loop = function (c) {
        if (c < 1) {
            throw new out.AnimationError("Parameter 1 is expected to be greater than zero.");
        }
        
        this.count = 0;
        this.limit = c;
        
        return this.start();
    };
    
    out.Animation.prototype.promise = function () {
        return out.Timer.prototype.promise.call(this);
    };
    
}(MO5));