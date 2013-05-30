(function (out) {
    
    out.canvas = out.canvas || {};
    
    /**
     * Constructor function for ImagePacks. An ImagePack is an object that
     * wraps one or more images on the canvas. This can be used to animate
     * sprites.
     * 
     * @param MO5.canvas.Canvas canvas The Canvas object to use.
     * @param Object args An object literal containing optional arguments.
     *     Properties:
     *     - [Number] x: The position on the x axis. Default: 0.
     *     - [Number] y: The position on the y axis. Default: 0.
     *     - [Number] layer: The layer on which the images will be drawn.
     *         On the Canvas object, this is called the priority. Default: 0.
     *     - [Number] rotation: The rotation of the images in degrees. Default: 0.
     *     - [Number] alpha: The transparency of the images on a scale from
     *         0 (invisible) to 1 (no transparency). Default: 1.
     *     - [Number] pivotX: The pivot position on the x axis (used for rotation).
     *     - [Number] pivotY: The pivot position on the y axis (used for rotation).
     *     - [Number] shadowX: The shadow offset on the x axis. Default: 5.
     *     - [Number] shadowY: The shadow offset on the y axis. Default: 5.
     *     - [Number] shadowBlur: The radius for the blur effect of the 
     *         shadow in pixels. Default: 5.
     *     - [String] shadowColor: CSS color of the shadow.
     *     - [Boolean] hasShadow: Display a shadow? Default: false.
     */
    out.canvas.ImagePack = function (canvas, args)
    {
        args = args || {};
        
        out.canvas.Object.call(this, canvas, args);

        if (!(this instanceof out.canvas.ImagePack))
        {
            return new out.canvas.ImagePack(canvas, args);
        }

        this.images = {};
        this.current = null;
        this.shadowX = args.shadowX || 5;
        this.shadowY = args.shadowY || 5;
        this.shadowBlur = args.shadowBlur || 5;
        this.shadowColor = args.shadowColor || "rgba(0, 0, 0, 0.5)";
        this.hasShadow = args.hasShadow || false;
        this.updated = true;
    };

    out.canvas.ImagePack.prototype = new out.canvas.Object();

    /**
     * Drawing callback function for ImagePack objects.
     * WARNING: Only to be used by library developers.
     * @param Object env An object containing information about the canvas.
     */
    out.canvas.ImagePack.prototype.draw = function ()
    {
        var self = this,
            ct = self.canvas.ct,
            x = self.x,
            y = self.y,
            rotation = self.rotation,
            pivotX = self.pivotX,
            pivotY = self.pivotY;
            
        if (self.current === null)
        {
            throw new Error("You need to use set() before this method!");
        }
        
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
        
        ct.drawImage(self.current, ((0.5 + x) | 0), ((0.5 + y) | 0));
        ct.restore();
    };

    /**
     * Adds an image to the ImagePack.
     * @param String name The name to identify the image.
     * @param String source The source URL of the image.
     */
    out.canvas.ImagePack.prototype.addImage = function (name, source)
    {
        var img = new Image();
        
        img.src = source;
        this.images[name] = img;
    };

    /**
     * Removes an image from the ImagePack.
     * @param String name The name of the image specified in the addImage
     *     function.
     */
    out.canvas.ImagePack.prototype.removeImage = function (name)
    {
        delete this.images[name];
    };

    /**
     * Sets the current image of the ImagePack. Only this image will be shown.
     * @param String name The image's name specified on addImage().
     */
    out.canvas.ImagePack.prototype.set = function (name)
    {
        if (typeof this.images[name] === 'undefined')
        {
            throw new Error("This ImagePack doesn't have such an image.");
        }
        
        this.current = this.images[name];
        this.width = this.current.width;
        this.height = this.current.height;
        this.pivotX = this.x + (this.width / 2);
        this.pivotY = this.y + (this.height / 2);
    };

    /**
     * Creates an MO5.Animation object to cycle through the images 
     * of the ImagePack.
     * 
     * @param Object args Object with optional arguments.
     *     Properties:
     *     - [Number] duration: The length of the cycle in milliseconds. 
     *         Default: 1000.
     *     - [Array] names: Array containing the names of the images to be
     *         used for the animation. The images will be shown in the order
     *         in which they are found in the array.
     *         If you do not provide this parameter, all images will be cycled
     *         through in no specific order. That means if the order of the images
     *         is relevant for the animation (and it will be in most cases)
     *         you should probably use this property.
     * @return MO5.Animation An animation object to start, stop or loop 
     *     the animation.
     */
    out.canvas.ImagePack.prototype.animate = function (args)
    {
        args = args || {};
        
        var names = args.names || null,
            cbs = [],
            images,
            duration = args.duration || 1000,
            self = this,
            len,
            i,
            key,
            imageArr = [];
        
        if (names === null)
        {
            images = this.images;
        }
        else
        {
            for (i = 0, len = names.length; i > len; ++i)
            {
                if (typeof this.images[names[i]] === "undefined")
                {
                    throw new Error("No such image in this ImagePack.");
                }
                
                images[names[i]] = this.images[names[i]];
            }
        }
        
        for (key in images)
        {
            if (images.hasOwnProperty(key))
            {
                imageArr.push(images[key]);
            }
        }
        
        cbs.push(
            function ()
            {
                var t0 = out.transform(
                    function (v)
                    {
                        v = (0.5 + v) | 0;
                        
                        if (typeof imageArr[v] === "undefined" || imageArr[v] === null)
                        {
                            console.log("No such image: " + v);
                            
                            return;
                        }
                        
                        self.current = imageArr[v];
                    },
                    0,
                    imageArr.length - 1,
                    {
                        duration: duration,
                        easing: out.easing.linear
                    }
                );
                
                return new out.TimerWatcher().addTimer(t0);
            }
        );
        
        return new out.Animation(cbs);
    };

}(MO5));