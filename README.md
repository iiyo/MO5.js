# MO5.js #

MO5 is a JavaScript library for building HTML5 apps. It features control flow helpers, 
observable objects, animation and timing facilities as well as intelligent data 
structures and a module loader.

MO5 makes heavy use of the EventBus, Observer and Promise patterns. All important
objects are derived from MO5.CoreObject, which means they are observable and destroyable.

MO5's internal containers recognize when objects contained within them get destroyed
and remove all references they own automatically so that the garbage collector can
do its work.

Most modules work in the browser using the MO5 module loader or making them available under
the "MO5" namespace object if the module loader is not available. In node.js, the default
module system with require and exports is used instead.


## Usage ##

By extending MO5.CoreObject, you can build objects that have "batteries included", that 
is, they have a unique ID among all MO5.CoreObject instances, can be observed via the
subscribe(), unsubscribe(), trigger() and once() methods, can be connected to other
MO5.CoreObject instances using the connect() method and can be marked to be deleted 
using the destroy() method, which causes MO5 data structures like MO5.Map or 
MO5.Queue to delete all their references to the object that should be deleted. 
MO5.CoreObject instances also have a flag feature to allow modules to mark objects for
specific tasks without extending their interface.

You can extend from MO5.CoreObject like this:

```javascript
MO5("MO5.CoreObject").run(function (CoreObject) {
    function MyObject () {
        CoreObject.apply(this, arguments);
        
        // ... whatever your constructor does
    }
    
    MyObject.prototype = new CoreObject();
    
    var obj = new MyObject();
});
```

Tweening:

```javascript
MO5("MO5.transform").run(function (transform) {
    var element = document.getElementById("MyElement");
    
    // A function that takes a value and applies it to whatever needs
    // to be transformed:
    var fn = function (v) {
        element.style.left = v + "px";
    };
    
    // The transform function executes a function for a
    // specific duration and feeds it the current value from
    // a range, specified by the second and third parameter,
    // where the current value is calculated based on the time
    // passed since the start of the transform using an easing
    // function.
    var timer = transform(fn, 0, 200, { duration: 500 });
    
    // The timer can then be used to obtain information about
    // the transformation and to pause or cancel it:
    timer.elapsed(); // Number of milliseconds since the start
    timer.pause(); // Pauses the transformation
    timer.resume(); // Resumes the transformation
    timer.stop(); // Abruptly ends the transformation with the "to" value.
    timer.cancel(); // Abruptly ends the transformation with whatever the current value is.
    
    // There are multiple ways to chain transformations, e.g. using the Timer's event bus:
    timer.once("stopped", function () { console.log("Timer has been stopped."); });
    
    // Or you can use promises:
    timer.promise().then(func1).then(func2).then(funcEnd, funcError);
    
    // A Timer's promise is fulfilled when the Timer has been stopped.
    // The promise is broken when the Timer has been canceled or destroyed.
    // The value passed to the callback in then is a reference to the Timer itself.
});
```

Animations:

```javascript
MO5("MO5.transform", "MO5.TimerWatcher", "MO5.Animation").
run(function (transform, TimerWatcher, Animation) {
    var anim = new Animation();
    
    anim
    .addStep(function () {
        return new TimerWatcher()
        .addTimer(transform(fn, 0, 200))
        .addTimer(transform(fn2, 100, 400));
    })
    .addStep(function () {
        // rectangle is some MO5.dom.Element or MO5.canvas.CanvasElement;
        // move returns a TimerWatcher, not a Timer, because it uses a transformation
        // for each dimension.
        return rectangle.move(300, 100);
    })
    .addStep(function () {
        return new TimerWatcher()
        .addTimer(transform(fn, 200, 0))
        .addTimer(transform(fn2, 400, 100));
    })
    .addStep(function () {
        return rectangle.move(-300, -100);
    });
    
    anim.start(); // Starts the animation; after the last step, starts at the first step again.
    anim.stop(); // Stops the animation after the last step has been executed.
    anim.cancel(); // Cancels the animation immediately, ignoring any remaining steps in the current queue.
    anim.pause(); // Pauses the animation.
    anim.resume(); // Resumes the animation from where it was paused.
    
    // An MO5.Animation can be chained the same way Timer objects can be chained by either using the bus
    // or the promise() method. See the tweening section above for details.
});
```

Containers with weak references:

```javascript
MO5("MO5.CoreObject", "MO5.Queue").
run(function (CoreObject, Queue) {
    var q = new Queue(), o = new CoreObject();
    q.length(); // 0
    q.add(o);
    q.length(); // 1
    o.destroy();
    q.length(); // 0
});
```


## Project structure ##

![MO5.js class diagram](https://iiyo.org/MO5.js/images/structure.jpg)


## License ##

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