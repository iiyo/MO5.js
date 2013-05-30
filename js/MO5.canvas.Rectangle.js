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
    
    /**
     * 
     *   [Constructor] MO5.canvas.Rectangle:
     *   ===================================
     *   
     *      Wraps the rectangle functionality of the HTML5 Canvas.
     *  
     *  
     *      Concepts:
     *      ---------
     *  
     * Dimensions
     * Position
     * Layer
     * Rotation
     * Border
     * Shadow
     * Transparency
     * Canvas Object
     * 
     *  
     *      Parameters:
     *      -----------
     *  
     *         1. canvas:
     *            [MO5.canvas.Canvas] The Canvas object to use.
     *  
     *         2. args:
     *            [Object] An object literal for initializing optional arguments.
     *            Take a look at the concepts section for all possible properties.
     *       
     *            Properties:
     *  
     * color: 
     *                  [String] The fill color of the rectangle. 
     *                  Default: "#fff".
     *  
     *  
     */
    out.canvas.Rectangle = function (canvas, args)
    {
        args = args || {};
        
        out.canvas.Object.call(this, canvas, args);

        if (!(this instanceof out.canvas.Rectangle))
        {
            return new out.canvas.Rectangle(canvas, args);
        }

        this.color = args.color || "#fff";
        this.borderColor = args.borderColor || "#000";
        this.borderWidth = args.borderWidth || 1;
        this.shadowX = args.shadowX || 5;
        this.shadowY = args.shadowY || 5;
        this.shadowBlur = args.shadowBlur || 5;
        this.shadowColor = args.shadowColor || "rgba(0, 0, 0, 0.5)";
        this.hasShadow = args.hasShadow || false;
        this.width = 100;
        this.height = 60;
    };
    
    out.canvas.Rectangle.prototype = new out.canvas.Object();

    out.canvas.Rectangle.prototype.draw = function (env)
    {
        var self = this,
            ct = env.context,
            x = self.x,
            y = self.y,
            width = self.width,
            height = self.height,
            rotation = self.rotation,
            pivotX = self.pivotX,
            pivotY = self.pivotY;
        
        ct.save();
        ct.globalAlpha = self.alpha;
        
        if (rotation > 0)
        {
            ct.translate(pivotX, pivotY);
            ct.rotate((Math.PI * rotation) / 180);
            ct.translate(-pivotX, - pivotY);
        }
        
        if (self.hasShadow === true)
        {
            ct.shadowOffsetX = self.shadowX;
            ct.shadowOffsetY = self.shadowY;
            ct.shadowBlur = self.shadowBlur;
            ct.shadowColor = self.shadowColor;
        }
        
        ct.fillStyle = self.color;
        ct.fillRect(x, y, width, height);
        
        if (self.borderWidth > 0)
        {
            ct.strokeStyle = self.borderColor;
            ct.lineWidth = self.borderWidth;
            ct.strokeRect(x, y, width, height);
        }
        
        ct.restore();
    };

}(MO5));