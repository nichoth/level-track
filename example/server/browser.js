var sock = require('shoe')();
var through = require('through');

var render = require('./render/message.js')()
    .appendTo('#messages')
;

sock.pipe(through(function (row) {
    var elem = query(row.key);
    if (elem) {
        
        elem.parentNode.removeChild(elem);
        
        return;
    }
    
    if (/^message/.test(row.key)) {
        render.message.write(row);
    }
    else if (row.key === 'count') {
        document.querySelector(
    }
}));

[].forEach.call(document.querySelectorAll('*[data-key]'), function (elem) {
    sock.write(elem.getAttribute('data-key') + '\n');
});

function query (key) {
    return document.querySelector('*[data-db="' + JSON.stringify(key) + '"]');
}
