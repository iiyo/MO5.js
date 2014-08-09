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

/* global MO5, window, module, require */

(function MO5TimerWatcherBootstrap () {

    if (typeof MO5 === "function") {
        MO5("MO5.Exception", "MO5.CoreObject", "MO5.fail", "MO5.Timer").
        define("MO5.TimerWatcher", MO5TimerWatcherModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.TimerWatcher = MO5TimerWatcherModule(
            MO5.Exception,
            MO5.CoreObject,
            MO5.fail,
            MO5.Timer
        );
    }
    else {
        module.exports = MO5TimerWatcherModule(
            require("./MO5.Exception.js"),
            require("./MO5.CoreObject.js"),
            require("./MO5.fail.js"),
            require("./MO5.Timer.js")
        );
    }
    
    function MO5TimerWatcherModule (Exception, CoreObject, fail, Timer) {

        /**
         * A TimerWatcher object can be used to bundle MO5.Timer objects
         * together and observe them. The TimerWatcher object emits the
         * same events as a Timer does and has almost the same API, so that 
         * in most cases, a TimerWatcher object can be used as if it was a Timer.
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
        function TimerWatcher (timers) {
            var self;

            CoreObject.call(this);

            if (timers && !(timers instanceof Array)) {
                throw new Exception("Parameter 1 is expected to be of type Array.").log();
            }

            timers = timers || [];

            self = this;
            this.timers = {};
            this.count = 0;

            timers.forEach(function (t) {
                self.addTimer(t);
            });
        }

        TimerWatcher.prototype = new CoreObject();
        TimerWatcher.prototype.constructor = TimerWatcher;

        TimerWatcher.prototype.addTimer = function (timer) {
            
            var fn, self = this;

            if (this.timers[+timer]) {
                fail(new Exception(
                    "A timer with ID '" + timer + "' has already been added to the watcher."));
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
        TimerWatcher.prototype.createTimer = function () {
            var timer = new Timer();

            this.trigger("created", timer, false);
            this.addTimer(timer);

            return timer;
        };

        TimerWatcher.prototype.removeTimer = function (timer) {
            if (!this.timers[+timer]) {
                fail(new Exception("Trying to remove a timer that is unknown to the watcher."));
                return this;
            }

            this.timers[+timer].unsubscribe();
            delete this.timers[+timer];

            this.trigger("removed", timer, false);

            return this;
        };

        TimerWatcher.prototype.forAll = function (what) {
            var key, cur;

            for (key in this.timers) {
                if (!(this.timers.hasOwnProperty(key))) {
                    continue;
                }

                cur = this.timers[key].timer;

                if (cur instanceof TimerWatcher) {
                    this.timers[key].timer.forAll(what);
                }
                else {
                    this.timers[key].timer[what]();
                }
            }

            return this;
        };

        TimerWatcher.prototype.cancel = function () {
            this.forAll("cancel");
            this.trigger("canceled", null, false);

            return this;
        };

        TimerWatcher.prototype.pause = function () {
            this.forAll("pause");
            this.trigger("paused", null, false);

            return this;
        };

        TimerWatcher.prototype.resume = function () {
            this.forAll("resume");
            this.trigger("resumed", null, false);

            return this;
        };

        TimerWatcher.prototype.stop = function () {
            return this.forAll("stop");
        };

        TimerWatcher.prototype.start = function () {
            this.forAll("start");
            this.trigger("started", null, false);

            return this;
        };

        TimerWatcher.prototype.promise = function () {
            return Timer.prototype.promise.call(this);
        };

        return TimerWatcher;

    }
}());
