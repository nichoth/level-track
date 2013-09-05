var level = require('level');
var sub = require('level-sublevel');
var db = sub(level('/tmp/test.db', { valueEncoding: 'json' }));
var tracker = require('../')(db);

var fs = require('fs');
var http = require('http');

var trumpet = require('trumpet');
var ecstatic = require('ecstatic')(__dirname + '/server');
var concat = require('concat-stream');

var server = http.createServer(function (req, res) {
    if (req.method === 'GET' && req.url === '/') {
        var tr = trumpet();
        
        var counter = tr.createWriteStream('#counter');
        db.get('counter', function (err, value) {
            counter.end(value);
        });
        
        var messages = tr.createWriteStream('#messages');
        db.createReadStream()
        
        readStream('index.html').pipe(tr);
    }
    else if (req.method === 'POST') {
        req.pipe(concat(function (body) {
            var key = req.url.replace(/^\//, '');
            db.put(key, JSON.parse(body), function (err) {
                if (err) res.end(err + '\n')
                else res.end(key + '\n')
            });
        }));
    }
    else ecstatic(req, res);
});
server.listen(8000);

var shoe = require('shoe');
var sock = shoe(function (stream) {
    stream.pipe(tracker()).pipe(stream);
});
sock.install(server, '/sock');

function readStream (file) {
    return fs.createReadStream(__dirname + '/server/' + file);
}
