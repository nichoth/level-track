# level-track

keep track of all the active queries from a request to route live updates

# example

In this example we'll subscribe to the range of keys `"f"` through `"p"` and the
singular key `"c"`. The database is then populated with random keys and values
to show that only keys `"f"` through `"p"` inclusive and `"c"` are captured.

``` js
var sub = require('level-sublevel');
var db = sub(require('level')('test.db'));
var tracker = require('level-track')(db);
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
```

output:

```
{ type: 'put', key: 'hn', value: { n: 30 } }
{ type: 'put', key: 'ft', value: { n: 65 } }
{ type: 'put', key: 'ij', value: { n: 49 } }
{ type: 'put', key: 'o', value: { n: 77 } }
{ type: 'put', key: 'g', value: { n: 18 } }
{ type: 'put', key: 'c', value: { n: 9 } }
{ type: 'put', key: 'iz', value: { n: 58 } }
{ type: 'put', key: 'n', value: { n: 60 } }
{ type: 'put', key: 'l', value: { n: 78 } }
{ type: 'put', key: 'h', value: { n: 0 } }
{ type: 'put', key: 'p', value: { n: 88 } }
{ type: 'put', key: 'nl', value: { n: 45 } }
{ type: 'put', key: 'i', value: { n: 80 } }
{ type: 'put', key: 'c', value: { n: 63 } }
{ type: 'put', key: 'mr', value: { n: 10 } }
{ type: 'put', key: 'c', value: { n: 71 } }
```
