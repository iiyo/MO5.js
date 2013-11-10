MO5().define("MO5.script.Pair", function () {

    function Pair (head, tail) {
        this.head = head;
        this.tail = tail;
    }
    
    Pair.toArray = function (pair) {
        
        var arr = [], cur = pair;
        
        while (cur) {
            arr.push(cur);
            cur = cur.tail;
        }
        
        return arr;
    };
    
    Pair.prototype.eachTail = function (fn) {
        
        var tail = this.tail, i = 0;
        
        while (tail instanceof Pair) {
            
            fn(tail, i);
            
            tail = tail.tail;
            i += 1;
        }
        
    };
    
    Pair.prototype.tailToArray = function () {
        
        var tails = [];
        
        this.eachTail(function (tail) {
            tails.push(tail);
        });
        
        return tails;
    };
    
    Pair.prototype.first = function () {
        return this.head;
    };
    
    Pair.prototype.second = function () {
        return this.tail.head;
    };
    
    Pair.prototype.third = function () {
        return this.tail.tail.head;
    };
    
    Pair.prototype.fourth = function () {
        return this.tail.tail.tail.head;
    };
    
    Pair.prototype.fifth = function () {
        return this.tail.tail.tail.tail.head;
    };
    
    Pair.prototype.sixth = function () {
        return this.tail.tail.tail.tail.tail.head;
    };
    
    Pair.prototype.seventh = function () {
        return this.tail.tail.tail.tail.tail.tail.head;
    };
    
    Pair.prototype.eighth = function () {
        return this.tail.tail.tail.tail.tail.tail.tail.head;
    };
    
    Pair.prototype.ninth = function () {
        return this.tail.tail.tail.tail.tail.tail.tail.tail.head;
    };
    
    Pair.prototype.tenth = function () {
        return this.tail.tail.tail.tail.tail.tail.tail.tail.tail.head;
    };
    
    return Pair;
    
});