(function (out) {

    out.List = function () {
        out.Object.call(this);

        this.unsubscribers = {};
        this.items = [];
    };

    out.List.prototype = new out.Object();

    out.List.prototype.length = function () {
        return this.items.length;
    };

    out.List.prototype.append = function (value) {

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

        if (value instanceof out.Object) {
            this.unsubscribers[+value] = unsubscribe;
            value.subscribe(listener, "destroyed");
        }

        this.items.push(value);

        return this;
    };

    out.List.prototype.remove = function (i) {

        var val = this.items[i];

        if (val instanceof out.Object) {
            this.unsubscribers[val.id]();
            delete this.unsubscribers[val.id];
        }

        this.items.splice(i, 1);

        return this;
    };

    out.List.prototype.at = function (i) {
        return this.items[+i];
    };

    out.List.prototype.toQueue = function () {
        var q = new out.Queue();

        this.items.forEach(function (item) {
            q.add(item);
        });

        return q;
    };
    
    out.List.prototype.forEach = function (fn) {
        this.items.forEach(fn);
    };

})(MO5);
