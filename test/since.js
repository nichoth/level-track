var test = require('tape');
var sub = require('level-sublevel');
var db = sub(require('level-test')()());
var tracker = require('../')(db);
var through = require('through');

var expected = [
    { type: 'put', key: 'e', value: { n: 14 } },
    { type: 'put', key: 'f', value: { n: 15 } },
    { type: 'put', key: 'g', value: { n: 16 } },
    { type: 'put', key: 'h', value: { n: 17 } },
    { type: 'put', key: 'i', value: { n: 18 } },
    { type: 'put', key: 'j', value: { n: 19 } },
    { type: 'put', key: 'b', value: { n: 101 } },
    { type: 'put', key: 'f', value: { n: 105 } },
];

test('setup', function (t) {
    db.batch([
        { type: 'put', key: 'a', value: { n: 10 } },
        { type: 'put', key: 'b', value: { n: 11 } },
        { type: 'put', key: 'c', value: { n: 12 } },
        { type: 'put', key: 'x', value: { n: 80 } },
        { type: 'put', key: 'd', value: { n: 13 } },
        { type: 'put', key: 'e', value: { n: 14 } },
        { type: 'put', key: 'y', value: { n: 81 } },
        { type: 'put', key: 'f', value: { n: 15 } },
        { type: 'put', key: 'z', value: { n: 82 } }
    ], function () { t.end() });
});
 
test('range with since', function (t) {
    t.plan(expected.length * 2);
    var tr = tracker();
    tr.pipe(through(function (row) {
        t.ok(row.key >= 'f' && row.key <= 'p' || row.key === 'c');
        t.deepEqual(row, expected.shift());
        
        if (row.key === 'j') {
            db.batch([
                { type: 'put', key: 'g', value: { n: 16 } },
                { type: 'put', key: 'h', value: { n: 17 } },
                { type: 'put', key: 'i', value: { n: 18 } },
                { type: 'put', key: 'j', value: { n: 19 } },
                { type: 'put', key: 'k', value: { n: 20 } },
                { type: 'put', key: 'l', value: { n: 21 } },
                { type: 'put', key: 'm', value: { n: 22 } },
                { type: 'put', key: 'n', value: { n: 23 } },
                { type: 'put', key: 'b', value: { n: 101 } },
                { type: 'put', key: 'f', value: { n: 105 } }
            ], function () { t.end() });
        }
    }));
    
    tr.write('["a","j","d"]\n');
    
    t.on('end', function () { tr.end() });
});
