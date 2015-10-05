/*/////////////////////////////////////////////////////////////////////////////////

 MO5.js - Modular JavaScript. Batteries included.

 Copyright (c) 2015 Jonathan Steinbeck
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

/* global using, window, require, process, document, console */

if (typeof window !== "undefined") {
    // If the browser doesn't support requestAnimationFrame, use a fallback.
    window.requestAnimationFrame = (function ()
    {
        "use strict";
     
        return window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            window.oRequestAnimationFrame || 
            window.msRequestAnimationFrame || 
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());
}

// [].forEach() shim
(function () {
    
    if (Array.prototype.forEach) {
        return;
    }
    
    Array.prototype.forEach = function (callback) {
        for (var i = 0, len = this.length; i < len; i += 1) {
            callback(this[i], i, this);
        }
    };
    
}());

// [].indexOf() shim
(function () {
    
    if (Array.prototype.indexOf) {
        return;
    }
    
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        
        var k;
        
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }
        
        var O = Object(this);
        
        var len = O.length >>> 0;
        
        if (len === 0) {
            return -1;
        }
        
        var n = +fromIndex || 0;
        
        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        
        if (n >= len) {
            return -1;
        }
        
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        
        while (k < len) {
            
            if (k in O && O[k] === searchElement) {
                return k;
            }
            
            k++;
        }
        
        return -1;
    };
    
}());


if (typeof console === "undefined") {
    this.console = {};
}

if (!console.log) {
    console.log = function () {};
}

if (!console.dir) {
    console.dir = console.log;
}

if (!console.error) {
    console.error = console.log;
}

if (!console.warn) {
    console.warn = console.log;
}


(function () {
    
    var scripts = document.getElementsByTagName("script");
    var path = scripts[scripts.length - 1].src.replace(/MO5\.js$/, "");
    
    using.modules = {
        "MO5.ajax": path + "ajax.js",
        "MO5.assert": path + "assert.js",
        "MO5.Exception": path + "Exception.js",
        "MO5.fail": path + "fail.js",
        "MO5.EventBus": path + "EventBus.js",
        "MO5.CoreObject": path + "CoreObject.js",
        "MO5.List": path + "List.js",
        "MO5.Queue": path + "Queue.js",
        "MO5.Map": path + "Map.js",
        "MO5.Set": path + "Set.js",
        "MO5.Result": path + "Result.js", // deprecated - use MO5.Promise instead!
        "MO5.Promise": path + "Promise.js",
        "MO5.Timer": path + "Timer.js",
        "MO5.TimerWatcher": path + "TimerWatcher.js",
        "MO5.easing": path + "easing.js",
        "MO5.transform": path + "transform.js",
        "MO5.range": path + "range.js",
        "MO5.tools": path + "tools.js",
        "MO5.Point": path + "Point.js",
        "MO5.Size": path + "Size.js",
        "MO5.Animation": path + "Animation.js",
        "MO5.dom.effects.typewriter": path + "dom.effects.typewriter.js",
        "MO5.dom.Element": path + "dom.Element.js",
        "MO5.dom.escape": path + "dom.escape.js",
        "MO5.globals.document": path + "globals.document.js",
        "MO5.globals.window": path + "globals.window.js",
        "MO5.types": path + "types.js"
    };
}());
