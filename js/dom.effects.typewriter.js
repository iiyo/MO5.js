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

/* global MO5, setTimeout */

MO5().define("MO5.dom.effects.typewriter", function () {
    
    function typewriter (element, args)
    {
        var TYPE_ELEMENT = 1, TYPE_TEXT = 3, speed, cb;
        
        args = args || {};
        speed = args.speed || 50;
        cb = args.onFinish || null;
        
        function hideChildren(el)
        {
            var childNodes = el.childNodes, i, len;
            
            if (el.nodeType === TYPE_ELEMENT)
            {
                el.style.display = 'none';
                
                for (i = 0, len = childNodes.length; i < len; i += 1)
                {
                    hideChildren(childNodes[i]);
                }
            }
        }
        
        hideChildren(element);
        
        function showChildren(el, cb)
        {
            if (el.nodeType === TYPE_ELEMENT)
            {
                (function ()
                {
                    var children = [];
                    
                    while (el.hasChildNodes())
                    {
                        children.push(el.removeChild(el.firstChild));
                    }
                    
                    el.style.display = '';
                    
                    (function loopChildren()
                    {
                        if (children.length > 0)
                        {
                            showChildren(children[0], loopChildren);
                            el.appendChild(children.shift());
                        }
                        else if (cb)
                        {
                            setTimeout(cb, 0);
                        }
                    }());
                    
                }());
            }
            else if (el.nodeType === TYPE_TEXT)
            {
                (function ()
                {
                    var textContent = el.data.replace(/ +/g, ' '), i, len;
                    
                    el.data = '';
                    i = 0;
                    len = textContent.length;
                    
                    function insertTextContent()
                    {
                        el.data += textContent[i];
                        i += 1;
                        
                        if (i < len)
                        {
                            setTimeout(insertTextContent, 1000 / speed);
                        }
                        else if (cb)
                        {
                            setTimeout(cb, 0);
                        }
                    }
                    
                    insertTextContent();
                }());
            }
        }
        
        showChildren(element, cb);
    }
    
    return typewriter;
    
});