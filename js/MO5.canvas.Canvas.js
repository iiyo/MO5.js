(function (out) {
    
    out.canvas = out.canvas || {};
    
    /**
     * Constructor function for an object to wrap the HTML5 canvas 
     * and provide an animation loop.
     * 
     * @param Object args Optional arguments for the Canvas.
     *     Properties:
     *     - [String] id The HTML ID of a canvas element to use.
     *     - [Number] width The width of the canvas element in pixels. Default: 800.
     *     - [Number] height The height of the canvas element in pixels. Default: 450.
     *     - [Boolean] scale Should the canvas be scaled? Default: false.
     *     - [Number] scaleX The scale factor on the x axis. Default: 1.
     *     - [Number] scaleY The scale factor on the y axis. Default: 1.
     */
    out.canvas.Canvas = function (args)
    {
        args = args || {};

        out.Object.call(this);
        
        var self = this, id = args.id || null, isFrozen = false, lastDrawingTime = 0;
        
        if (id === null)
        {
            this.cv = document.createElement("canvas");
            this.cv.setAttribute("id", "MO5Canvas" + this.id);
        }
        else
        {
            this.cv = document.getElementById(id);
        }
        
        this.ct = this.cv.getContext("2d");
        this.fps = args.fps || out.defaults.fps;
        this.tbf = 1 / this.fps;
        this.time = 0;
        this.sine = 0;
        this.width = args.width || 800;
        this.height = args.height || 450;
        this.functions = [];
        this.functionsByKey = {};
        this.functionsByPriority = [];
        this.scale = args.scale || false;
        this.scaleX = args.scaleX || 1;
        this.scaleY = args.scaleY || 1;
        this.frozen = false;
        this.temp = document.createElement("canvas");
        this.stopped = true;
        this.bus = args.bus || out.bus;

        this.cv.width = this.width;
        this.cv.height = this.height;
        this.temp.width = this.width;
        this.temp.height = this.height;
        document.body.appendChild(this.cv);

        this.draw = function () {
            
            var tbf, env, len, i, time, funcs, cv, ct;
            
            tbf = self.tbf;
            self.time += tbf;
            time = self.time;
            funcs = self.functions;
            cv = self.cv;
            ct = self.ct;
            
            if ((Date.now() - lastDrawingTime) > (1000 / self.fps)) {
                
                if (self.frozen === true && isFrozen === true) {
                    ct.drawImage(self.temp, 0, 0);
                    
                    return;
                }
                else if (self.frozen === false && isFrozen === true) {
                    isFrozen = false;
                }
                
                self.sine = (Math.sin(time) + 1) / 2;
                
                env = {
                    context: ct,
                    canvas: cv,
                    fps: self.fps,
                    tbf: tbf,
                    time: time,
                    sine: self.sine
                };
                
                ct.clearRect(0, 0, cv.width, cv.height);
                
                for (i = 0, len = funcs.length; i < len; ++i)
                {
                    funcs[i].callback(env);
                }
                
                if (self.frozen === true)
                {
                    self.temp.clearRect(0, 0, self.width, self.height);
                    self.temp.drawImage(cv, 0, 0);
                    isFrozen = true;
                }
                
                lastDrawingTime = Date.now();
            }
            
            if (self.stopped === false)
            {
                requestAnimationFrame(self.draw);
            }
        };
    };
    
    out.canvas.Canvas.prototype = new out.Object();

    /**
     * Adds a drawing function to the Canvas. The function will be called
     * on each animation loop iteration.
     * 
     * @param [String] key A key to identify the drawing function.
     * @param [Function] cb The drawing function.
     * @
     * param [Number] (optional) The priority that determines the order in which
     *    drawing functions will be executed. The higher the number,
     *    the later the drawing function will be called. That means
     *    the things that should be drawn in the foreground should
     *    have the highest priority. Default: 0.
     */
    out.canvas.Canvas.prototype.addCallback = function (key, cb, priority)
    {
        var fbp, func;
        
        fbp = this.functionsByPriority,
        
        func = {
            key: key,
            callback: cb,
            priority: priority || 0
        };
        
        if (typeof fbp[priority] === 'undefined' || fbp[priority] === null)
        {
            this.functionsByPriority[priority] = [];
        }
        
        this.functionsByPriority[priority].push(func);
        this.functionsByKey[key] = func;
        this.rebuildFunctionQueue();
    };

    /**
     * Rebuilds the function queue. This function is not meant 
     * to be used by MO5 users and should be considered private.
     */
    out.canvas.Canvas.prototype.rebuildFunctionQueue = function ()
    {
        var len, cur, i, j, plen;
        
        this.functions = [];
        len = this.functionsByPriority.length;
        
        for (i = 0; i < len; ++i)
        {
            if (typeof this.functionsByPriority[i] === "undefined")
            {
                continue;
            }
            
            cur = this.functionsByPriority[i];
            plen = cur.length;
            
            for (j = 0; j < plen; ++j)
            {
                this.functions.push(cur[j]);
            }
        }
    };

    /**
     * Removes a drawing function from the Canvas queue.
     * @param String key The key to identify the drawing function.
     */
    out.canvas.Canvas.prototype.removeCallback = function (key)
    {
        var func, priority, bucket, len, i;
        
        if (typeof this.functionsByKey[key] === "undefined")
        {
            return;
        }
        
        func = this.functionsByKey[key],
        priority = func.priority,
        bucket = this.functionsByPriority[priority],
        len = bucket.length;
        
        for (i = 0; i < len; i += 1)
        {
            //console.log("bucket[i]: ", bucket[i], i, key);
            
            if (bucket[i].key !== key)
            {
                continue;
            }
            
            this.functionsByPriority[priority].splice(i, 1);
        }
        
        this.rebuildFunctionQueue();
        delete this.functionsByKey[key];
    };

    /**
     * Starts the animation loop.
     */
    out.canvas.Canvas.prototype.start = function ()
    {
        this.stopped = false;
        this.draw();
    };

    /**
     * Stops the animation loop.
     */
    out.canvas.Canvas.prototype.stop = function ()
    {
        this.stopped = true;
    };

    /**
     * Scales the canvas to fit the window.
     * @param Boolean onlyIfSmaller (optional) Only resize the canvas to
     *     the current window dimensions when the window is smaller
     *     than the canvas?
     *     Default: false
     */
    out.canvas.Canvas.prototype.fitToWindow = function (onlyIfSmaller)
    {
        var dim = out.tools.getWindowDimensions(),
            el = this.cv,
            ww = dim.width,
            wh = dim.height,
            ratio = this.width / this.height,
            hv = ww / ratio,
            wv = wh * ratio,
            newRatio = ww / wh;
        
        onlyIfSmaller = onlyIfSmaller || false;

        if (onlyIfSmaller === true && ww >= this.width && wh >= this.height)
        {
            return;
        }

        if (ratio < newRatio)
        {
            hv = wh;
        }
        else
        {
            wv = ww;
        }

        el.setAttribute('style', ' width: ' + wv + 'px; height: ' + hv + 
            'px; margin: auto; position: absolute;' + ' left: ' + ((ww - wv) / 2) + 
            'px; top: ' + ((wh - hv) / 2) + 'px;');
    };

    /**
     * Moves the canvas to the center of the browser window.
     */
    out.canvas.Canvas.prototype.center = function ()
    {
        var dim = out.tools.getWindowDimensions(),
            el = this.cv,
            ww = dim.width,
            wh = dim.height,
            hv = this.height,
            wv = this.width;

        el.setAttribute('style', 'position: absolute; left: ' + ((ww - wv) / 2) + 'px; top: ' + ((wh - hv) / 2) + 'px;');
    };
    
}(MO5));