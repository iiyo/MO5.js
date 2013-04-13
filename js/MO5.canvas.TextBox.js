(function (out) {
    
    out.canvas = out.canvas || {};
    
    /**
     * 
     *    [Constructor] MO5.canvas.TextBox
     *    ================================
     * 
     *        A TextBox object can be used to display text on the canvas with a 
     *        specific width. If the text is longer than the width of the TextBox, 
     *        the text will be displayed on multiple lines.
     * 
     *        TextBox objects consider words to be atomic and will only start newlines
     *        at the end of words.
     * 
     * 
     *    Concepts:
     *    ---------
     * 
     * Layer
     * Shadow
     * Position
     * Rotation
     * 
     * 
     *    Parameters:
     *    -----------
     * 
     *        1. canvas:
     *            [MO5.canvas.Canvas] A Canvas object to use.
     * 
     *        2. args:
     *            [Object] An object literal to initialize the properties.
     * 
     * 
     *    Properties:
     *    -----------
     * 
     * text: 
     *            [String] The text to be displayed. Default: "".
     * 
     * lineHeight:
     *            [Number] The height of lines in pixels. Default: 18.
     * 
     * color:
     *            [String] The CSS color of the text. Default: "#fff".
     * 
     * font:
     *            [String] The CSS font settings. 
     *            Default: "bold 15px Arial, Helvetica, sans-serfif".
     * 
     * align:
     *            [String] How the text should be aligned. 
     *            Default: "left".
     * 
     * 
     */
    out.canvas.TextBox = function (canvas, args)
    {
        args = args || {};
        
        out.canvas.CanvasObject.call(this, canvas, args);

        if (!(this instanceof out.canvas.TextBox))
        {
            return new out.canvas.TextBox(canvas, args);
        }
        
        this.lastText = "";
        this.lines = [];
        this.text = args.text || "";
        this.lineHeight = 18;
        this.color = "#fff";
        this.font = args.font || "bold 15px Arial, Helvetica, sans-serif";
        this.align = args.align || "left";
        this.shadowX = args.shadowX || 2;
        this.shadowY = args.shadowY || 2;
        this.shadowBlur = args.shadowBlur || 2;
        this.shadowColor = args.shadowColor || "rgba(0, 0, 0, 0.5)";
        this.hasShadow = args.hasShadow || false;
        this.updated = true;
    };

    out.canvas.TextBox.prototype = new out.canvas.CanvasObject();

    out.canvas.TextBox.prototype.draw = function ()
    {
        var self = this,
            ct = self.canvas.ct,
            words = self.text.split(" "),
            word = "",
            line = "",
            len = words.length,
            i,
            lineLen;
            
        ct.save();
        ct.globalAlpha = self.alpha;
        
        if (self.rotation > 0)
        {
            ct.translate(self.pivotX, self.pivotY);
            ct.rotate((Math.PI * self.rotation) / 180);
            ct.translate(-self.pivotX, - self.pivotY);
        }
        
        if (self.hasShadow === true)
        {
            ct.shadowOffsetX = self.shadowX;
            ct.shadowOffsetY = self.shadowY;
            ct.shadowBlur = self.shadowBlur;
            ct.shadowColor = self.shadowColor;
        }
        
        ct.fillStyle = self.color;
        ct.font = self.font;
        ct.textAlign = self.align;
        
        if (this.text !== self.lastText)
        {
            self.lines = [];
            
            for (i = 0; i < len; ++i)
            {
                word = words[i];
                
                if (ct.measureText(line + " " + word).width > self.width)
                {
                    self.lines.push(line);
                    line = "";
                }
                
                line = line + " " + word;
                
                if (i === len - 1)
                {
                    self.lines.push(line);
                }
            }
        }
        
        lineLen = self.lines.length;
        
        for (i = 0; i < lineLen; ++i)
        {
            ct.fillText(
            self.lines[i], ((0.5 + self.x) | 0), ((0.5 + (self.y + self.lineHeight * i)) | 0));
        }
        
        self.lastText = self.text;
        self.canvas.ct.restore();
    };

}(MO5));