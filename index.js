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
        for (var i = 0, l = trackingRange; i < l; i++) {
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
        
        function write (buf) {
            var line = typeof line === 'string' ? line : buf.toString('utf8');
            if (/^[A-Fa-f0-9]+$/.test(line)) {
                localKeys.push(line);
                if (!trackingKeys[line]) trackingKeys[line] = [];
                trackingKeys[line].push(output);
            }
            else if (/^[A-Fa-f0-9]+-[A-Fa-f0-9]+$/.test(line)) {
                var parts = line.split('-');
                var ref = { start: parts[0], end: parts[1], stream: output };
                trackingRange.push(ref);
                localRange.push(ref);
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
