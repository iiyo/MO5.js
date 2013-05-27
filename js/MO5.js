/*global Squiddle: true, requestAnimationFrame: false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, 
 strict:true, undef:true, curly:true, browser:true, node:true, 
 indent:4, maxerr:50, globalstrict:true, white:false */
/**
 * 
 *    MO5.js - Javascript library for canvas and DOM animation and effects
 *    ====================================================================
 * 
 *        Copyright (c) 2012 The MO5.js contributors.
 *        
 * 
 *        License
 *        -------
 * 
 *            Redistribution and use in source and binary forms, with or without
 *            modification, are permitted provided that the following conditions 
 *            are met:
 *            
 *              * Redistributions of source code must retain the above copyright
 *              notice, this list of conditions and the following disclaimer.
 * 
 *              * Redistributions in binary form must reproduce the above copyright
 *              notice, this list of conditions and the following disclaimer in 
 *              the documentation and/or other materials provided with the 
 *              distribution.
 * 
 *              * Neither the name of the project nor the names of its contributors 
 *              may be used to endorse or promote products derived from this 
 *              software without specific prior written permission.
 * 
 *            THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 *            "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 *            LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 *            FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 *            COPYRIGHT HOLDERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 *            SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
 *            LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF 
 *            USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *            ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 *            OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT 
 *            OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
 *            OF SUCH DAMAGE.
 * 
 *            
 *        Authors
 *        -------
 * 
 *            Jonathan Steinbeck <jonathan@steinbeck.in>
 *        
 *        
 *        Dependencies
 *        ------------
 *        
 *            Squiddle.js
 * 
 *            
 */

// If the browser doesn't support requestAnimationFrame, use a fallback.
window.requestAnimationFrame = (function ()
{
    "use strict";
 
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}());

/**
 * 
 *    [Object] MO5
 *    ============
 *    
 *        The main (and only) global object of the project. Used as a
 *        namespace.
 *        
 * 
 */
var MO5 = (function ()
{
    "use strict";
    
    var out = {
        highestId: 0,
        defaults: {
            fps: 30,
            debug: true,
            canvas: {
                width: 640, // default width for canvas elements
                height: 480 // default height for canvas elements
            }
        }
    };

    return out;

}());
    
Squiddle.inject(MO5); // make MO5 object observable
