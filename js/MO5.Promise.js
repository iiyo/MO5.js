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
    
    out.Promise = function (result) {
        
        if (!(result instanceof out.Result)) {
            out.fail(new out.Error("Parameter 1 is expected to be of type MO5.Result."));
            result = new out.Result();
        }
        
        out.Object.call(this);
        
        this.then = function (success, failure) {
            
            var newResult = new out.Result();
            
            switch (result.status) {
                case out.Result.STATUS_PENDING:
                    out.Result.addToQueue("success", result.successQueue, success, newResult);
                    out.Result.addToQueue("failure", result.failureQueue, failure, newResult);
                    break;
                case out.Result.STATUS_SUCCESS:
                    out.Result.addToQueue("success", result.successQueue, success, newResult);
                    out.Result.resolve(result.successQueue, result.value);
                    break;
                case out.Result.STATUS_FAILURE:
                    out.Result.addToQueue("failure", result.failureQueue, failure, newResult);
                    out.Result.resolve(result.failureQueue, result.value);
                    break;
            }
            
            return newResult.promise;
        };
    };
    
    out.Promise.prototype = new out.Object();
    
}(MO5));