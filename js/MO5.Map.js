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
    
    var prefix = "MO5Map";
    
    function makeKey (k) {
        return prefix + k;
    }
    
    function revokeKey (k) {
        return k.replace(new RegExp(prefix), "");
    }
    
    out.Map = function () {
        
        out.Object.call(this);
        
        this.items = {};
        this.unsubscribers = {};
        this.count = 0;
    };
    
    out.Map.prototype = new out.Object();
    
    out.Map.prototype.length = function () {
        return this.count;
    };
    
    out.Map.prototype.set = function (k, value) {
        
        var self = this, whenDestroyed, key = makeKey(k), whenKeyDestroyed;
        
        function whenDestroyed () {
            delete self.items[key];
            self.count -= 1;
        }
            
        if (!k) {
            throw new out.Error("MO5.Map keys cannot be falsy.");
        }
        
        if (this.has(key)) {
            this.remove(key);
        }
        
        if (value && value instanceof out.Object) {
            
            if (value.destroyed) {
                throw new out.Error("Trying to add an MO5.Object that has " +
                    "already been destroyed.");
            }
            
            value.subscribe(whenDestroyed, "destroyed");
        }
        
        if (k instanceof out.Object) {
            
            if (k.destroyed) {
                throw new out.Error("Trying to use an MO5.Object as key that " +
                    "has already been destroyed.");
            }
            
            k.subscribe(whenDestroyed, "destroyed");
            
        }
        
        if (value && value instanceof out.Object || k instanceof out.Object) {
            
            this.unsubscribers[key] = function () {
                
                if (value instanceof out.Object) {
                    value.unsubscribe(whenDestroyed, "destroyed");
                }
                
                if (k instanceof out.Object) {
                    k.unsubscribe(whenDestroyed, "destroyed");
                }
            };
        }
        
        this.items[key] = value;
        this.count += 1;
        
        this.trigger("updated", null, false);
        this.trigger("set", key, false);
        
        return this;
    };
    
    out.Map.prototype.get = function (k) {
        
        var key = makeKey(k);
        
        if (!this.items.hasOwnProperty(key)) {
            return undefined;
        }
        
        return this.items[key];
    };
    
    out.Map.prototype.remove = function (k) {
        
        var key = makeKey(k);
        
        if (!this.has(key)) {
            throw new out.Error("Trying to remove an unknown key from an MO5.Map.");
        }
        
        if (this.unsubscribers.hasOwnProperty(key)) {
            this.unsubscribers[key]();
            delete this.unsubscribers[key];
        }
        
        delete this.items[key];
        this.count -= 1;
        
        this.trigger("updated", null, false);
        this.trigger("removed", key, false);
        
        return this;
    };
    
    out.Map.prototype.has = function (k) {
        
        var key = makeKey(k);
        
        return this.items.hasOwnProperty(key);
    };
    
    out.Map.prototype.destroy = function () {
        
        for (var key in this.unsubscribers) {
            this.unsubscribers[key]();
            delete this.unsubscribers[key];
        }
        
        out.Object.prototype.destroy.call(this);
    };
    
    out.Map.prototype.forEach = function (fn) {
        
        if (!fn || typeof fn !== "function") {
            throw new out.Error("Parameter 1 is expected to be of type function.");
        }
        
        for (var key in this.items) {
            fn(this.items[key], revokeKey(key), this);
        }
        
        return this;
    };
    
    out.Map.prototype.keys = function () {
        
        var keys = [];
        
        this.forEach(function (item, key) {
            keys.push(revokeKey(key));
        });
        
        return keys;
    };
    
    out.Map.prototype.clone = function () {
        var clone = new out.Map();
        
        this.forEach(function (item, key) {
            clone.set(revokeKey(key), item);
        });
        
        return clone;
    };
    
}(MO5));