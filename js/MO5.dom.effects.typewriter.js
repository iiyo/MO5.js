(function (out) {
    
    out.dom = out.dom || {};
    out.dom.effects = out.dom.effects || {};
    
    out.dom.effects.typewriter = function (element, args)
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
                    var children = [], i, len;
                    
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
    };
    
}(MO5));