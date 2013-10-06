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

MO5("MO5.Exception", "MO5.CoreObject", "MO5.Map", "MO5.Queue", "MO5.canvas.Object").
define("MO5.canvas.Layer", function (Exception, CoreObject, Map, Queue, CanvasObject) {
    
    var MSG_EXPECTED_CANVAS_OBJECT = "Parameter 1 is expected to be of type " +
        "MO5.canvas.Object.";
    
    
    function Layer () {
        
        CoreObject.call(this);
        
        this.objects = new Map();
        this.interactiveObjects = new Map();
        this.unsubscribers = new Map();
        
    }
    
    Layer.prototype = new CoreObject();
    
    Layer.prototype.draw = function (environment) {
        
        this.objects.forEach(function (item) {
            item.draw(environment);
        });
        
        return this;
    };
    
    Layer.prototype.objectAtOffset = function (x, y) {
        
        var keys = new Queue(this.interactiveObjects.keys());
        var obj = null, cur;
        
        while (keys.hasNext()) {
            cur = this.interactiveObjects.get(keys.next());
            
            if (cur.isAtOffset(x, y)) {
                obj = cur;
                break;
            }
        }
        
        return obj;
    };
    
    Layer.prototype.objectsAtOffset = function (x, y) {
        var objects = [];
        
        this.interactiveObjects.forEach(function (item) {
            if (item.isAtOffset(x, y)) {
                objects.push(item);
            }
        });
        
        return objects;
    };
    
    Layer.prototype.add = function (item) {
        
        var interactiveObjects = this.interactiveObjects;
        
        if (!(item instanceof CanvasObject)) {
            throw new Exception(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.set(+item, item);
        
        if (item.hasFlag("interactive")) {
            interactiveObjects.set(+item, item);
        }
        
        function flagSetListener (flag) {
            if (flag === "interactive") {
                if (!interactiveObjects.has(+item)) {
                    interactiveObjects.set(+item, item);
                }
            }
        }
        
        function flagRemoveListener (flag) {
            if (flag === "interactive") {
                if (interactiveObjects.has(+item)) {
                    interactiveObjects.remove(+item);
                }
            }
        }
        
        this.unsubscribers.set(+item, {set: flagSetListener, remove: flagRemoveListener});
        item.subscribe(flagSetListener, "flag_set");
        item.subscribe(flagRemoveListener, "flag_removed");
        
        return this;
    };
    
    Layer.prototype.remove = function (item) {
        
        if (!(item instanceof CoreObject)) {
            throw new Exception(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.remove(+item);
        
        if (this.interactiveObjects.has(+item)) {
            item.unsubscribe(this.unsubscribers.get(+item).set, "flag_set");
            item.unsubscribe(this.unsubscribers.get(+item).remove, "flag_removed");
            this.interactiveObjects.remove(+item);
        }
        
        return this;
    };
    
    Layer.prototype.has = function (item) {
        
        if (!(item instanceof CanvasObject)) {
            throw new Exception(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        return this.objects.has(+item);
    };
 
    return Layer;
    
});