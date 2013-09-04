var test = require('tape');
var sub = require('level-sublevel');
var db = sub(require('level-test')()());
var tracker = require('../')(db);
var through = require('through');

var expected = [
    { type: 'put', key: 'gorilla', value: { n: 6 } },
    { type: 'put', key: 'hack', value: { n: 2 } },
    { type: 'put', key: 'p', value: { n: 11 } },
    { type: 'put', key: 'f', value: { n: 2 } }
];

test('put keys', function (t) {
    t.plan(expected.length * 2);
    var tr = tracker();
    tr.pipe(through(function (row) {
        t.ok(row.key >= 'f' && row.key <= 'p' || row.key === 'c');
        t.deepEqual(row, expected.shift());
    }));
    
    tr.write('"c"\n');
    tr.write('["f","p"]\n');
    
    db.put('abbot', { n: 5 });
    db.put('potato', { n: 4 });
    db.put('gorilla', { n: 6 });
    db.put('hack', { n: 2 });
    db.put('queen', { n: 50 });
    db.put('p', { n: 11 });
    db.put('f', { n: 2 });
    db.put('xylophone', { value: 555 });
    
    t.on('end', function () { tr.end() });
});
