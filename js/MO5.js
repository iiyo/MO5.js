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
    
    var modules = {}, loadedScripts = {};
    
    /**
     * Inner class representing a Module with a state and dependencies.
     * There can be only one module with a specific name. If another one
     * with the same name is created, the existing one is returned instead.
     */
    function Module (name, callback, dependencies) {
        
        if (Module.moduleIsReady(name)) {
            return modules[name];
        }
        
        /** @var The module's name. */
        this.name = name;
        
        /**
         * @var A callback that genererates the module's contents after
         * all dependencies are ready.
         */
        this.callback = callback;
        
        /** @var Names of modules this module depends on. */
        this.dependencies = dependencies || [];
        
        /** @var The current state of the module. Should be one of the "class constants". */
        this.state = Module.STATE_UNINITIALIZED;
        
        /** @var A List of callbacks to be executed once the module's state is STATE_READY. */
        this.observers = [];
        
        /** @var The module's content. Only available when the module's state is STATE_READY. */
        this.content = undefined;
        
        modules[name] = this;
    }
    
    /** @var State when the loading of the module has not been started yet. */
    Module.STATE_UNINITIALIZED = "unitialized";
    Module.STATE_READY = "ready";
    
    /**
     * Is the module specified by the moduleName parameter ready to be used?
     */
    Module.moduleIsReady = function (moduleName) {
        
        if (!(moduleName in modules)) {
            return false;
        }
        
        return typeof modules[moduleName].isReady === "undefined" || 
            modules[moduleName].isReady();
    };
    
    /**
     * Are the modules in the moduleNames parameter ready to be used?
     * @param moduleNames Array of module names.
     */
    Module.modulesAreReady = function (moduleNames) {
        
        var i, len;
        
        for (i = 0, len = moduleNames.length; i < len; i += 1) {
            if (!Module.moduleIsReady(moduleNames[i])) {
                return false;
            }
        }
        
        return true;
    };
    
    /**
     * Gather the contents of all the modules specified in parameter moduleNames.
     * @moduleNames An array with module names.
     */
    Module.gatherDependencies = function (moduleNames) {
    
        var dependencies = [];
        
        moduleNames.forEach(function (moduleName) {
            if (modules[moduleName] && typeof modules[moduleName].content === "undefined") {
                dependencies.push(modules[moduleName]);
            }
            else {
                dependencies.push(modules[moduleName].content);
            }
        });
        
        return dependencies;
    
    };
    
    /**
     * Is this module ready to be used?
     */
    Module.prototype.isReady = function () {
        return (this.state === Module.STATE_READY);
    };
    
    /**
     * Are the dependencies loaded yet?
     */
    Module.prototype.dependenciesReady = function () {
        return Module.modulesAreReady(this.dependencies);
    };
    
    Module.prototype.getDependenciesNotReady = function () {
        
        var dependenciesNotReady = [];
        
        this.dependencies.forEach(function (moduleName) {
            if (modules[moduleName] && !modules[moduleName].isReady()) {
                dependenciesNotReady.push(modules[moduleName]);
            }
        });
        
        return dependenciesNotReady;
    };
    
    Module.prototype.addObserverToDependenciesNotReady = function (callback) {
        this.getDependenciesNotReady().forEach(function (module) {
            module.addObserver(callback);
        });
    };
    
    /**
     * Registers an observer callback with this module which will be called
     * when the module is ready. If the module already is ready, the observer
     * will be called immediately.
     */
    Module.prototype.addObserver = function (observer) {
        
        if (this.isReady()) {
            observer(this.content);
            return;
        }
        
        this.observers.push(observer);
    };
    
    /**
     * Marks this module as ready and calls all observers.
     */
    Module.prototype.finish = function () {
        
        var dependencies = [], content, self = this;
        
        if (this.isReady()) {
            return;
        }
        
        if (!this.dependenciesReady()) {
            this.addObserverToDependenciesNotReady(function () { self.finish(); });
            return;
        }
        
        dependencies = Module.gatherDependencies(this.dependencies);
        content = this.callback.apply(undefined, dependencies);
        
        if (typeof content === "undefined") {
            throw new Error("Module definition callback returned undefined!");
        }
        
        this.content = content;
        this.state = Module.STATE_READY;
        
        this.observers.forEach(function (observer) {
            observer(content);
        });
        
        this.observers = []; // remove references to aid the garbage collector
    };
    
    function MO5 (/* module names */) {
        
        var moduleNames, runCallbacks = [], defineCallbacks = [], dependencies = [];
        var modulesLoaded = 0, done = false, modulesLoading = false, capabilityObject;
        
        moduleNames = [].slice.call(arguments);
        
        capabilityObject = {
            run: run,
            define: define
        };
        
        return capabilityObject;
        
        ///////////////////////////////////
        // Helper functions
        ///////////////////////////////////
        
        function loadModules () {
            
            var moduleOffset = 0;
            
            modulesLoading = true;
            
            moduleNames.forEach(function (moduleName) {
                
                var currentOffset = moduleOffset;
                
                moduleOffset += 1;
            
                if (moduleName.match(/^ajax:/)) {
                    MO5.ajax(MO5.ajax.HTTP_METHOD_GET, moduleName.replace(/^ajax:/, ""),
                        null, ajaxResourceSuccessFn, ajaxResourceSuccessFn);
                }
                else {
                    loadModule(moduleName, loadModuleSuccessFn, function (e) {
                        console.error(e);
                    });
                }
                
                function ajaxResourceSuccessFn (request) {
                    modules[moduleName] = request;
                    loadModuleSuccessFn(request);
                }
                
                function loadModuleSuccessFn (module) {
                    
                    modulesLoaded += 1;
                    
                    dependencies[currentOffset] = module;
                    
                    if (modulesLoaded === moduleNames.length) {
                        
                        done = true;
                        
                        defineCallbacks.forEach(function (callback) {
                            try {
                                callback();
                            }
                            catch (e) {
                                console.error("Error while loading module '" + moduleName +
                                    "':", e.stack, callback);
                            }
                        });
                        
                        runCallbacks.forEach(function (callback) {
                            try {
                                callback.apply(undefined, dependencies);
                            }
                            catch (e) {
                                console.error(e.message, e.stack);
                                console.dir(callback);
                            }
                        });
                    }
                }
            });
        }
        
        function run (callback) {
            
            if (done) {
                return callback.apply(undefined, dependencies);
            }
            
            runCallbacks.push(callback);
            
            if (!modulesLoading) {
                loadModules();
            }
            
            return capabilityObject;
        }
        
        function define (moduleName, callback) {
            
            var module = new Module(moduleName, callback, moduleNames);
            
            if (module.isReady()) {
                return capabilityObject;
            }
            
            if (done) {
                module.finish();
                return capabilityObject;
            }
            
            defineCallbacks.push(finishModule);
            
            if (!modulesLoading) {
                loadModules();
            }
            
            return capabilityObject;
            
            function finishModule () {
                module.finish();
            }
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
    
    function loadModule (moduleName, onSuccess, onError) {
        
        onError = onError || function (e) { console.error(e.message, e.stack); };
        
        if (!(moduleName in MO5.modules)) {
            onError(new Error("Unknown module '" + moduleName + "'."));
            return;
        }
        
        if (Module.moduleIsReady(moduleName)) {
            onScriptLoadSuccess();
        }
        else {
            MO5.loadScript(MO5.modules[moduleName], onScriptLoadSuccess, onError);
        }
        
        function onScriptLoadSuccess () {
            
            if (!modules[moduleName] || !modules[moduleName].addObserver) {
                throw new Error("MO5: No module definition for module '" + moduleName +
                    "' found in specified source file '" + MO5.modules[moduleName] + "'.");
            }
            
            modules[moduleName].addObserver(onSuccess);
            
            if (modules[moduleName].dependenciesReady()) {
                modules[moduleName].finish();
            }
        }
        
    }
    
    MO5.loadScript = function (url, onSuccess, onError) {
        
        var script = document.createElement("script");
        
        if (loadedScripts[url]) {
            onSuccess();
            return;
        }
        
        try {
            script.onload = onload;
            script.onreadystatechange = onload;
            script.src = url;
            document.body.appendChild(script);
        }
        catch (e) {
            onError(e);
        }
            
        function onload () {
            if (!script.readyState || script.readyState === "loaded" || script.readyState === "complete") {
                loadedScripts[url] = true;
                onSuccess();
            }
        }
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