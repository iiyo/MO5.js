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

MO5("MO5.Exception", "MO5.CoreObject", "MO5.Map", "MO5.canvas.Object").
define("MO5.canvas.Group", function (Exception, CoreObject, Map, CanvasObject) {
    
    function Group () {
        
        CoreObject.call(this);
        
        this.objects = new Map();
        
    }
    
    Group.prototype = new CoreObject();
    
    Group.prototype.add = function (obj) {
        
        if (!(obj instanceof CanvasObject)) {
            throw new Exception("Parameter 1 must be an instance of " +
                "MO5.canvas.Object.");
        }
        
        this.objects.set(+obj, obj);
        
        return this;
    };
    
    Group.prototype.remove = function (obj) {
        this.objects.remove(+obj);
        return this;
    };
    
    Group.prototype.forEach = function (cb) {
        this.objects.forEach(cb);
        return this;
    };
    
    Group.prototype.callMethod = function (name, args) {
        
        this.objects.forEach(function (item) {
            
            if (!item[name] || typeof item[name] !== "function") {
                return;
            }
            
            item[name].apply(item[name], args);
        });
        
        return this;
    };
    
    Group.prototype.applyProperty = function (name, value) {
        
        this.objects.forEach(function (item) {
            item[name] = value;
        });
        
        return this;
    };
 
    return Group;
    
});