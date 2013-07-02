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
    
    function Queue (arr) {
        out.Object.call(this);
        
        if (arr && !(arr instanceof Array)) {
            throw new out.Error("Parameter 1 is expected to be of type Array.");
        }
        
        this.arr = arr || [];
    };
    
    Queue.prototype = new out.Object();
    Queue.prototype.constructor = Queue;
    
    Queue.prototype.length = function () {
        return this.arr.length;
    };
    
    /**
     * Adds an item to the back of the queue.
     */
    Queue.prototype.add = function (val) {
        var self = this, index = this.arr.length;
        
        if (val instanceof out.Object) {
            
            if (val.destroyed) {
                throw new out.Error("Trying to add an MO5.Object that has already been destroyed.");
            }
            
            val.once(function () { if (!self.destroyed) { self.arr.splice(index, 1); } }, "destroyed");
        }
        
        this.arr.push(val);
        this.trigger("updated");
        this.trigger("added", val);
        
        return this;
    };
    
    /**
     * Replaces all items of the queue with the items in the first parameter.
     * @param arr An array containing the new items.
     */
    Queue.prototype.replace = function (arr) {
        if (!(arr instanceof Array)) {
            throw new out.Error("Parameter 1 is expected to be of type Array.");
            return this;
        }
        
        this.arr = arr;
        
        this.trigger("updated");
        this.trigger("replaced", arr);
        
        return this;
    };
    
    /**
     * Removes the front of the queue and returns it.
     */
    Queue.prototype.next = function () {
        
        if (!this.hasNext()) {
            throw new out.Error("Calling next() on empty queue.");
        }
        
        var ret = this.arr.shift();
        
        this.trigger("updated");
        this.trigger("next");
        
        if (this.arr.length < 1) {
            this.trigger("emptied");
        }
        
        return ret;
    };
    
    /**
     * Returns the front item of the queue without removing it.
     */
    Queue.prototype.peak = function () {
        return this.isEmpty() ? undefined : this.arr[0];
    };
    
    Queue.prototype.isEmpty = function () {
        return !this.hasNext();
    };
    
    Queue.prototype.hasNext = function () {
        return this.arr.length > 0;
    };
    
    /**
     * Removes all items from the queue.
     */
    Queue.prototype.clear = function () {
        this.arr = [];
        this.trigger("updated");
        this.trigger("cleared");
        
        return this;
    };
    
    /**
     * Reverses the queue's order so that the first item becomes the last.
     */
    Queue.prototype.reverse = function () {
        var q = new Queue(), len = this.length(), i = len - 1;
        
        while (i >= 0) {
            q.add(this.arr[i]);
            i -= 1;
        }
        
        return q;
    };
    
    /**
     * Returns a shallow copy of the queue.
     */
    Queue.prototype.clone = function () {
        return new Queue(this.arr.slice());
    };
    
    out.Queue = Queue;
    
}(MO5));