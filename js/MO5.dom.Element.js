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