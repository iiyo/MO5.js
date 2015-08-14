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

/* global MO5, window, require, module */

(function MO5ListBootstrap () {

    if (typeof MO5 === "function") {
        MO5("MO5.CoreObject", "MO5.Queue", "MO5.types").
        define("MO5.List", MO5ListModule);
    }
    else if (typeof window !== "undefined") {
        window.MO5.List = MO5ListModule(MO5.CoreObject, MO5.Queue, MO5.types);
    }
    else {
        module.exports = MO5ListModule(
            require("./CoreObject.js"),
            require("./Queue.js"),
            require("./types.js")
        );
    }
    
    function MO5ListModule (CoreObject, Queue, types) {

        function List (items) {
            
            CoreObject.call(this);

            this.unsubscribers = {};
            this.items = types.isArray(items) ? items : [];
        }

        List.prototype = new CoreObject();

        List.prototype.length = function () {
            return this.items.length;
        };
        
        List.prototype.append = function (value) {
            
            var self = this;
            
            function listener () {
                
                var i, len;
                
                for (i = 0, len = self.items.length; i < len; i += 1) {
                    if (self.items[i] === value) {
                        self.items.splice(i, 1);
                    }
                }
                
                delete self.unsubscribers[value.id];
            }
            
            function unsubscribe () {
                value.unsubscribe(listener, "destroyed");
            }
            
            if (CoreObject.isCoreObject(value)) {
                this.unsubscribers[value.id] = unsubscribe;
                value.subscribe(listener, "destroyed");
                value.subscribe("destroyed", function () {value = null;});
            }

            this.items.push(value);

            return this;
        };

        List.prototype.remove = function (i) {

            var val = this.items[i];

            if (CoreObject.isCoreObject(val)) {
                this.unsubscribers[val.id]();
                delete this.unsubscribers[val.id];
            }

            this.items.splice(i, 1);

            return this;
        };

        List.prototype.at = function (i) {
            return this.items[+i];
        };
        
        List.prototype.indexOf = function (item) {
            return this.items.indexOf(item);
        };
        
        List.prototype.values = function () {
        
            var values = [];
            
            this.forEach(function (value) {
                values.push(value);
            });
            
            return values;
        };

        List.prototype.toQueue = function () {
            
            var q = new Queue();

            this.items.forEach(function (item) {
                q.add(item);
            });

            return q;
        };
        
        List.prototype.forEach = function (fn) {
            this.items.forEach(fn);
        };
        
        List.prototype.filter = function (fn) {
            return this.items.filter(fn);
        };
        
        List.prototype.map = function (fn) {
            return this.items.map(fn);
        };
        
        List.prototype.reduce = function (fn) {
            return this.items.reduce(fn);
        };
        
        List.prototype.every = function (fn) {
            return this.items.every(fn);
        };
        
        List.prototype.some = function (fn) {
            return this.items.some(fn);
        };
        
        List.prototype.find = function (fn) {
            
            var i, numberOfItems = this.items.length;
            
            for (i = 0; i < numberOfItems; i += 1) {
                if (fn(this.items[i])) {
                    return this.items[i];
                }
            }
            
            return undefined;
        };
        
        /**
         * Returns a list which is this list with all the items from another list
         * appended to it.
         */
        List.prototype.combine = function (otherList) {
            return new List(this.items.slice().concat(otherList.items));
        };
        
        List.prototype.clone = function () {
            return new List(this.items.slice());
        };
        
        return List;
        
    }
}());
