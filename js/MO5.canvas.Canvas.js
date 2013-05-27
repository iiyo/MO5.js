(function (out) {
    
    out.canvas = out.canvas || {};
    
    function draw (self, lastDrawingTime) {
        
        if ((Date.now() - lastDrawingTime) > (1000 / self.fps)) {
            self.ct.clearRect(0, 0, self.cv.width, self.cv.height);
            
            self.layers.forEach(function (layer) {
                layer.draw({
                    canvas: self.cv,
                    context: self.ct
                });
            });
            
            lastDrawingTime = Date.now();
        }
        
        if (!self.stopped) {
            requestAnimationFrame(function () { draw(self, lastDrawingTime); });
        }
    }
    
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
        
        var self = this, id = args.cssid || null, lastDrawingTime = 0, lastObject;
        
        if (id === null)
        {
            this.cv = document.createElement("canvas");
            this.cv.setAttribute("id", "MO5Canvas" + this.id);
            document.body.appendChild(this.cv);
        }
        else
        {
            this.cv = document.getElementById(id);
        }
        
        this.layers = new MO5.List();
        
        this.ct = this.cv.getContext("2d");
        this.fps = args.fps || out.defaults.fps;
        this.width = args.width || out.defaults.canvas.width;
        this.height = args.height || out.defaults.canvas.height;
        this.functions = [];
        this.functionsByKey = {};
        this.functionsByPriority = [];
        this.scale = args.scale || false;
        this.scaleX = args.scaleX || 1;
        this.scaleY = args.scaleY || 1;
        this.stopped = true;

        this.cv.width = this.width;
        this.cv.height = this.height;
        document.body.appendChild(this.cv);
        
        function makePointerFn (type) {
            return function (ev) {
            
                var x = ev.pageX - self.cv.offsetLeft;
                var y = ev.pageY - self.cv.offsetTop;
                var obj = self.objectAtOffset(x, y);
                var evObj = {
                    event: ev, 
                    x: x,
                    y: y
                };
                
                if (obj) {
                    obj.trigger(type, evObj, false);
                }
                
                if (lastObject !== obj) {
                    if (lastObject) {
                        lastObject.trigger("mouseout", evObj);
                    }
                    if (obj) {
                        obj.trigger("mousein", evObj);
                    }
                }
                
                lastObject = obj;
                
                self.trigger(type, evObj, false);
            };
        }
        
        this.cv.addEventListener("click", makePointerFn("click"));
        this.cv.addEventListener("mousemove", makePointerFn("mousemove"));

    };
    
    out.canvas.Canvas.prototype = new out.Object();
    
    out.canvas.Canvas.prototype.addLayer = function (layer) {
        if (!(layer instanceof out.canvas.Layer)) {
            throw new out.Error("Parameter 1 must be an instance of canvas.Layer.");
        }
        
        this.layers.append(layer);
        
        return this;
    };
    
    out.canvas.Canvas.prototype.objectAtOffset = function (x, y) {
        var q = this.layers.toQueue().reverse(), obj = null, layer, cur;
        
        while (q.hasNext()) {
            layer = q.next();
            
            cur = layer.objectAtOffset(x, y);
            
            if (cur) {
                obj = cur;
                break;
            }
        }
        
        return obj;
    };
    
    out.canvas.Canvas.prototype.objectsAtOffset = function (x, y) {
        var q = this.layers.toQueue().reverse(), objects = [], layer, cur;
        
        while (q.hasNext()) {
            layer = q.next();
            
            cur = layer.objectsAtOffset(x, y);
            
            if (cur) {
                cur.forEach(function (item) { objects.push(item); });
            }
        }
        
        return objects;
    };
    
    out.canvas.Canvas.prototype.activate = function () {
        this.stopped = false;
        this.loop();
    };
    
    out.canvas.Canvas.prototype.deactivate = function () {
        this.stopped = true;
    };
    
    out.canvas.Canvas.prototype.loop = function () {
        draw(this, 0);
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

        el.setAttribute('style', 'position: absolute; left: ' + 
            ((ww - wv) / 2) + 'px; top: ' + ((wh - hv) / 2) + 'px;');
    };
    
}(MO5));