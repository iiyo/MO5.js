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

/* global MO5, module, require, window */

(function MO5MapBootstrap () {
    
    if (typeof MO5 === "function") {
        MO5("MO5.CoreObject", "MO5.Exception").
        define("MO5.Map", MO5MapModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.Map = MO5MapModule(MO5.CoreObject, MO5.Exception);
    }
    else {
        module.exports = MO5MapModule(
            require("./MO5.CoreObject.js"),
            require("./MO5.Exception.js")
        );
    }
    
    function MO5MapModule (CoreObject, Exception) {

        var prefix = "MO5Map";

        function makeKey (k) {
            return prefix + k;
        }

        function revokeKey (k) {
            return k.replace(new RegExp(prefix), "");
        }

        function Map (content) {

            var key;

            CoreObject.call(this);

            this.items = {};
            this.unsubscribers = {};
            this.count = 0;

            if (content) {
                for (key in content) {
                    this.set(key, content[key]);
                }
            }
        }

        Map.prototype = new CoreObject();

        Map.prototype.length = function () {
            return this.count;
        };

        Map.prototype.set = function (k, value) {

            var self = this, key = makeKey(k);

            function whenDestroyed () {
                delete self.items[key];
                self.count -= 1;
            }

            if (!k) {
                throw new Exception("MO5.Map keys cannot be falsy.");
            }

            if (this.has(key)) {
                this.remove(key);
            }

            if (value && value instanceof CoreObject) {

                if (value.destroyed) {
                    throw new Exception("Trying to add an MO5.Object that has " +
                        "already been destroyed.");
                }

                value.subscribe(whenDestroyed, "destroyed");
            }

            if (k instanceof CoreObject) {

                if (k.destroyed) {
                    throw new Exception("Trying to use an MO5.Object as key that " +
                        "has already been destroyed.");
                }

                k.subscribe(whenDestroyed, "destroyed");

            }

            if (value && value instanceof CoreObject || k instanceof CoreObject) {

                this.unsubscribers[key] = function () {

                    if (value instanceof CoreObject) {
                        value.unsubscribe(whenDestroyed, "destroyed");
                    }

                    if (k instanceof CoreObject) {
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

        Map.prototype.get = function (k) {

            var key = makeKey(k);

            if (!this.items.hasOwnProperty(key)) {
                return undefined;
            }

            return this.items[key];
        };

        Map.prototype.remove = function (k) {

            var key = makeKey(k);

            if (!this.has(k)) {
                throw new Exception("Trying to remove an unknown key from an MO5.Map.");
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

        Map.prototype.has = function (k) {

            var key = makeKey(k);

            return this.items.hasOwnProperty(key);
        };

        Map.prototype.destroy = function () {

            for (var key in this.unsubscribers) {
                this.unsubscribers[key]();
                delete this.unsubscribers[key];
            }

            CoreObject.prototype.destroy.call(this);
        };

        Map.prototype.forEach = function (fn) {

            if (!fn || typeof fn !== "function") {
                throw new Exception("Parameter 1 is expected to be of type function.");
            }

            for (var key in this.items) {
                fn(this.items[key], revokeKey(key), this);
            }

            return this;
        };

        Map.prototype.keys = function () {

            var keys = [];

            this.forEach(function (item, key) {
                keys.push(revokeKey(key));
            });

            return keys;
        };

        Map.prototype.clone = function () {
            var clone = new Map();

            this.forEach(function (item, key) {
                clone.set(revokeKey(key), item);
            });

            return clone;
        };

        /**
         * Adds the content of another map to this map's content.
         * @param otherMap Another MO5.Map.
         */
        Map.prototype.addMap = function (otherMap) {

            var self = this;

            otherMap.forEach(function (item, key) {
                self.set(key, item);
            });

            return this;
        };

        /**
         * Returns a new map which is the result of joining this map
         * with another map. This map isn't changed in the process.
         * The keys from otherMap will replace any keys from this map that
         * are the same.
         * @param otherMap A map to join with this map.
         */
        Map.prototype.join = function (otherMap) {
            return this.clone().addMap(otherMap);
        };

        return Map;

    }

}());
