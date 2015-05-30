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

/* global window, require, process, document, console */

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


var MO5 = (function () {
    
    "use strict";
    
    var modules = {}, loadedScripts = {}, dependencies = {}, definitions = {}, dependingOn = {};
    var runners = [];
    
    function updateModule (moduleName) {
        
        var deps = [], depNames = dependencies[moduleName], moduleResult;
        
        if (depNames.length === 0) {
            
            moduleResult = definitions[moduleName]();
            
            if (!moduleResult) {
                console.error("Module '" + moduleName + "' returned nothing");
            }
            
            modules[moduleName] = moduleResult;
            
            dependingOn[moduleName].forEach(updateModule);
        }
        else if (allModulesLoaded(depNames)) {
            
            depNames.forEach(function (name) {
                deps.push(modules[name]);
            });
            
            moduleResult = definitions[moduleName].apply(undefined, deps);
            
            if (!moduleResult) {
                console.error("Module '" + moduleName + "' returned nothing.");
            }
            
            modules[moduleName] = moduleResult;
            
            dependingOn[moduleName].forEach(updateModule);
        }
        
        runners.forEach(function (runner) {
            runner();
        });
    }
    
    function allModulesLoaded (moduleNames) {
        
        var loaded = true;
        
        moduleNames.forEach(function (name) {
            if (!modules[name]) {
                loaded = false;
            }
        });
        
        return loaded;
    }
    
    function MO5 (/* module names */) {
        
        var moduleNames, capabilityObject;
        
        moduleNames = [].slice.call(arguments);
        
        moduleNames.forEach(function (moduleName) {
            
            if (!(moduleName in dependencies) && !(moduleName in modules)) {
                
                dependencies[moduleName] = [];
                
                if (!dependingOn[moduleName]) {
                    dependingOn[moduleName] = [];
                }
                
                if (moduleName.match(/^ajax:/)) {
                    MO5.ajax(MO5.ajax.HTTP_METHOD_GET, moduleName.replace(/^ajax:/, ""),
                        null, ajaxResourceSuccessFn, ajaxResourceSuccessFn);
                }
                else {
                    loadModule(moduleName);
                }
            }
            
            function ajaxResourceSuccessFn (request) {
                modules[moduleName] = request;
                dependingOn[moduleName].forEach(updateModule);
            }
        });
        
        capabilityObject = {
            run: run,
            define: define
        };
        
        return capabilityObject;
        
        ///////////////////////////////////
        // Helper functions
        ///////////////////////////////////
        
        function run (callback) {
            
            if (!runner(true)) {
                runners.push(runner);
            }
            
            return capabilityObject;
            
            function runner (doNotRemove) {
                
                var deps = [];
                
                if (allModulesLoaded(moduleNames)) {
                    
                    moduleNames.forEach(function (name) {
                        deps.push(modules[name]);
                    });
                    
                    callback.apply(undefined, deps);
                    
                    if (!doNotRemove) {
                        runners.splice(runners.indexOf(runner), 1);
                    }
                    
                    return true;
                }
                
                return false;
            }
        }
        
        function define (moduleName, callback) {
            
            if (moduleName in definitions) {
                throw new Error("Module '" + moduleName + "' is already defined.");
            }
            
            definitions[moduleName] = callback;
            dependencies[moduleName] = moduleNames;
            
            if (!dependingOn[moduleName]) {
                dependingOn[moduleName] = [];
            }
            
            moduleNames.forEach(function (name) {
                
                if (!dependingOn[name]) {
                    dependingOn[name] = [];
                }
                
                dependingOn[name].push(moduleName);
            });
            
            updateModule(moduleName);
            
            return capabilityObject;
            
        }
    }
    
    MO5.path = "";
    
    (function () {
        
        var scripts = document.getElementsByTagName("script");
        
        MO5.path = scripts[scripts.length - 1].src.replace(/MO5\.js$/, "");
        
    }());
    
    MO5.modules = {
        "MO5.ajax": MO5.path + "ajax.js",
        "MO5.assert": MO5.path + "assert.js",
        "MO5.Exception": MO5.path + "Exception.js",
        "MO5.fail": MO5.path + "fail.js",
        "MO5.EventBus": MO5.path + "EventBus.js",
        "MO5.CoreObject": MO5.path + "CoreObject.js",
        "MO5.List": MO5.path + "List.js",
        "MO5.Queue": MO5.path + "Queue.js",
        "MO5.Map": MO5.path + "Map.js",
        "MO5.Set": MO5.path + "Set.js",
        "MO5.Result": MO5.path + "Result.js", // deprecated - use MO5.Promise instead!
        "MO5.Promise": MO5.path + "Promise.js",
        "MO5.Timer": MO5.path + "Timer.js",
        "MO5.TimerWatcher": MO5.path + "TimerWatcher.js",
        "MO5.easing": MO5.path + "easing.js",
        "MO5.transform": MO5.path + "transform.js",
        "MO5.range": MO5.path + "range.js",
        "MO5.tools": MO5.path + "tools.js",
        "MO5.Point": MO5.path + "Point.js",
        "MO5.Size": MO5.path + "Size.js",
        "MO5.Animation": MO5.path + "Animation.js",
        "MO5.dom.effects.typewriter": MO5.path + "dom.effects.typewriter.js",
        "MO5.dom.Element": MO5.path + "dom.Element.js",
        "MO5.dom.escape": MO5.path + "dom.escape.js",
        "MO5.globals.document": MO5.path + "globals.document.js",
        "MO5.globals.window": MO5.path + "globals.window.js",
        "MO5.types": MO5.path + "types.js"
    };
    
    function loadModule (moduleName) {
        
        if (!(moduleName in MO5.modules)) {
            throw new Error("Unknown module '" + moduleName + "'.");
        }
        
        MO5.loadScript(MO5.modules[moduleName]);
    }
    
    MO5.loadScript = function (url) {
        
        var script = document.createElement("script");
        var scriptId = "MO5_script_" + url;
        
        if (loadedScripts[url] || document.getElementById(scriptId)) {
            return;
        }
        
        script.setAttribute("id", scriptId);
        
        script.src = url;
        
        document.body.appendChild(script);
    };
    
    MO5.defaults = {
        fps: 30,
        debug: true,
        canvas: {
            width: 640, // default width for canvas elements
            height: 480 // default height for canvas elements
        }
    };
    
    return MO5;
    
}());

/* global MO5, XMLHttpRequest, ActiveXObject */

MO5.ajax = (function () {
    
    var HTTP_STATUS_OK = 200;
    var READY_STATE_UNSENT = 0;
    var READY_STATE_OPENED = 1;
    var READY_STATE_HEADERS_RECEIVED = 2;
    var READY_STATE_LOADING = 3;
    var READY_STATE_DONE = 4;
    
    function ajax (method, url, data, onSuccess, onError, timeout) {
        
        var requestObject = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        
        requestObject.open(method, url + "?random=" + Math.random(), true);
        
        if (timeout) {
            
            requestObject.timeout = timeout;
            
            requestObject.ontimeout = function () {
                
                requestObject.abort();
                
                if (!onError) {
                    return;
                }
                
                onError(new Error("Connection has reached the timeout of " + timeout + " ms."));
            };
        }
        
        requestObject.onreadystatechange = function() {
            
            var done, statusOk;
            
            done = requestObject.readyState === READY_STATE_DONE;
            
            if (done) {
                
                try {
                    statusOk = requestObject.status === HTTP_STATUS_OK;
                }
                catch (error) {
                    console.error(error);
                    statusOk = false;
                }
                
                if (statusOk) {
                    onSuccess(requestObject);
                }
                else {
                    onError(requestObject);
                }
            }
        };
        
        if (data) {
            requestObject.send(data);
        }
        else {
            requestObject.send();
        }
        
        return requestObject;
    }
    
    ajax.HTTP_STATUS_OK = HTTP_STATUS_OK;
    
    ajax.READY_STATE_UNSENT = READY_STATE_UNSENT;
    ajax.READY_STATE_OPENED = READY_STATE_OPENED;
    ajax.READY_STATE_HEADERS_RECEIVED = READY_STATE_HEADERS_RECEIVED;
    ajax.READY_STATE_LOADING = READY_STATE_LOADING;
    ajax.READY_STATE_DONE = READY_STATE_DONE;
    
    ajax.HTTP_METHOD_GET = "GET";
    ajax.HTTP_METHOD_POST = "POST";
    ajax.HTTP_METHOD_PUT = "PUT";
    ajax.HTTP_METHOD_DELETE = "DELETE";
    ajax.HTTP_METHOD_HEAD = "HEAD";
    
    return ajax;
}());