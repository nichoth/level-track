var through = require('through');
var combine = require('stream-combiner');
var split = require('split');

module.exports = function (db) {
    var trackingKeys = {};
    var trackingRange = [];
    db.hooks.post({ start: '', end: '~' }, function (change) {
        if (trackingKeys[change.key]) {
            trackingKeys[change.key].forEach(function (stream) {
                stream.queue(change);
            });
        }
        for (var i = 0, l = trackingRange.length; i < l; i++) {
            // todo: binary search for start and end keys
            var r = trackingRange[i];
            if (change.key >= r.start && change.key <= r.end) {
                r.stream.queue(change);
            }
        }
    });
    
    return function () {
        var localKeys = [];
        var localRange = [];
        var output = through(write, end);
        return combine(split(), output);
        
        function write (line) {
            try { var row = JSON.parse(line) }
            catch (e) { return }
            
            if (typeof row === 'string') {
                localKeys.push(row);
                if (!trackingKeys[row]) trackingKeys[row] = [];
                trackingKeys[row].push(output);
            }
            else if (Array.isArray(row)) {
                var ref = { start: row[0], end: row[1], stream: output };
                trackingRange.push(ref);
                localRange.push(ref);
            }
            else if (row && typeof row === 'object' && row.rm) {
                // TODO: removing subscriptions
            }
        }
        
        function end () {
            localKeys.forEach(function (key) {
                var xs = trackingKeys[key];
                if (!xs) return;
                var ix = xs.indexOf(output);
                if (ix >= 0) xs.splice(ix, 1);
                if (ix.length === 0) delete trackingKeys[key];
            });
            localRange.forEach(function (r) {
                var ix = trackingRange.indexOf(r);
                if (ix >= 0) trackingRange.splice(ix, 1);
            });
            output.queue(null);
        }
    };
};
