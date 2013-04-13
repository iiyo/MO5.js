(function (out) {
    
    out.Point = function (x, y)
    {
        this.x = x;
        this.y = y;
    };

    out.Point.prototype.getDistance = function (otherPoint)
    {
        var dx = this.x - otherPoint.x,
            dy = this.y - otherPoint.y,
            dist = Math.squrt(dx * dx + dy * dy);
        
        return dist;
    };
    
}(MO5));