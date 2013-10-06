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

MO5("MO5.canvas.Object").
define("MO5.canvas.Rain", function (CanvasObject) {
    
    /**
     *    [Constructor] MO5.canvas.Rain
     *    =============================
     *    
     *        A rain effect.
     *        
     *        Concepts:
     *        ---------
     *        
     * Dimensions
     * Layer
     * Transparency
     * Rotation
     * Position
     *        
     *        Parameters:
     *        -----------
     *        
     *            1. canvas:
     *                [MO5.canvas.Canvas] The Canvas object to use.
     *            
     *            2. args:
     *                [Object] An object literal with optional arguments.
     *                
     *                Properties:
     *                
     * speed:
     *                        [Number] The number of pixels to move on each iteration.
     *                    
     * drops:
     *                        [Number] The number of rain drops to display.
     *                        
     *                        
     */
    function Rain (args) {
        
        args = args || {};
        
        CanvasObject.call(this, args);

        this.color = args.color || "#fff";
        this.drops = args.drops || 100;
        this.data = null;
        this.speed = args.speed || 800;
        this.width = args.width || 800;
        this.height = args.height || 600;
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.lastDrawTime = 0;
    }
    
    Rain.prototype = new CanvasObject();

    Rain.prototype.draw = function (env)
    {
        var self = this,
            ct = env.context,
            cv = env.canvas,
            drops = self.drops,
            i,
            data = self.data,
            x,
            fy,
            ly,
            width = self.width,
            height = self.height,
            cur,
            speed = (((Date.now() - self.lastDrawTime) / 1000) * self.speed) | 0;
        
        //console.log("speed: ", speed);
        
        ct.save();
        ct.globalAlpha = self.alpha;
        
        if (self.rotation > 0) {
            
            ct.translate(self.pivotX, self.pivotY);
            ct.rotate((Math.PI * self.rotation) / 180);
            ct.translate(-self.pivotX, - self.pivotY);
        }
        
        if (data === null) {
            
            data = [];
            
            for (i = 0; i < drops; ++i) {
                
                x = (Math.random() * width - (self.width - cv.width) / 2) | 0;
                fy = (Math.random() * height - (self.height - cv.height) / 2) | 0;
                ly = (Math.random() * 40 + 5) | 0;
                
                data.push({
                    x: x,
                    fy: fy,
                    ly: ly
                });
            }
        }
        
        ct.strokeStyle = self.color;
        ct.lineWidth = 1;
        ct.beginPath();
        
        for (i = 0; i < drops; ++i) {
            
            cur = data[i];
            cur.fy += speed;
            
            if (cur.fy > cv.height + cur.ly) {
                cur.fy = 0 - (self.height - cv.height) / 2 - cur.ly;
                cur.x = Math.random() * width - (self.width - cv.width) / 2;
            }
            
            ct.moveTo(cur.x, cur.fy);
            ct.lineTo(cur.x, cur.fy + cur.ly);
            ct.moveTo(cur.x - 1, cur.fy + 2 * (cur.ly / 3));
            ct.lineTo(cur.x - 1, cur.fy + cur.ly);
            data[i] = cur;
        }
        
        ct.stroke();
        ct.closePath();
        ct.restore();
        self.data = data;
        
        self.lastDrawTime = Date.now();
    };
    
    return Rain;
    
});