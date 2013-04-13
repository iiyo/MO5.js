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