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

(function (out) {
    
    out.canvas = out.canvas || {};

    out.canvas.Object = function (args) {
        args = args || {};
        
        out.Object.call(this);
        
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 1;
        this.height = args.height || 1;
        this.layer = args.layer || 0;
        this.alpha = args.alpha || 1;
        this.rotation = args.rotation || 0;
        this.pivotX = args.pivotX || this.x;
        this.pivotY = args.pivotY || this.y;
    };
    
    out.canvas.Object.prototype = new out.Object();
    
    out.canvas.Object.prototype.move = function (x, y, args) {
        
        args = args || {};
        
        return this.moveTo(this.x + x, this.y + y, args);
    };
    
    out.canvas.Object.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var t0, t1, self = this, watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.x = v | 0;
                },
                this.x,
                x,
                args
            )
         ).addTimer(
            out.transform(
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
    
    out.canvas.Object.prototype.fadeIn = function (args) {
        
        var self = this, watcher;
        
        args = args || {};
        watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.opacity = v;
                },
                this.opacity,
                1,
                args
            )
        );
    };
    
    out.canvas.Object.prototype.fadeOut = function (args) {
        
        var self = this;
        
        args = args || {};
        watcher = args.watcher || new out.TimerWatcher();
        
        return watcher.addTimer(
            out.transform(
                function (v)
                {
                    self.opacity = v;
                },
                this.opacity,
                0,
                args
            )
        );
    };
    
    out.canvas.Object.prototype.getCenter = function () {
        
        var x = (this.x + (this.width / 2)),
            y = (this.y + (this.height / 2));
        
        return new out.Point(x, y);
    };
    
    out.canvas.Object.prototype.isAtOffset = function (x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    };
    
    out.canvas.Object.prototype.change = function (key, value) {
        this[key] = value;
        this.updated = true;
        this.trigger("updated");
    };
    
}(MO5));