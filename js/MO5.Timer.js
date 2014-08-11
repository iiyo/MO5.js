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

(function MO5TimerBootstrap () {
    
    if (typeof MO5 === "function") {
        MO5("MO5.Exception", "MO5.CoreObject", "MO5.fail", "MO5.Promise").
        define("MO5.Timer", MO5TimerModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.Timer = MO5TimerModule(MO5.Exception, MO5.CoreObject, MO5.fail, MO5.Promise);
    }
    else {
        module.exports = MO5TimerModule(
            require("./MO5.Exception.js"),
            require("./MO5.CoreObject.js"),
            require("./MO5.fail.js"),
            require("./MO5.Promise.js")
        );
    }
    
    function MO5TimerModule (Exception, CoreObject, fail, Promise) {

        function TimerError (msg) {
            Exception.call(this);

            this.message = msg;
            this.name = "MO5.TimerError";
        }

        TimerError.prototype = new Exception();

        /**
         * A Timer object is returned by the transform() function.
         * It can be used to control the transformation during its
         * execution and it can also be used to obtain information
         * about the state of a transformation, e.g. whether it's
         * still ongoing.
         */
        function Timer () {
            CoreObject.call(this);

            this.running = false;
            this.paused = false;
            this.canceled = false;
            this.startTime = +(new Date());
            this.timeElapsed = 0;
            this.pauseTimeElapsed = 0;
            this.pauseStartTime = this.startTime;
        }

        Timer.prototype = new CoreObject();
        Timer.prototype.constructor = Timer;

        Timer.prototype.start = function () {
            this.startTime = +(new Date());
            this.running = true;

            this.trigger("started", null, false);

            return this;
        };

        Timer.prototype.stop = function () {
            this.running = false;
            this.paused = false;

            this.trigger("stopped", null, false);

            return this;
        };

        Timer.prototype.cancel = function () {
            if (!this.running) {
                fail(new TimerError("Trying to cancel a Timer that isn't running."));
            }

            this.elapsed();
            this.canceled = true;
            this.running = false;
            this.paused = false;

            this.trigger("canceled", null, false);

            return this;
        };

        Timer.prototype.isRunning = function () {
            return this.running;
        };

        Timer.prototype.isCanceled = function () {
            return this.canceled;
        };

        Timer.prototype.isPaused = function () {
            return this.paused;
        };

        Timer.prototype.pause = function () {
            this.paused = true;
            this.pauseStartTime = +(new Date());
            this.trigger("paused", null, false);
        };

        Timer.prototype.resume = function () {
            if (!this.paused) {
                fail(new TimerError("Trying to resume a timer that isn't paused."));
            }

            this.paused = false;
            this.pauseTimeElapsed += +(new Date()) - this.pauseStartTime;
            this.trigger("resumed", null, false);
        };

        /**
         * Returns the number of milliseconds since the call of start(). If the
         * Timer's already been stopped, then the number of milliseconds between 
         * start() and stop() is returned. The number of milliseconds does not
         * include the times between pause() and resume()!
         */
        Timer.prototype.elapsed = function () {
            if (this.running && !this.paused) {
                this.timeElapsed = ((+(new Date()) - this.startTime) - this.pauseTimeElapsed);
            }

            return this.timeElapsed;
        };

        /**
         * Returns a capability object that can be given to other objects
         * by those owning a reference to the Timer. It is read only so that
         * the receiver of the capability object can only obtain information
         * about the Timer's state, but not modify it.
         */
        Timer.prototype.getReadOnlyCapability = function () {
            var self = this;

            return {
                isRunning: function () { return self.running; },
                isCanceled: function () { return self.canceled; },
                isPaused: function () { return self.paused; },
                elapsed: function () { return self.elapsed(); }
            };
        };

        Timer.prototype.promise = function () {

            var promise = new Promise(), self = this;

            this.once(
                function () {
                    promise.resolve(self);
                }, 
                "stopped"
            );

            this.once(
                function () {
                    promise.reject(self);
                },
                "canceled"
            );

            this.once(
                function () {
                    promise.reject(self);
                },
                "destroyed"
            );

            return promise;
        };

        return Timer;

    }
}());
