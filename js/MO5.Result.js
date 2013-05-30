/*/////////////////////////////////////////////////////////////////////////////////

 MO5.js - JavaScript Library For Building Modern DOM And Canvas Applications

 Copyright (c) 2013 Jonathan Steinbeck
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

 * Neither the name MO5.js nor the names of its contributors 
   may be used to endorse or promote products derived from this software 
   without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/////////////////////////////////////////////////////////////////////////////////*/

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