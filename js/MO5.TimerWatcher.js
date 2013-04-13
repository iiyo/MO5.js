(function (out) {
    
    /**
     * A TimerWatcher object can be used to bundle MO5.Timer objects
     * together and observe them. The TimerWatcher object emits the
     * same events as a Timer does, so that in most cases, the
     * TimerWatcher can be used as if it was a Timer.
     * 
     * A TimerWatcher extends MO5.Object.
     * 
     * @type Constructor
     * 
     * @event added(MO5.Timer)
     * @event canceled()
     * @event created(MO5.Timer)
     * @event pause()
     * @event resume()
     * @event started()
     * @event stopped()
     */
    out.TimerWatcher = function (timers) {
        var self;
        
        out.Object.call(this);
        
        if (timers && !(timers instanceof Array)) {
            throw new out.Error("Parameter 1 is expected to be of type Array.").log();
        }
        
        timers = timers || [];
        
        self = this;
        this.timers = {};
        this.count = 0;
        
        timers.forEach(function (t) {
            self.addTimer(t);
        });
    };
    
    out.TimerWatcher.prototype = new out.Object();
    out.TimerWatcher.prototype.constructor = out.TimerWatcher;
    
    out.TimerWatcher.prototype.addTimer = function (timer) {
        var fn, self = this;
        
        if (!(timer instanceof out.Timer) && !(timer instanceof out.TimerWatcher)) {
            out.fail(new out.Error("Parameter 1 is expected to be of type MO5.Timer or MO5.TimerWatcher."));
            return this;
        }
        
        if (this.timers[+timer]) {
            out.fail(new out.Error("A timer with ID '" + timer + "' has already been added to the watcher."));
            return this;
        }
        
        this.count += 1;
        
        fn = function () {
            self.count -= 1;
            
            if (self.count < 1) {
                self.trigger("stopped", null, false);
            }
        };
        
        this.timers[+timer] = {
            timer: timer,
            unsubscribe: function () {
                timer.unsubscribe(fn, "stopped");
            }
        };
        
        timer.subscribe(fn, "stopped");
        this.trigger("added", timer, false);
        
        return this;
    };
    
    /**
     * Creates and returns a Timer that is already added to
     * the TimerWatcher when it's returned to the caller.
     */
    out.TimerWatcher.prototype.createTimer = function () {
        var timer = new out.Timer();
        
        this.trigger("created", timer, false);
        this.addTimer(timer);
        
        return timer;
    };
    
    out.TimerWatcher.prototype.removeTimer = function (timer) {
        if (!this.timers[+timer]) {
            out.fail(new out.Error("Trying to remove a timer that is unknown to the watcher."));
            return this;
        }
        
        this.timers[+timer].unsubscribe();
        delete this.timers[+timer];
        
        this.trigger("removed", timer, false);
        
        return this;
    };
    
    out.TimerWatcher.prototype.forAll = function (what) {
        var key, cur;
        
        for (key in this.timers) {
            if (!(this.timers.hasOwnProperty(key))) {
                continue;
            }
            
            cur = this.timers[key].timer;
            
            if (cur instanceof out.TimerWatcher) {
                this.timers[key].timer.forAll(what);
            }
            else {
                this.timers[key].timer[what]();
            }
        }
        
        return this;
    };
    
    out.TimerWatcher.prototype.cancelAll = function () {
        this.forAll("cancel");
        this.trigger("canceled", null, false);
        
        return this;
    };
    
    out.TimerWatcher.prototype.pauseAll = function () {
        this.forAll("pause");
        this.trigger("paused", null, false);
        
        return this;
    };
    
    out.TimerWatcher.prototype.resumeAll = function () {
        this.forAll("resume");
        this.trigger("resumed", null, false);
        
        return this;
    };
    
    out.TimerWatcher.prototype.stopAll = function () {
        return this.forAll("stop");
    };
    
    out.TimerWatcher.prototype.startAll = function () {
        this.forAll("start");
        this.trigger("started", null, false);
        
        return this;
    };
    
    out.TimerWatcher.prototype.promise = function () {
        return out.Timer.prototype.promise.call(this);
    };
    
}(MO5));