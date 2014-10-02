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

/* global MO5, window, module, require */

(function MO5CoreObjectBootstrap () {

    if (typeof MO5 === "function") {
        MO5("MO5.Exception", "MO5.fail", "MO5.EventBus").
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
         * @event destroyed()
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
        }
        
        CoreObject.hasId = function (obj) {
            return typeof obj === "object" && obj !== null && typeof obj.id === "number";
        };
        
        CoreObject.isCoreObject = function (obj) {
            return obj instanceof CoreObject;
        };
        
        CoreObject.prototype.setFlag = function (key) {
            
            var internalKey = externalKeyToInternalKey(key);
            
            if (!flags[this.id]) {
                return;
            }

            flags[this.id][internalKey] = true;

            this.trigger("flag_set", key);
        };

        CoreObject.prototype.removeFlag = function (flag) {
            if (!this.hasFlag(flag)) {
                return;
            }

            delete flags[this.id][externalKeyToInternalKey(flag)];

            this.trigger("flag_removed", flag);
        };

        CoreObject.prototype.hasFlag = function (key) {

            var internalKey = externalKeyToInternalKey(key);

            return flags[this.id] && 
                flags[this.id].hasOwnProperty(internalKey);
        };

        CoreObject.prototype.getFlags = function () {
            var arr = [];

            for (var key in flags[this.id]) {
                arr.push(internalKeyToExternalKey(key));
            }

            return arr;
        };

        CoreObject.prototype.connect = function (event1, obj2, event2, async) {

            var self = this;

            event1 = event1 || "*";
            event2 = event2 || "*";

            if (!obj2 || !(obj2 instanceof CoreObject)) {
                fail(new Exception("Cannot connect events: Parameter 3 is " +
                    "expected to be of type CoreObject."));
                return this;
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
         */
        CoreObject.prototype.toString = function () {
            return "" + this.id;
        };

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
         */
        CoreObject.prototype.destroy = function () {

            var id = this.id;

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