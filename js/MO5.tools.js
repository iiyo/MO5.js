(function (out) {

    out.tools = out.tools || {};
    
    /**
     * Returns a unique ID for MO5 objects.
     * @return [Number] The unique ID.
     */
    out.tools.getUniqueId = function ()
    {
        var p1, p2, p3, ret;
        
        p1 = 255 * Math.random();
        p2 = 255 * Math.random();
        p3 = 255 * Math.random();
        out.highestId += 1;
        ret = out.highestId + parseInt(p1 * p2 * p3, 10);
        
        return ret;
    };

    /**
     * Returns the window's width and height.
     * @return Object An object with a width and a height property.
     */
    out.tools.getWindowDimensions = function ()
    {
        var e = window,
            a = 'inner';
        
        if (!('innerWidth' in e))
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        
        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    };

    /**
     * Scales an element to fit the window using CSS transforms.
     * @param el The DOM element to scale.
     * @param w The normal width of the element.
     * @param h The normal height of the element.
     */
    out.tools.fitToWindow = function (el, w, h)
    {
        var dim, ratio, sw, sh, ratioW, ratioH;
        
        dim = out.tools.getWindowDimensions();
        sw = dim.width; // - (dim.width * 0.01);
        sh = dim.height; // - (dim.height * 0.01);

        ratioW = sw / w;
        ratioH = sh / h;

        ratio = ratioW > ratioH ? ratioH : ratioW;

        el.setAttribute('style',
        el.getAttribute('style') + ' -moz-transform: scale(' + ratio + ',' + ratio + ') rotate(0.01deg);' + ' -ms-transform: scale(' + ratio + ',' + ratio + ');' + ' -o-transform: scale(' + ratio + ',' + ratio + ');' + ' -webkit-transform: scale(' + ratio + ',' + ratio + ');' + ' transform: scale(' + ratio + ',' + ratio + ');');
    };
    
    out.tools.timeoutInspector = (function () {
        
        var oldSetTimeout, oldSetInterval, oldClearTimeout, oldClearInterval, oldRequestAnimationFrame;
        var activeIntervals = {}, timeoutCalls = 0, intervalCalls = 0, animationFrameRequests = 0;
        
        oldSetTimeout = window.setTimeout;
        oldSetInterval = window.setInterval;
        oldClearTimeout = window.clearTimeout;
        oldClearInterval = window.clearInterval;
        oldRequestAnimationFrame = window.requestAnimationFrame;
        
        return {
            logAnimationFrameRequests: false,
            logTimeouts: false,
            logIntervals: false,
            
            enable: function () {
                window.setTimeout = function (f, t) {
                    var h = oldSetTimeout(f, t);
                    
                    timeoutCalls += 1;
                    
                    if (this.logTimeouts) {
                        console.log("Setting timeout: ", {callback: f.toString(), time: t}, h);
                    }
                    
                    return h;
                };
                
                window.setInterval = function (f, t) {
                    var h = oldSetInterval(f, t);
                    
                    intervalCalls += 1;
                    activeIntervals[h] = true;
                    
                    if (this.logIntervals) {
                        console.log("Setting interval: ", {callback: f.toString(), time: t}, h);
                    }
                    
                    return h;
                };
                
                window.clearTimeout = function (h) {
                    console.log("Clearing timeout: ", h);
                    
                    return oldClearTimeout(h);
                };
                
                window.clearInterval = function (h) {
                    console.log("Clearing interval: ", h);
                    
                    if (!(h in activeIntervals)) {
                        console.log("Warning: Interval " + h + " doesn't exist.");
                    }
                    else {
                        delete activeIntervals[h];
                    }
                    
                    return oldClearInterval(h);
                };
                
                window.requestAnimationFrame = function (f) {
                    animationFrameRequests += 1;
                    
                    if (this.logAnimationFrameRequests) {
                        console.log("Requesting animation frame: ", {callback: f.toString()});
                    }
                    
                    return oldRequestAnimationFrame(f);
                };
            },
            
            disable: function () {
                window.setTimeout = oldSetTimeout;
                window.setInterval = oldSetInterval;
                window.clearTimeout = oldClearTimeout;
                window.clearInterval = oldClearInterval;
                window.requestAnimationFrame = oldRequestAnimationFrame;
            },
            
            getActiveIntervals: function () {
                var key, handles = [];
                
                for (key in this.activeIntervals) {
                    handles.push(key);
                }
                
                return handles;
            },
            
            totalTimeoutCalls: function () {
                return timeoutCalls;
            },
            
            totalIntervalCalls: function () {
                return intervalCalls;
            },
            
            totalRequestAnimationFrameCalls: function () {
                return animationFrameRequests;
            }
        };
    }());
    
}(MO5));