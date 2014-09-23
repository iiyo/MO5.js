/*/////////////////////////////////////////////////////////////////////////////////

 MO5.js - JavaScript Library For Building Modern DOM And Canvas Applications

 Copyright (c) 2013 - 2014 Jonathan Steinbeck
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

/* global MO5, setTimeout, window, module, require */

(function MO5AnimationBootstrap () {
    
    if (typeof MO5 === "function") {
        MO5("MO5.Exception", "MO5.CoreObject", "MO5.Queue", "MO5.Timer", "MO5.TimerWatcher").
        define("MO5.Animation", MO5AnimationModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.Animation = MO5AnimationModule(
            MO5.Exception,
            MO5.CoreObject,
            MO5.Queue,
            MO5.Timer,
            MO5.TimerWatcher
        );
    }
    else {
        module.exports = MO5AnimationModule(
            require("./Exception.js"),
            require("./CoreObject.js"),
            require("./Queue.js"),
            require("./Timer.js"),
            require("./TimerWatcher.js")
        );
    }
    
    function MO5AnimationModule (Exception, CoreObject, Queue, Timer, TimerWatcher) {

        function AnimationError (msg) {
            Error.call(this);
            Exception.call(this);

            this.message = msg;
            this.name = "MO5.AnimationError";
        }

        AnimationError.prototype = new Exception();


        /**
         * Uses callbacks to animate.
         * @param callbacks Optional list of callbacks. Can be of type Array or MO5.Queue.
         */
        function Animation (callbacks) {

            CoreObject.call(this);

            this.callbacks = new Queue();
            this.queue = new Queue();
            this.running = false;
            this.canceled = false;
            this.paused = false;
            this.limit = 0;
            this.count = 0;
            this.currentWatcher = null;

            if (callbacks && callbacks instanceof Queue) {
                this.callbacks = callbacks;
            }
            else if (callbacks && callbacks instanceof Array) {
                this.callbacks.replace(callbacks.slice());
            }
            else if (callbacks) {
                throw new AnimationError("Parameter 1 is expected to be of type Array or MO5.Queue.");
            }
        }

        Animation.prototype = new CoreObject();
        Animation.prototype.constructor = Animation;

        Animation.prototype.addStep = function (cb) {

            if (this.running) {
                throw new AnimationError("Cannot add steps to a running animation.");
            }

            this.callbacks.add(cb);
            this.trigger("updated", null, false);

            return this;
        };

        Animation.prototype.isRunning = function () {
            return this.running;
        };

        Animation.prototype.isCanceled = function () {
            return this.canceled;
        };

        Animation.prototype.isPaused = function () {
            return this.paused;
        };

        Animation.prototype.start = function () {
            var fn, self = this, cbs;

            if (this.running) {
                throw new AnimationError("Animation is already running.");
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

                if (watcher && watcher instanceof TimerWatcher) {
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

        Animation.prototype.pause = function () {

            if (this.paused) {
                throw new AnimationError("Trying to pause an already paused animation.");
            }

            this.paused = true;

            if (this.currentWatcher) {
                this.currentWatcher.pause();
            }

            this.trigger("paused", null, false);

            return this;
        };

        Animation.prototype.resume = function () {
            if (!this.paused) {
                throw new AnimationError("Trying to resume an animation that isn't paused.");
            }

            this.paused = false;

            if (this.currentWatcher) {
                this.currentWatcher.resume();
            }

            this.trigger("resumed", null, false);

            return this;
        };

        Animation.prototype.cancel = function () {

            if (this.canceled) {
                throw new AnimationError("Trying to cancel an already canceled animation.");
            }

            this.canceled = true;
            this.running = false;
            this.count = 0;
            this.limit = 0;

            if (this.currentWatcher) {
                this.currentWatcher.cancel();
            }

            this.trigger("canceled", null, false);

            return this;
        };

        Animation.prototype.stop = function () {

            if (!this.running) {
                throw new AnimationError("Trying to stop an animation that isn't running. " + 
                    "Check isRunning() beforehand.");
            }

            this.running = false;
            this.count = 0;
            this.limit = 0;

            return this;
        };

        Animation.prototype.loop = function (c) {

            if (c < 1) {
                throw new AnimationError("Parameter 1 is expected to be greater than zero.");
            }

            this.count = 0;
            this.limit = c;

            return this.start();
        };

        Animation.prototype.promise = function () {
            return Timer.prototype.promise.call(this);
        };

        return Animation;

    }
    
}());
