(function (out) {
    
    out.canvas = out.canvas || {};
    
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
    out.canvas.Rain = function (args)
    {
        var self = this;
        
        args = args || {};
        
        out.canvas.Object.call(this, args);

        this.color = args.color || "#fff";
        this.drops = args.drops || 100;
        this.data = null;
        this.speed = args.speed || 800;
        this.width = args.width || 800;
        this.height = args.height || 600;
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.lastDrawTime = 0;
    };
    
    out.canvas.Rain.prototype = new out.canvas.Object();

    out.canvas.Rain.prototype.draw = function (env)
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
    
}(MO5));