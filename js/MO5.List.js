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

/* global MO5 */

MO5("MO5.CoreObject", "MO5.Queue").
define("MO5.List", function (CoreObject, Queue) {

    function List () {
        CoreObject.call(this);

        this.unsubscribers = {};
        this.items = [];
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

            delete self.unsubscribers[+value];
        }

        function unsubscribe () {
            value.unsubscribe(listener, "destroyed");
        }

        if (value instanceof CoreObject) {
            this.unsubscribers[+value] = unsubscribe;
            value.subscribe(listener, "destroyed");
        }

        this.items.push(value);

        return this;
    };

    List.prototype.remove = function (i) {

        var val = this.items[i];

        if (val instanceof CoreObject) {
            this.unsubscribers[val.id]();
            delete this.unsubscribers[val.id];
        }

        this.items.splice(i, 1);

        return this;
    };

    List.prototype.at = function (i) {
        return this.items[+i];
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
    
    return List;

});
