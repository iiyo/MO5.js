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
    
    var MSG_EXPECTED_CANVAS_OBJECT = "Parameter 1 is expected to be of type " +
        "MO5.canvas.Object.";
    
    out.canvas = out.canvas || {};
    
    out.canvas.Layer = function () {
        
        out.Object.call(this);
        
        this.objects = new out.Map();
        this.interactiveObjects = new out.Map();
        this.unsubscribers = new out.Map();
        
    };
    
    out.canvas.Layer.prototype = new out.Object();
    
    out.canvas.Layer.prototype.draw = function (environment) {
        
        this.objects.forEach(function (item) {
            item.draw(environment);
        });
        
        return this;
    };
    
    out.canvas.Layer.prototype.objectAtOffset = function (x, y) {
        
        var keys = new out.Queue(this.interactiveObjects.keys());
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
    
    out.canvas.Layer.prototype.objectsAtOffset = function (x, y) {
        var objects = [], cur;
        
        this.interactiveObjects.forEach(function (item) {
            if (item.isAtOffset(x, y)) {
                objects.push(item);
            }
        });
        
        return objects;
    };
    
    out.canvas.Layer.prototype.add = function (item) {
        
        var interactiveObjects = this.interactiveObjects;
        
        if (!(item instanceof out.canvas.Object)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.set(+item, item);
        
        if (item.getProperty("interactive") === true) {
            interactiveObjects.set(+item, item);
        }
        
        function listener (data) {
            
            if (data.key === "interactive") {
                
                if (data.value === true) {
                    if (!interactiveObjects.has(+item)) {
                        interactiveObjects.set(+item, item);
                    }
                }
                else {
                    if (interactiveObjects.has(+item)) {
                        interactiveObjects.remove(+item);
                    }
                }
            }
        }
        
        this.unsubscribers.set(+item, listener);
        item.subscribe(listener, "propertyChange");
        
        return this;
    };
    
    out.canvas.Layer.prototype.remove = function (item) {
        
        if (!(item instanceof out.canvas.Object)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        this.objects.remove(+item);
        
        if (this.interactiveObjects.has(+item)) {
            item.unsubscribe(this.unsubscribers.get(+item), "propertyChange");
            this.interactiveObjects.remove(+item);
        }
        
        return this;
    };
    
    out.canvas.Layer.prototype.has = function (item) {
        
        if (!(item instanceof out.canvas.Object)) {
            throw new out.Error(MSG_EXPECTED_CANVAS_OBJECT);
        }
        
        return this.objects.has(+item);
    };
    
}(MO5));