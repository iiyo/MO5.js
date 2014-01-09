/* global MO5 */
MO5().define("MO5.script.Pair", function () {

    function Pair (head, tail) {
        this.head = head === undefined ? null: head;
        this.tail = tail === undefined ? null : tail;
        this.isPair = true;
    }
    
    /**
     * Creates a list from an array.
     */
    Pair.fromArray = function (arr) {
        
        var list = new Pair(), current = list;
        
        arr.forEach(function (item) {
            current.tail = new Pair(item, null);
            current = current.tail;
        });
        
        return (list.tail ? list.tail : list);
    };
    
    Pair.toArray = function (pair) {
        
        var arr = [], cur = pair;
        
        if (Pair.isEmpty(pair)) {
            return arr;
        }
        
        while (cur) {
            if (cur.tail instanceof Pair || cur.tail === null) {
                arr.push(cur.head);
                cur = cur.tail;
            }
            else {
                arr.push(new Pair(cur.head, cur.tail));
                break;
            }
        }
        
        return arr;
    };
    
    Pair.isEmpty = function (pair) {
        
        if ((pair.head === null || pair.head === undefined) &&
                (pair.tail === null || pair.tail === undefined)) {
            return true;
        }
        
        return false;
    };
    
    Pair.segments = function (pair) {
        
        var arr = [], cur = pair;
        
        while (cur) {
            arr.push(cur);
            cur = cur.tail;
        }
        
        return arr;
    };
    
    Pair.isPair = function (thing) {
        if (!thing || typeof thing !== "object") {
            return false;
        }
        
        if (thing instanceof Pair) {
            return true;
        }
        
        return false;
    };
    
    Pair.prototype.segments = function () {
        return Pair.segments(this);
    };
    
    Pair.prototype.each = function (fn) {
        var segments = Pair.toArray(this);
        segments.forEach(fn);
    };
    
    Pair.prototype.eachSegment = function (fn) {
        var segments = Pair.segments(this);
        segments.forEach(fn);
    };
    
    Pair.prototype.tailToArray = function () {
        
        var tails = [];
        
        this.eachTail(function (tail) {
            tails.push(tail);
        });
        
        return tails;
    };
    
    Pair.prototype.nth = function (n) {
        var i = 1, current = this;
        
        while (current) {
            if (i === n) {
                return current.head;
            }
            
            current = current.tail;
            i += 1;
        }
        
        return null;
    };
    
    Pair.prototype.first = function () {
        return this.nth(1);
    };
    
    Pair.prototype.second = function () {
        return this.nth(2);
    };
    
    Pair.prototype.third = function () {
        return this.nth(3);
    };
    
    Pair.prototype.fourth = function () {
        return this.nth(4);
    };
    
    Pair.prototype.fifth = function () {
        return this.nth(5);
    };
    
    Pair.prototype.sixth = function () {
        return this.nth(6);
    };
    
    Pair.prototype.seventh = function () {
        return this.nth(7);
    };
    
    Pair.prototype.eighth = function () {
        return this.nth(8);
    };
    
    Pair.prototype.ninth = function () {
        return this.nth(9);
    };
    
    Pair.prototype.tenth = function () {
        return this.nth(10);
    };
    
    return Pair;
    
});