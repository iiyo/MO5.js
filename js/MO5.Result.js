(function (out) {
    
    var setImmediate = window.setImmediate || function (fn) { setTimeout(fn, 0); };
    
    function resolve (queue, value) {
        
        while (queue.hasNext()) {
            setImmediate((function (cur) { 
                return function () { 
                    cur(value); 
                };
            }(queue.next())));
        }
    }
    
    function addToQueue (type, queue, cb, action) {
        
        if (typeof cb === "function") {
            queue.add(function (value) {
                
                var nextValue;
                
                try {
                    nextValue = cb(value);
                    
                    if (nextValue && nextValue instanceof out.Promise) {
                        nextValue.then(action.success, action.failure);
                    }
                    else {
                        action.success(nextValue);
                    }
                }
                catch (e) {
                    action.failure(e);
                }
                
                return nextValue;
            });
        }
        else {
            queue.add(function (value) { action[type](value); });
        }
    }
    
    out.Result = function () {
        
        var self = this;
        
        out.Object.call(this);
        
        this.successQueue = new out.Queue();
        this.failureQueue = new out.Queue();
        this.value = undefined;
        this.status = out.Result.STATUS_PENDING;
        
        this.promise = new out.Promise(this);
    };
    
    out.Result.STATUS_PENDING = 1;
    out.Result.STATUS_FAILURE = 2;
    out.Result.STATUS_SUCCESS = 3;
    
    out.Result.getFulfilledPromise = function () {
        return new out.Result().success().promise;
    };
    
    out.Result.getBrokenPromise = function () {
        return new out.Result().failure().promise;
    };
    
    out.Result.prototype = new out.Object();
    
    out.Result.prototype.isPending = function () {
        return this.status === out.Result.STATUS_PENDING;
    };
    
    out.Result.prototype.failure = function (reason) {
        if (this.status !== out.Result.STATUS_PENDING) {
            out.fail(new out.Error("The result of the action has already been determined."));
            return;
        }
        
        this.value = reason;
        this.status = out.Result.STATUS_FAILURE;
        resolve(this.failureQueue, reason);
        this.successQueue.clear();
        this.failureQueue.clear();
        
        return this;
    };
    
    out.Result.prototype.success = function (value) {
        if (this.status !== out.Result.STATUS_PENDING) {
            out.fail(new out.Error("The result of the action has already been determined."));
            return;
        }
        
        this.value = value;
        this.status = out.Result.STATUS_SUCCESS;
        resolve(this.successQueue, value);
        this.successQueue.clear();
        this.failureQueue.clear();
        
        return this;
    };
    
    out.Result.addToQueue = addToQueue;
    out.Result.resolve = resolve;
    
}(MO5));