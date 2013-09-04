var sub = require('level-sublevel');
var db = sub(require('level')('test.db'));
var tracker = require('../')(db);
var through = require('through');

var t = tracker();
t.pipe(through(function (row) {
    console.log(row);
}));

t.write('"c"\n');
t.write('["f","p"]\n');

setInterval(function () {
    var l = Math.floor(Math.random() * 2) + 1;
    var key = '';
    for (var i = 0; i < l; i++) {
        key += String.fromCharCode(Math.random() * 26 + 97);
    }
    db.put(key, { n: Math.floor(Math.random() * 100) });
}, 250);
