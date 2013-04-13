(function (out) {
    
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
    out.transform = function (callback, from, to, args)
    {
        args = args || {};

        if (typeof callback === "undefined" || !callback)
        {
            throw new out.Error("MO5.transform expects parameter callback to be a function.");
        }

        var dur = args.duration || 1000,
            f,
            func,
            cv = from,
            timer = args.timer || new out.Timer(),
            diff = to - from,
            doLog = args.log || false,
            c = 0, // number of times func get's executed
            onFinish = args.onFinish || function () {},
            lastExecution = 0,
            fps = args.fps || out.defaults.fps;

        f = args.easing || out.easing.sineEaseOut;

        func = function ()
        {
            var t, dt, tElapsed;
            
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
                
                if (doLog === true)
                {
                    console.log("Current value: " + cv + "; c: " + c + "; Exec time: " + dt);
                }
                
                lastExecution = Date.now();
            }

            requestAnimationFrame(func);
        };

        timer.start();
        requestAnimationFrame(func);
        
        return timer;
    };
    
}(MO5));