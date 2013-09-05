var hyperspace = require('hyperspace');

var fs = require('fs');
var html = fs.readFileSync(__dirname + '/message.html');

module.exports = function () {
    return hyperspace(html, function (row) {
        return {
            'data-key': row.key,
            '.who': row.value.who,
            '.time': row.value.time,
            '.body': row.value.body
        };
    });
};
