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

/* global using, document, console */

using("MO5.CoreObject", "MO5.transform", "MO5.TimerWatcher", "MO5.dom.effects.typewriter",
        "MO5.types", "MO5.Point", "MO5.Size").
define("MO5.dom.Element", function (CoreObject, transform, TimerWatcher,
        typewriter, types, Point, Size) {
    
    function Element (args) {
        
        var self = this;
        
        args = args || {};
        
        CoreObject.call(this);

        this.parent = args.parent || document.body;
        this.nodeType = args.nodeType || "div";
        this.element = args.element || document.createElement(this.nodeType);
        
        wrapElement(this, this.element);
        
        Element.propertiesToExclude.forEach(function (property) {
            delete self[property];
        });
    }
    
    // Properties that should not shadow the DOM element's properties.
    // If you want to add a method with the same name as a DOM element's
    // property to the prototype, you need to add the method's name to this array.
    Element.propertiesToExclude = [
        "appendChild",
        "removeChild"
    ];
    
    /**
     * Creates an Element instance for a DOMElement.
     */
    Element.fromDomElement = function (domElement) {
        return new Element({element: domElement, nodeType: domElement.nodeName});
    };
    
    Element.prototype = new CoreObject();
    Element.prototype.constructor = Element;
    
    Element.prototype.appendTo = function (element) {
        return element.appendChild(this.element);
    };
    
    Element.prototype.remove = function () {
        return this.element.parentNode.removeChild(this.element);
    };
    
    Element.prototype.appendChild = function (child) {
        var node = child instanceof Element ? child.element : child;
        return this.element.appendChild(node);
    };
    
    /**
     * Adds a child element as the first child of this element.
     */
    Element.prototype.addAsFirstChild = function (child) {
        
        var node = child instanceof Element ? child.element : child;
        
        return this.element.childElementCount > 0 ?
            this.element.insertBefore(node, this.element.childNodes[0]) :
            this.element.appendChild(node);
    };

    Element.prototype.fadeIn = function (args) {
        
        args = args || {};
        
        var element = this.element;
        
        if (this._lastFadeTimer && this._lastFadeTimer.isRunning()) {
            this._lastFadeTimer.cancel();
        }
        
        this.show();
        
        this._lastFadeTimer = transform(
            function (v) {
                element.style.opacity = v;
            },
            parseInt(element.style.opacity, 10) || 0,
            1,
            args
        );
        
        return this._lastFadeTimer;
    };

    Element.prototype.fadeOut = function (args) {
        
        args = args || {};
        
        var element = this.element;
        
        if (this._lastFadeTimer && this._lastFadeTimer.isRunning()) {
            this._lastFadeTimer.cancel();
        }
        
        this._lastFadeTimer = transform(
            function (v) {
                element.style.opacity = v;
            },
            parseInt(element.style.opacity, 10) || 1,
            0,
            args
        );
        
        this._lastFadeTimer.once("stopped", this.hide.bind(this));
        
        return this._lastFadeTimer;
    };
    
    Element.prototype.opacity = function (value) {
        
        if (typeof value === "number") {
            this.element.style.opacity = value;
        }
        
        return this.element.style.opacity;
    };
    
    Element.prototype.position = function (point) {
        
        var element = this.element, rect = {}, scrollLeft, scrollTop;
        
        if (types.isObject(point)) {
            element.style.left = "" + (+point.x) + "px";
            element.style.top = "" + (+point.y) + "px";
        }
        
        rect.left = element.offsetLeft;
        rect.top = element.offsetTop;
        
        if (element.getBoundingClientRect) {
            rect = element.getBoundingClientRect();
        }
        
        scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        
        return new Point(scrollLeft + rect.left, scrollTop + rect.top);
        
    };
    
    Element.prototype.size = function (size) {
        
        if (types.isObject(size)) {
            this.element.style.width = "" + size.width + "px";
            this.element.style.height = "" + size.height + "px";
        }
        
        return new Size(this.element.offsetWidth, this.element.offsetHeight);
    };
    
    Element.prototype.width = function (width) {
        
        if (types.isNumber(width)) {
            this.element.style.width = "" + width + "px";
        }
        
        return this.element.offsetWidth;
    };
    
    Element.prototype.height = function (height) {
        
        if (types.isNumber(height)) {
            this.element.style.height = "" + height + "px";
        }
        
        return this.element.offsetHeight;
    };

    Element.prototype.moveTo = function (x, y, args) {
        
        args = args || {};
        
        var element = this.element,
            ox = element.offsetLeft,
            oy = element.offsetTop,
            t0, t1;
            
        t0 = transform(
            function (v) {
                element.style.left = v + "px";
            },
            ox,
            x,
            args
        );
        
        t1 = transform(
            function (v) {
                element.style.top = v + "px";
            },
            oy,
            y,
            args
        );
        
        return new TimerWatcher().addTimer(t0).addTimer(t1);
    };

    Element.prototype.move = function (x, y, args) {
        
        args = args || {};
        
        var element = this.element,
            dx = element.offsetLeft + x,
            dy = element.offsetTop + y;
        
        return this.moveTo(dx, dy, args);
    };

    Element.prototype.display = function () {
        this.element.style.visibility = "";
    };
    
    Element.prototype.show = Element.prototype.display;

    Element.prototype.hide = function () {
        this.element.style.visibility = "hidden";
    };
    
    Element.prototype.typewriter = function (args) {
        args = args || {};
        typewriter(this.element, args);
    };
    
    Element.prototype.addCssClass = function (classToAdd) {
        
        var classes;
        
        if (this.element.classList) {
            this.element.classList.add(classToAdd);
            return this;
        }
        
        classes = this.getCssClasses();
        
        if (!contains(classes, classToAdd)) {
            classes.push(classToAdd);
            this.element.setAttribute("class", classes.join(" "));
        }
        
        return this;
    };
    
    Element.prototype.removeCssClass = function (classToRemove) {
        
        var classes;
        
        if (this.element.classList) {
            this.element.classList.remove(classToRemove);
        }
        
        classes = this.getCssClasses();
        
        if (contains(classes, classToRemove)) {
            this.element.setAttribute("class", classes.filter(function (item) {
                return item !== classToRemove;
            }).join(" "));
        }
        
        return this;
    };
    
    Element.prototype.getCssClasses = function () {
        return (this.element.getAttribute("class") || "").split(" ");
    };
    
    Element.prototype.hasCssClass = function (classToCheckFor) {
        return this.element.classList ?
            this.element.classList.contains(classToCheckFor) :
            contains(this.getCssClasses(), classToCheckFor);
    };
    
    Element.prototype.clearCssClasses = function () {
        this.element.setAttribute("class", "");
        return this;
    };
    
    Element.prototype.setCssId = function (cssId) {
        this.element.setAttribute("id", cssId);
        return this;
    };
    
    Element.prototype.destroy = function () {
        
        try {
            this.element.parentNode.removeChild(this.element);
        }
        catch (e) {
            console.log(e);
        }
        
        CoreObject.prototype.destroy.call(this);
    };
    
    ////////////////////////////////////////
    // dom.Element helper functions
    ////////////////////////////////////////
    
    function wrapElement (element, domElement) {
        for (var key in domElement) {
            (function (currentProperty, key) {
                
                if (key === "id") {
                    return;
                }
                
                if (typeof currentProperty === "function") {
                    element[key] = function () {
                        return domElement[key].apply(domElement, arguments);
                    };
                }
                else {
                    element[key] = function (content) {
                        
                        if (arguments.length) {
                            domElement[key] = content;
                            return element;
                        }
                        
                        return domElement[key];
                    };
                }
            }(domElement[key], key));
        }
    }
    
    function contains (array, item) {
        return array.indexOf(item) !== -1;
    }
    
    return Element;

});