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
        
        out.canvas.CanvasObject.call(this, canvas, args);

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
    
    out.canvas.Rectangle.prototype = new out.canvas.CanvasObject();

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