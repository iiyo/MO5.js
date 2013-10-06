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

/* global MO5, requestAnimationFrame, document, setTimeout, clearTimeout */

MO5("MO5.CoreObject", "MO5.List", "MO5.Exception", "MO5.canvas.Layer", "MO5.tools").
define("MO5.canvas.Canvas", function (CoreObject, List, Exception, Layer, tools) {
    
    var mousePosition = {x: null, y: null};
    
    function timeBetweenFramesReached (self, lastDrawingTime) {
        return (Date.now() - lastDrawingTime) > (1000 / self.fps);
    }
    
    function draw (self, lastDrawingTime) {
        
        if (timeBetweenFramesReached(self, lastDrawingTime)) {
            
            self.clear();
            
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
     * Wraps the HTML5 canvas and provides an animation loop.
     * 
     * @param Object args Optional arguments
     *     Properties:
     *     - [String] id The HTML ID of a canvas element to use.
     *     - [Number] width Canvas element width in pixels. Default: 800.
     *     - [Number] height Canvas element height in pixels. Default: 450.
     *     - [Boolean] scale Should the canvas be scaled? Default: false.
     *     - [Number] scaleX The scale factor on the x axis. Default: 1.
     *     - [Number] scaleY The scale factor on the y axis. Default: 1.
     */
    function Canvas (args) {
        
        args = args || {};

        CoreObject.call(this);
        
        var self = this, id = args.cssid || null, lastObject;
        
        if (id === null) {
            this.cv = document.createElement("canvas");
            this.cv.setAttribute("id", "MO5Canvas" + this.id);
            document.body.appendChild(this.cv);
        }
        else {
            this.cv = document.getElementById(id);
        }
        
        this.layers = new List();
        
        this.ct = this.cv.getContext("2d");
        this.fps = args.fps || MO5.defaults.fps;
        this.width = args.width || MO5.defaults.canvas.width;
        this.height = args.height || MO5.defaults.canvas.height;
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
                
                if (lastObject !== obj) {
                    
                    if (lastObject) {
                        lastObject.trigger("mouseout", evObj, true);
                    }
                    
                    if (obj) {
                        obj.trigger("mouseover", evObj, false);
                    }
                }
                
                lastObject = obj;
                
                if (obj) {
                    obj.trigger(type, evObj, false);
                }
                
                self.trigger(type, evObj, false);
            };
        }
        
        this.cv.addEventListener("click", makePointerFn("click"));
        this.cv.addEventListener("mousemove", makePointerFn("mousemove"));
        
        this.cv.addEventListener("mousemove", function (ev) {
            mousePosition.x = ev.pageX - self.cv.offsetLeft;
            mousePosition.y = ev.pageY - self.cv.offsetTop;
        });
        
        this.cv.addEventListener("mousemove", function mouseMoveFn () {
            
            var stop = false, handle;
        
            function delegateMousePosition () {
                
                var evObj = {x: mousePosition.x, y: mousePosition.y};
                
                if (stop) {
                    return;
                }
                
                var obj = self.objectAtOffset(evObj.x, evObj.y);
            
                if (obj) {
                    obj.trigger("hover", evObj, false);
                }
                
                lastObject = obj;
                
                handle = setTimeout(delegateMousePosition, 20);
            }
            
            function stopListener () {
                stop = true;
                clearTimeout(handle);
                self.cv.addEventListener("mousemove", mouseMoveFn);
                self.cv.removeEventListener("mouseout", stopListener);
            }
            
            self.cv.removeEventListener("mousemove", mouseMoveFn);
            self.cv.addEventListener("mouseout", stopListener);
            
            delegateMousePosition();
        });

    }
    
    Canvas.prototype = new CoreObject();
    
    Canvas.prototype.clear = function () {
        this.ct.clearRect(0, 0, this.cv.width, this.cv.height);
    };
    
    Canvas.prototype.addLayer = function (layer) {
        
        if (!layer.implements(Layer.prototype)) {
            throw new Exception("Parameter 1 must implement the MO5.canvas.Layer interface.");
        }
        
        this.layers.append(layer);
        
        return this;
    };
    
    Canvas.prototype.objectAtOffset = function (x, y) {
        
        var queueOfLayers = this.layers.toQueue().reverse();
        var objectToBeReturned = null, currentCanvasObject;
        
        while (queueOfLayers.hasNext()) {
            
            currentCanvasObject = queueOfLayers.next().objectAtOffset(x, y);
            
            if (currentCanvasObject) {
                objectToBeReturned = currentCanvasObject;
                break;
            }
        }
        
        return objectToBeReturned;
    };
    
    Canvas.prototype.objectsAtOffset = function (x, y) {
        
        var queueOfLayers = this.layers.toQueue().reverse();
        var objectsToBeReturned = [], currentCanvasObject;
        
        while (queueOfLayers.hasNext()) {
            
            currentCanvasObject = queueOfLayers.next().layer.objectsAtOffset(x, y);
            
            if (currentCanvasObject) {
                currentCanvasObject.forEach(function (item) {
                    objectsToBeReturned.push(item);
                });
            }
        }
        
        return objectsToBeReturned;
    };
    
    Canvas.prototype.activate = function () {
        this.stopped = false;
        this.loop();
    };
    
    Canvas.prototype.deactivate = function () {
        this.stopped = true;
    };
    
    Canvas.prototype.loop = function () {
        draw(this, 0);
    };

    /**
     * Scales the canvas to fit the window.
     * @param Boolean onlyIfSmaller (optional) Only resize the canvas to
     *     the current window dimensions when the window is smaller
     *     than the canvas?
     *     Default: false
     */
    Canvas.prototype.fitToWindow = function () {
        
        var windowDimensions = tools.getWindowDimensions(),
            windowWidth = windowDimensions.width,
            windowHeight = windowDimensions.height,
            ratio = this.width / this.height,
            canvasHeight = windowWidth / ratio,
            canvasWidth = windowHeight * ratio,
            newRatio = windowWidth / windowHeight;

        if (ratio < newRatio) {
            canvasHeight = windowHeight;
        }
        else {
            canvasWidth = windowWidth;
        }

        this.cv.setAttribute('style', ' width: ' + canvasWidth + 'px; height: ' + 
            canvasHeight + 'px; margin: auto; position: absolute;' + ' left: ' + 
            ((windowWidth - canvasWidth) / 2) + 
            'px; top: ' + ((windowHeight - canvasHeight) / 2) + 'px;');
    };

    Canvas.prototype.moveToWindowCenter = function () {
        
        var windowDimensions = tools.getWindowDimensions(),
            canvasElement = this.cv,
            windowWidth = windowDimensions.width,
            windowHeight = windowDimensions.height,
            canvasHeight = this.height,
            canvasWidth = this.width;

        canvasElement.setAttribute('style', 'position: absolute; left: ' + 
            ((windowWidth - canvasWidth) / 2) + 'px; top: ' + 
            ((windowHeight - canvasHeight) / 2) + 'px;');
    };
 
    return Canvas;
    
});