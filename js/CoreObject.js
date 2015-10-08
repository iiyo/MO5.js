/*/////////////////////////////////////////////////////////////////////////////////

 MO5.js - JavaScript Library For Building Modern DOM And Canvas Applications

 Copyright (c) 2013 - 2015 Jonathan Steinbeck
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

/* global using, MO5, window, module, require */

(function MO5CoreObjectBootstrap () {
    
    if (typeof using === "function") {
        using("MO5.Exception", "MO5.fail", "MO5.EventBus").
        define("MO5.CoreObject", MO5CoreObjectModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.CoreObject = MO5CoreObjectModule(MO5.Exception, MO5.fail, MO5.EventBus);
    }
    else {
        module.exports = MO5CoreObjectModule(
            require("./Exception.js"),
            require("./fail.js"),
            require("./EventBus.js")
        );
    }
    
    function MO5CoreObjectModule (Exception, fail, EventBus) {
        
        var flags = {}, prefix = "CoreObject", highestId = 0;
        
        /**
         * The MO5 base type for almost all other types used in MO5.
         *
         * All CoreObject instances are observable by subscribing
         * to the events that they emit.
         *
         * @type object -> CoreObject
         * @event flag_removed(name_of_flag) When the flag has been removed.
         * @event flag_set(name_of_flag) When the flag has been set.
         * @event destroyed()
         * @return CoreObject
         */
        function CoreObject (args) {
            
            args = args || {};
            args.bus = args.bus || {};
            
            highestId += 1;
            
            if (Object.defineProperty) {
                Object.defineProperty(this, "id", {
                    value: highestId,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            }
            else {
                this.id = highestId;
            }
            
            this.destroyed = false;
            
            EventBus.inject(this, args.bus);
            
            flags[this.id] = {};
            
            this.$children = [];
            this.$parent = null;
        }
        
        /**
         * Checks whether an object has an ID property.
         *
         * @type any -> boolean
         * @param obj The object to be checked.
         * @return boolean Is the argument an object and has an ID property?
         */
        CoreObject.hasId = function (obj) {
            return typeof obj === "object" && obj !== null && typeof obj.id === "number";
        };
        
        /**
         * Checks whether an object is an instance of CoreObject.
         *
         * @type any -> boolean
         * @param obj The object to check.
         * @return boolean Is the argument a CoreObject instance?
         */
        CoreObject.isCoreObject = function (obj) {
            return obj instanceof CoreObject;
        };
        
        CoreObject.prototype.addChild = function (child) {
            
            if (this.$children.indexOf(child) >= 0) {
                return;
            }
            
            child.$parent = this;
            
            this.$children.push(child);
        };
        
        CoreObject.prototype.removeChild = function (child) {
            
            var index = this.$children.indexOf(child);
            
            if (index < 0) {
                return;
            }
            
            child.$parent = null;
            
            this.$children.splice(index, 1);
        };
        
        CoreObject.prototype.hasChild = function (child) {
            return this.$children.indexOf(child) >= 0;
        };
        
        /**
         * Sets a flag on this object. Flags can be used to specify abilities of
         * a CoreObject. A flag has no value and can be in on of two
         * states - it can either exist or not exist.
         *
         * @type string -> CoreObject
         * @event flag_set(name_of_flag) When the flag has been set.
         * @param flag The name of the flag.
         * @return The CoreObject itself.
         */
        CoreObject.prototype.setFlag = function (flag) {
            
            var internalKey = externalKeyToInternalKey(flag);
            
            if (!flags[this.id]) {
                return;
            }
            
            flags[this.id][internalKey] = true;
            
            this.trigger("flag_set", flag);
            
            return this;
        };
        
        /**
         * Removes a flag from this object.
         *
         * @type string -> CoreObject
         * @event flag_removed(name_of_flag) When the flag has been removed.
         * @param flag The name of the flag.
         * @return The CoreObject itself.
         */
        CoreObject.prototype.removeFlag = function (flag) {
            
            if (!this.hasFlag(flag)) {
                return;
            }
            
            delete flags[this.id][externalKeyToInternalKey(flag)];
            
            this.trigger("flag_removed", flag);
            
            return this;
        };
        
        /**
         * Checks whether this object has a flag set.
         *
         * @type string -> boolean
         * @param flag The name of the flag.
         * @return Is the flag set on this CoreObject instance?
         */
        CoreObject.prototype.hasFlag = function (flag) {
            
            var internalKey = externalKeyToInternalKey(flag);
            
            return flags[this.id] && 
                flags[this.id].hasOwnProperty(internalKey);
        };
        
        /**
         * Returns an array containing all the flags set on this CoreObject.
         *
         * @type void -> [string]
         * @return An array containing the names of the flags.
         */
        CoreObject.prototype.getFlags = function () {
            
            var arr = [];
            
            for (var key in flags[this.id]) {
                arr.push(internalKeyToExternalKey(key));
            }
            
            return arr;
        };
        
        /**
         * Connects an event on this CoreObject to an event on another CoreObject.
         * This means that if CoreObject A emits the specified event then CoreObject B
         * will emit another event as a reaction.
         *
         * @type string -> CoreObject -> string -> (boolean ->) CoreObject
         * @param event1 The event on this CoreObject.
         * @param obj2 The other CoreObject.
         * @param event2 The event on the other CoreObject.
         * @param async boolean Should the event on the other CoreObject be triggered async?
         *     This is optional. The default is true.
         * @return This CoreObject.
         */
        CoreObject.prototype.connect = function (event1, obj2, event2, async) {
            
            var self = this;
            
            event1 = event1 || "*";
            event2 = event2 || "*";
            
            if (!obj2 || !(obj2 instanceof CoreObject)) {
                throw new Exception("Cannot connect events: Parameter 3 is " +
                    "expected to be of type CoreObject.");
            }
            
            function listener (data) {
                
                data = data || null;
                
                if (typeof async !== "undefined" && (async === true || async === false)) {
                    obj2.trigger(event2, data, async);
                }
                else {
                    obj2.trigger(event2, data);
                }
            }
            
            this.subscribe(listener, event1);
            
            obj2.once(function () { self.unsubscribe(listener, event1); }, "destroyed");
            
            return this;
        };
        
        /**
         * Checks whether this CoreObject complies to an interface by
         * comparing each properties type.
         *
         * @type object -> boolean
         * @param interface An object representing the interface.
         * @return Does this CoreObject implement the interface?
         */
        CoreObject.prototype.implements = function (interface) {
            
            for (var key in interface) {
                if (typeof this[key] !== typeof interface[key]) {
                    return false;
                }
            }
            
            return true;
        };
        
        /**
         * CoreObject instances have a unique ID; when used as a string,
         * the ID of the object is used as a representation.
         *
         * @type string
         * @return This CoreObjet's ID as a string.
         */
        CoreObject.prototype.toString = function () {
            return "" + this.id;
        };
        
        /**
         * Returns this CoreObject's ID.
         *
         * @type number
         * @return This CoreObject's ID.
         */
        CoreObject.prototype.valueOf = function () {
            return this.id;
        };

        /**
         * Emits the destroyed() event and deletes all of the instances properties.
         * After this method has been called on an CoreObject, it can not be used
         * anymore and should be considered dead.
         *
         * All users of a CoreObject should hook to the destroyed() event and delete
         * their references to the CoreObject when its destroyed() event is emitted.
         *
         * @event destroyed()
         * @return void
         */
        CoreObject.prototype.destroy = function () {
            
            var id = this.id;
            
            if (this.$parent) {
                this.$parent.removeChild(this);
            }
            
            this.$children.forEach(function (child) {
                if (typeof child === "object" && typeof child.destroy === "function") {
                    child.destroy();
                }
            });
            
            this.destroyed = true;
            this.trigger("destroyed", null, false);
            
            for (var key in this) {
                this[key] = null;
            }
            
            delete flags[id];
            
            this.destroyed = true;
            this.id = id;
            
            delete this.toString;
            delete this.valueOf;
            
        };
        
        CoreObject.prototype.subscribeTo = function (bus, event, listener) {
            
            var self = this;
            
            if (!(typeof bus.subscribe === "function" && typeof bus.unsubscribe === "function")) {
                throw new Exception("Cannot subscribe: Parameter 1 is " +
                    "expected to be of type CoreObject or EventBus.");
            }
            
            if (typeof event !== "string") {
                throw new Exception("Cannot subscribe: Parameter 2 is " +
                    "expected to be of type String.");
            }
            
            if (typeof listener !== "function") {
                throw new Exception("Cannot subscribe: Parameter 3 is " +
                    "expected to be of type Function.");
            }
            
            listener = listener.bind(this);
            
            bus.subscribe(event, listener);
            
            this.subscribe("destroyed", thisDestroyed);
            bus.subscribe("destroyed", busDestroyed);
            
            return this;
            
            function thisDestroyed () {
                bus.unsubscribe(event, listener);
                self.unsubscribe("destroyed", thisDestroyed);
                bus.unsubscribe("destroyed", busDestroyed);
            }
            
            function busDestroyed () {
                bus.unsubscribe("destroyed", busDestroyed);
                self.unsubscribe("destroyed", thisDestroyed);
            }
        };
        
        return CoreObject;
        
        ///////////////////////////////////
        // Helper functions
        ///////////////////////////////////
        
        function externalKeyToInternalKey (key) {
            return prefix + key;
        }
        
        function internalKeyToExternalKey (key) {
            return key.replace(new RegExp(prefix), "");
        }
        
    }
    
}());