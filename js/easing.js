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

/* global using, window */

using().define("MO5.easing", function () {
    
    /**
     * Acceleration functions for use in MO5.transform().
     */
    var easing = (function (stdLib) {
        
        "use asm";

        /*!
         * TERMS OF USE - EASING EQUATIONS
         * Open source under the BSD License.
         * Copyright 2001 Robert Penner All rights reserved.
         * 
         * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
         * 
         * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
         * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
         * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.
        * 
        * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        */

        /**
         * Function for linear transformations.
         */
        function linear (d, t) {
            d = d|0;
            t = t|0;
            
            return +(t / d);
        }

        /**
         * Function for sine transformations.
         */
        function sineEaseOut (d, t) {
            d = d|0;
            t = t|0;
            
            var s = +(stdLib.Math.PI / (2 * d));
            var y = +(stdLib.Math.abs(stdLib.Math.sin(t * s)));
            
            return +y;
        }
        
        function sineEaseIn (d, t) {
            d = d|0;
            t = t|0;
            
            var s = +(stdLib.Math.PI / (2 * d));
            var y = +(stdLib.Math.abs(-stdLib.Math.cos(t * s) + 1));
            
            return +y;
        }
        
        function sineEaseInOut (d, t) {
            d = d|0;
            t = t|0;
            
            if (+(t / (d / 2) < 1)) {
                return +sineEaseIn(d, t);
            }
            else {
                return +sineEaseOut(d, t);
            }
        }
        
        
        /*
         * EaseOutBounce for JavaScript, taken from jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
         *
         * TERMS OF USE - jQuery Easing
         * 
         * Open source under the BSD License. 
         * 
         * Copyright © 2008 George McGinley Smith
         * All rights reserved.
         * 
         * Redistribution and use in source and binary forms, with or without modification, 
         * are permitted provided that the following conditions are met:
         * 
         * Redistributions of source code must retain the above copyright notice, this list of 
         * conditions and the following disclaimer.
         * Redistributions in binary form must reproduce the above copyright notice, this list 
         * of conditions and the following disclaimer in the documentation and/or other materials 
         * provided with the distribution.
         * 
         * Neither the name of the author nor the names of contributors may be used to endorse 
         * or promote products derived from this software without specific prior written permission.
         * 
         * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
         * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
         * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
         *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
         *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
         *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
         * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
         *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
         * OF THE POSSIBILITY OF SUCH DAMAGE. 
         *
         */
        function easeOutBounce (d, t) {
            d = d|0;
            t = t|0;
            
            var b = 0, c = 1, val = 0.0;

            if ((t /= d) < (1 / 2.75)) {
                
                val = +(c * (7.5625 * t * t) + b);
            }
            else if (t < (2 / 2.75)) {
                
                val = +(c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b);
            }
            else if (t < (2.5 / 2.75)) {
                
                val = +(c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b);
            }
            else {
                
                val = +(c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b);
            }
            
            return +val;
        }
        
        function easeOut (potency, d, t) {
            d = d|0;
            t = t|0;
            
            return +(1 - stdLib.Math.pow(1 - (t / d), potency));
        }
        
        function easeIn (potency, d, t) {
            d = d|0;
            t = t|0;
            
            return +(stdLib.Math.pow((t / d), potency));
        }
        
        function easeInOut (potency, d, t) {
            d = d|0;
            t = t|0;
            
            var val = 0.0;
            
            if (t > d / 2) {
                val = +easeOut(potency, d, t);
            }
            else {
                val = +easeIn(potency, d, t);
            }
            
            return +val;
        }
        
        return {
            linear: linear,
            sineEaseOut: sineEaseOut,
            sineEaseIn: sineEaseIn,
            sineEaseInOut: sineEaseInOut,
            easeOutBounce: easeOutBounce,
            easeIn: easeIn,
            easeOut: easeOut,
            easeInOut: easeInOut
        };
        
    }(window));
    
    easing.easingFunctionGenerator = easingFunctionGenerator;
    easing.createEaseInFunction = createEaseInFunction;
    easing.createEaseOutFunction = createEaseOutFunction;
    easing.createEaseInOutFunction = createEaseInOutFunction;
    
    easing.easeInQuad = createEaseInFunction(2);
    easing.easeInCubic = createEaseInFunction(3);
    easing.easeInQuart = createEaseInFunction(4);
    easing.easeInQuint = createEaseInFunction(5);
    
    easing.easeOutQuad = createEaseOutFunction(2);
    easing.easeOutCubic = createEaseOutFunction(3);
    easing.easeOutQuart = createEaseOutFunction(4);
    easing.easeOutQuint = createEaseOutFunction(5);
    
    easing.easeInOutQuad = createEaseInOutFunction(2);
    easing.easeInOutCubic = createEaseInOutFunction(3);
    easing.easeInOutQuart = createEaseInOutFunction(4);
    easing.easeInOutQuint = createEaseInOutFunction(5);

    return easing;
    
    function easingFunctionGenerator (type) {
        return function (potency) {
            return function (d, t) {
                return easing[type](potency, d, t);
            };
        };
    }
    
    function createEaseInFunction (potency) {
        return easingFunctionGenerator("easeIn")(potency);
    }
    
    function createEaseOutFunction (potency) {
        return easingFunctionGenerator("easeOut")(potency);
    }
    
    function createEaseInOutFunction (potency) {
        return easingFunctionGenerator("easeInOut")(potency);
    }
    
});