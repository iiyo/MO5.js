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
    
    var propertyTable = {}, prefix = "MO5Object";
    
    function makeKey (key) {
        return prefix + key;
    }
    
    function revokeKey (key) {
        return key.replace(new RegExp(prefix), "");
    }
    
    /**
     * The MO5 base type for almost all other types used in MO5.
     * 
     * All MO5.Object instances are observable by subscribing
     * to the events that it emits. Please see the documentation
     * of the Squiddle.js library for more details on this.
     * 
     * @event destroyed()
     */
    out.Object = function (args) {
        
        args = args || {};
        args.bus = args.bus || {};
        
        this.id = out.tools.getUniqueId();
        this.destroyed = false;
        
        Squiddle.inject(this, args.bus);
        
        propertyTable[this.id] = {};
    };
    
    out.Object.prototype.getProperty = function (key) {
        
        var k = makeKey(key);
        
        if (!propertyTable[this.id] 
        || !(propertyTable[this.id].hasOwnProperty(k))) {
            return;
        }
        
        return propertyTable[this.id][k];
    };
    
    out.Object.prototype.setProperty = function (key, value) {
        
        var k = makeKey(key);
        
        if (!propertyTable[this.id]) {
            return;
        }
        
        propertyTable[this.id][k] = value;
        
        this.trigger("propertyChange", {key: key, value: value});
    }
    
    out.Object.prototype.hasProperty = function (key) {
        
        var k = makeKey(key);
        
        return propertyTable[this.id] && 
            propertyTable[this.id].hasOwnProperty(k);
    }
    
    out.Object.prototype.getPropertyKeys = function () {
        var arr = [];
        
        for (var key in propertyTable[this.id]) {
            arr.push(revokeKey(key));
        }
        
        return arr;
    }
    
    out.Object.prototype.connect = function (event1, obj2, event2, async) {
        
        var self = this;
        
        event1 = event1 || "*";
        event2 = event2 || "*";
        
        if (!obj2 || !(obj2 instanceof out.Object)) {
            out.fail(new out.Error("Cannot connect events: Parameter 3 is expected to be of type MO5.Object."));
            return this;
        }
        
        function listener (data, info) {
            
            data = data || null;
            
            if (typeof async !== "undefined" && (async === true || async === false)) {
                obj2.trigger(event2, data, async);
            }
            else {
                obj2.trigger(event2, data);
            }
        }
        
        this.subscribe(listener, event1);
        
        obj2.once(function () { obj1.unsubscribe(listener, event1); }, "destroyed");
        
        return this;
    };
    
    /**
     * MO5.Object instances have a unique ID; when used as a string,
     * the ID of the object is used as a representation.
     */
    out.Object.prototype.toString = function () {
        return "" + this.id;
    };
    
    out.Object.prototype.valueOf = function () {
        return this.id;
    }
    
    /**
     * Emits the destroyed() event and deletes all of the instances properties.
     * After this method has been called on an MO5.Object, it can not be used
     * anymore and should be considered dead.
     * 
     * All users of an MO5.Object should hook to the destroyed() event and delete
     * their references to the MO5.Object when its destroyed() event is emitted.
     */
    out.Object.prototype.destroy = function () {
        
        var id = this.id;
        
        this.destroyed = true;
        this.trigger("destroyed", null, false);
        
        for (var key in this) {
            this[key] = null;
        }
        
        delete propertyTable[id];
        
        this.destroyed = true;
        this.id = id;
        
        delete this["toString"];
        delete this["valueOf"];
        
    };
    
}(MO5));