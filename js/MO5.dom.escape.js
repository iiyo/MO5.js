/* global MO5 */
MO5().define("MO5.dom.escape", function () {

    function escape (unescapedHtml) {
        
        var escaped = "";
        
        escaped = unescapedHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").
            replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        
        return escaped;
    }

    return escape;
});