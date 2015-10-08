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

/* global using, window, document, console */

using().define("MO5.tools", function () {
    
    var tools = {};
    
    /**
     * Returns a unique ID for MO5 objects.
     * @return [Number] The unique ID.
     */
    tools.getUniqueId = (function () {
        
        var n = 0;
        
        return function () {
            return n++;
        };
    }());
    
    /**
     * Returns the window's width and height.
     * @return Object An object with a width and a height property.
     */
    tools.getWindowDimensions = function () {
        
        var e = window, a = 'inner';
        
        if (!('innerWidth' in e)) {
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
    tools.fitToWindow = function (el, w, h) {
        
        var dim, ratio, sw, sh, ratioW, ratioH;
        
        dim = tools.getWindowDimensions();
        sw = dim.width; // - (dim.width * 0.01);
        sh = dim.height; // - (dim.height * 0.01);
        
        ratioW = sw / w;
        ratioH = sh / h;
        
        ratio = ratioW > ratioH ? ratioH : ratioW;
        
        el.setAttribute('style',
        el.getAttribute('style') + ' -moz-transform: scale(' + ratio + ',' + ratio + ') rotate(0.01deg);' + ' -ms-transform: scale(' + ratio + ',' + ratio + ');' + ' -o-transform: scale(' + ratio + ',' + ratio + ');' + ' -webkit-transform: scale(' + ratio + ',' + ratio + ');' + ' transform: scale(' + ratio + ',' + ratio + ');');
    };
    
    tools.timeoutInspector = (function () {
        
        var oldSetTimeout, oldSetInterval, oldClearTimeout;
        var oldClearInterval, oldRequestAnimationFrame;
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
    
    return tools;
    
});