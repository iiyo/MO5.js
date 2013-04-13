(function (lab) {
    
    var suite = new ROCKET.TestSuite("MO5.Queue");
    
    suite.addTestCase(
        new ROCKET.TestCase(
            "A queue can be initialized with an array of values on construction.",
            function (params) {
                var q1, q2, q3, thrown = false;
                
                q1 = new MO5.Queue([1, 2, 3]);
                
                q2 = new MO5.Queue().add(1).add(2).add(3);
                
                while (q1.hasNext()) {
                    this.assertEquals(q1.next(), q2.next(), "Supplying an array of values on " +
                        "construction must be equivalent to adding these values separately using add().");
                }
                
                try {
                    q3 = new MO5.Queue("not an array!");
                }
                catch (e) {
                    thrown = true;
                    this.assert(e instanceof MO5.Error, "The error thrown when initializing the queue with " +
                        "a type other than Array must be of type MO5.Error.");
                }
                
                this.assert(thrown === true, "When initializing a queue with something other than an array, " +
                    "an error must be thrown.");
            }
        )
    );
    
    suite.addTestCase(
        new ROCKET.TestCase(
            "Method length() returns the number of contained items.",
            function (params) {
                var q1, q2, i;
                
                q1 = new MO5.Queue();
                q2 = new MO5.Queue();
                
                q1.add(1).add(2).add(3);
                
                this.assertEquals(q1.length(), 3);
                
                q1.next();
                
                this.assertEquals(q1.length(), 2);
                
                i = 1;
                while (i <= 10000) {
                    q2.add(i);
                    this.assertEquals(q2.length(), i, "While adding 10000 items to the queue, " +
                        "length() did not return the correct length of the queue.");
                    i += 1;
                }
            }
        )
    );
    
    suite.addTestCase(
        new ROCKET.TestCase(
            "Destroyed MO5.Objects cannot be added to the queue.",
            function (params) {
                var q = new MO5.Queue();
                var o = new MO5.Object();
                var addingWorked = true;
                
                o.destroy();
                
                try {
                    q.add(o);
                }
                catch (e) {
                    addingWorked = false;
                    this.assert(e instanceof MO5.Error, "The thrown error when adding a " +
                        "destroyed MO5.Object to the queue muste be of type MO5.Error");
                }
                
                this.assert(addingWorked === false, "When adding a destroyed MO5.Object, an Error must be thrown.");
            }
        )
    );
    
    suite.addTestCase(
        new ROCKET.TestCase(
            "When an MO5.Object is destroyed, it must be removed from the queue.",
            function (params) {
                var q = new MO5.Queue();
                var o = new MO5.Object();
                var addingWorked = true;
                
                q.add(o);
                
                this.assertEquals(q.length(), 1, "After adding one thing to an empty queue, length() must return 1.");
                
                o.destroy();
                
                this.assertEquals(q.length(), 0, "When adding destroyed objects, an Error must be thrown.");
            }
        )
    );
    
    suite.addTestCase(
        new ROCKET.TestCase(
            "Method clone() must produce a new MO5.Queue with a different ID but the same contents.",
            function (params) {
                var original, clone;
                
                original = new MO5.Queue().add(1).add(2).add(3);
                clone = original.clone();
                
                this.assert(+original !== +clone, "Original and clone must have different IDs.");
                this.assertEquals(original.length(), clone.length(), "The length() of the clone must be " + 
                    "equal to the length() when the clone has not been changed.");
                
                while (original.hasNext()) {
                    this.assertEquals(clone.next(), original.next(), "The clone must contain the " +
                        "same items as the parent, and in the correct order.");
                }
            }
        )
    );
    
    lab.addTestSuite(suite);
    
}(MO5TestLab));