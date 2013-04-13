(function (out) {
    
    out.dom = out.dom || {};
    
    out.dom.Element = function (args) {
        
        var element;
        
        args = args || {};
        
        out.Object.call(this);

        this.parent = args.parent || document.body;
        this.nodeType = args.nodeType || "div";
        this.element = args.element || document.createElement(this.nodeType);
    };
    
    out.dom.Element.prototype = new out.Object();
    out.dom.Element.prototype.constructor = out.dom.Element;

    out.dom.Element.prototype.fadeIn = function (args) {
        
        args = args || {};
        
        var element = this.element;
        
        return out.transform(
            function (v) {
                element.style.opacity = v;
            },
            0,
            1,
            args
        );
    };

    out.dom.Element.prototype.fadeOut = function (args) {
        
        args = args || {};
        
        var element = this.element;
        
        return out.transform(
            function (v) {
                element.style.opacity = v;
            },
            1,
            0,
            args
        );
    };

    out.dom.Element.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var element = this.element,
            ox = element.offsetLeft,
            oy = element.offsetTop,
            t0, t1;
            
        t0 = out.transform(
            function (v) {
                element.style.left = v + "px";
            },
            ox,
            x,
            args
        );
        
        t1 = out.transform(
            function (v) {
                element.style.top = v + "px";
            },
            oy,
            y,
            args
        );
        
        return new out.TimerWatcher().addTimer(t0).addTimer(t1);
    };

    out.dom.Element.prototype.move = function (x, y, args) {
        
        args = args || {};
        
        var element = this.element,
            dx = element.offsetLeft + x,
            dy = element.offsetTop + y;
        
        return this.moveTo(dx, dy, args);
    };

    out.dom.Element.prototype.display = function () {
        
        var parent;
        
        try {
            parent = this.parent || document.body;
            parent.appendChild(this.element);
        }
        catch (e) {}
    };

    out.dom.Element.prototype.hide = function () {
        
        var parent;
        
        try {
            parent = this.parent || document.body;
            parent.removeChild(this.element);
        }
        catch (e) {}
    };
    
    out.dom.Element.prototype.typewriter = function (args) {
        args = args || {};
        out.dom.effects.typewriter(this.element, args);
    };
    
    out.dom.Element.prototype.destroy = function () {
        try {
            this.element.parentNode.removeChild(this.element);
        }
        catch (e) {
            console.log(e);
        }
        
        this.element = null;
        
        this.destroyed = true;
        this.trigger("destroyed", null, false);
        
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
        
        this.destroyed = true;
    };

}(MO5));