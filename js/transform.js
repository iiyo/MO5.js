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

/* global using, requestAnimationFrame, console */

using("MO5.Exception", "MO5.Timer", "MO5.easing").
define("MO5.transform", function (Exception, Timer, easing) {
    
    /**
     * 
     *    [Function] MO5.transform
     *    ========================
     * 
     *        The main tween function for animations. Calculates values between 
     *        a start and an end value using either a sine function or a user 
     *        defined function and feeds them into a callback function. 
     * 
     *        
     *        Parameters
     *        ----------
     *        
     *            1. callback:
     *                [Function] The callback function. It takes one
     *                argument, which is the current calculated value. Use this
     *                callback function to set the value(s) you want to transform.
     * 
     *            2. from:
     *                [Number] The start value.
     *                
     *            3. to:
     *                [Number] The end value.
     *                
     *            4. args:
     *                [Object] (optional) Arguments object. 
     *                
     *                The options are:
     *                
     *                * duration: 
     *                    [Number] How long the transformation shall take 
     *                    (in milliseconds). Default: 1000
     *                
     *                * log: 
     *                    [Boolean] Log each calculated value to the browser's 
     *                    console?
     *                
     *                * easing: 
     *                    [Function] The function to actually calculate the values.
     *                    It must conform to this signature [Number] function(d, t)
     *                    where d is the full duration of the transformation and
     *                    t is the time the transformation took up to that point. 
     *                    Default: MO5.easing.sineEaseOut
     *                
     *                * onFinish:
     *                    [Function] Callback that gets executed once the
     *                    transformation is finished.
     * 
     *                * timer:
     *                    [MO5.Timer] A timer to use instead of creating a new one.
     *                      This can be useful if you want to use one timer for multiple
     *                      transformations.
     *                    
     * 
     *        Return value
     *        ------------
     *        
     *            [MO5.Timer] A timer to control the transformation or see if it's still running.
     *              When stop() is called on the timer, the transformation is immediately finished.
     *              Calling cancel() on the timer stops the transformation at the current value.
     *              Calling pause() pauses the transformation until resume() is called.
     *            
     * 
     */
    function transform (callback, from, to, args)
    {
        args = args || {};

        if (typeof callback === "undefined" || !callback)
        {
            throw new Exception("MO5.transform expects parameter callback to be a function.");
        }

        var dur = typeof args.duration !== "undefined" && args.duration >= 0 ? args.duration : 500,
            f,
            func,
            cv = from,
            timer = args.timer || new Timer(),
            diff = to - from,
            doLog = args.log || false,
            c = 0, // number of times func get's executed
            lastExecution = 0,
            fps = args.fps || 60;

        f = args.easing || easing.sineEaseOut;

        func = function () {
            
            var dt, tElapsed;
            
            if ((Date.now() - lastExecution) > (1000 / fps)) {
                
                if (timer.canceled) {
                    return;
                }
                
                if (timer.paused) {
                    timer.once(func, "resumed");
                    
                    return;
                }
                
                c += 1;
                tElapsed = timer.elapsed();
                
                if (tElapsed > dur || timer.stopped) {
                    cv = from + diff;
                    callback(to);
                    
                    if (!timer.stopped) {
                        timer.stop();
                    }
                    
                    return;
                }
                
                cv = f(dur, tElapsed) * diff + from;
                
                callback(cv);
                
                dt = timer.elapsed() - tElapsed;
                
                if (doLog === true) {
                    console.log("Current value: " + cv + "; c: " + c + "; Exec time: " + dt);
                }
                
                lastExecution = Date.now();
            }

            requestAnimationFrame(func);
        };

        timer.start();
        requestAnimationFrame(func);
        
        return timer;
    }
    
    return transform;
    
});