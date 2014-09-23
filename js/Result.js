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

/* global MO5, window, setTimeout, module, require, process, console */

(function MO5ResultBootstrap () {
    
    console.warn("MO5.Result is deprecated - use MO5.Promise instead!");

    if (typeof MO5 === "function") {
        MO5("MO5.CoreObject", "MO5.Queue", "MO5.Exception", "MO5.fail").
        define("MO5.Result", MO5ResultModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.CoreObject = MO5ResultModule(
            MO5.CoreObject,
            MO5.Queue,
            MO5.Exception,
            MO5.fail
        );
    }
    else {
        module.exports = MO5ResultModule(
            require("./CoreObject.js"),
            require("./Queue.js"),
            require("./Exception.js"),
            require("./fail.js")
        );
    }
    
    function MO5ResultModule (CoreObject, Queue, Exception, fail) {

        var setImmediate;
        
        if (typeof window !== "undefined" && window.setImmediate) {
            setImmediate = window.setImmediate;
        }
        else if (typeof process !== "undefined") {
            setImmediate = function (fn) { process.nextTick(fn); };
        }
        else {
            setImmediate = function (fn) { setTimeout(fn, 0); };
        }

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

                        if (nextValue && nextValue instanceof Promise) {
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

        function Result () {

            CoreObject.call(this);

            this.successQueue = new Queue();
            this.failureQueue = new Queue();
            this.value = undefined;
            this.status = Result.STATUS_PENDING;

            this.promise = new Promise(this);
        }

        Result.STATUS_PENDING = 1;
        Result.STATUS_FAILURE = 2;
        Result.STATUS_SUCCESS = 3;

        Result.getFulfilledPromise = function () {
            return new Result().success().promise;
        };

        Result.getBrokenPromise = function () {
            return new Result().failure().promise;
        };

        Result.prototype = new CoreObject();

        Result.prototype.isPending = function () {
            return this.status === Result.STATUS_PENDING;
        };

        Result.prototype.failure = function (reason) {
            if (this.status !== Result.STATUS_PENDING) {
                fail(new Exception("The result of the action has already been determined."));
                return;
            }

            this.value = reason;
            this.status = Result.STATUS_FAILURE;
            resolve(this.failureQueue, reason);
            this.successQueue.clear();
            this.failureQueue.clear();

            return this;
        };

        Result.prototype.success = function (value) {
            if (this.status !== Result.STATUS_PENDING) {
                fail(new Exception("The result of the action has already been determined."));
                return;
            }

            this.value = value;
            this.status = Result.STATUS_SUCCESS;
            resolve(this.successQueue, value);
            this.successQueue.clear();
            this.failureQueue.clear();

            return this;
        };

        Result.addToQueue = addToQueue;
        Result.resolve = resolve;

        function Promise (result) {

            CoreObject.call(this);

            this.then = function (success, failure) {

                var newResult = new Result();

                switch (result.status) {
                    case Result.STATUS_PENDING:
                        Result.addToQueue("success", result.successQueue, success, newResult);
                        Result.addToQueue("failure", result.failureQueue, failure, newResult);
                        break;
                    case Result.STATUS_SUCCESS:
                        Result.addToQueue("success", result.successQueue, success, newResult);
                        Result.resolve(result.successQueue, result.value);
                        break;
                    case Result.STATUS_FAILURE:
                        Result.addToQueue("failure", result.failureQueue, failure, newResult);
                        Result.resolve(result.failureQueue, result.value);
                        break;
                }

                return newResult.promise;
            };
        }

        Promise.prototype = new CoreObject();

        return Result;

    }
    
}());
