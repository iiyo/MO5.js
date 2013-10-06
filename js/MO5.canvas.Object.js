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

/* global MO5 */

MO5("MO5.CoreObject", "MO5.TimerWatcher", "MO5.transform", "MO5.Point").
define("MO5.canvas.Object", function (CoreObject, TimerWatcher, transform, Point) {
    
    function CanvasObject (args) {
        args = args || {};
        
        CoreObject.call(this);
        
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 1;
        this.height = args.height || 1;
        this.layer = args.layer || 0;
        this.alpha = args.alpha || 1;
        this.rotation = args.rotation || 0;
        this.pivotX = args.pivotX || this.x;
        this.pivotY = args.pivotY || this.y;
    }
    
    CanvasObject.prototype = new CoreObject();
    
    CanvasObject.prototype.move = function (x, y, args) {
        
        args = args || {};
        
        return this.moveTo(this.x + x, this.y + y, args);
    };
    
    CanvasObject.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var self = this, watcher = args.watcher || new TimerWatcher();
        
        return watcher.addTimer(
            transform(
                function (v)
                {
                    self.x = v | 0;
                },
                this.x,
                x,
                args
            )
         ).addTimer(
            transform(
                function (v)
                {
                    self.y = v | 0;
                },
                this.y,
                y,
                args
            )
        );
    };
    
    CanvasObject.prototype.fadeIn = function (args) {
        
        var self = this, watcher;
        
        args = args || {};
        watcher = args.watcher || new TimerWatcher();
        
        return watcher.addTimer(
            transform(
                function (v)
                {
                    self.alpha = v;
                },
                this.alpha,
                1,
                args
            )
        );
    };
    
    CanvasObject.prototype.fadeOut = function (args) {
        
        var self = this, watcher;
        
        args = args || {};
        watcher = args.watcher || new TimerWatcher();
        
        return watcher.addTimer(
            transform(
                function (v)
                {
                    self.alpha = v;
                },
                this.alpha,
                0,
                args
            )
        );
    };
    
    CanvasObject.prototype.getCenter = function () {
        
        var x = (this.x + (this.width / 2)),
            y = (this.y + (this.height / 2));
        
        return new Point(x, y);
    };
    
    CanvasObject.prototype.isAtOffset = function (x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    };
    
    CanvasObject.prototype.change = function (key, value) {
        this[key] = value;
        this.updated = true;
        this.trigger("updated");
    };
    
    CanvasObject.prototype.rotate = function (deg, args) {
        
        var self = this;
        
        args = args || {};
        
        return transform(function (v) {
            self.rotation = v;
        }, this.rotation, this.rotation + deg, args);
    };
    
    CanvasObject.prototype.setPivot = function (xOffset, yOffset) {
        this.pivotX = xOffset;
        this.pivotY = yOffset;
    };
    
    return CanvasObject;
    
});