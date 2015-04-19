var http = require('http');
var xkcd = require('xkcd-imgs');

var server = http.createServer(function (request, resp) {
    var headers = {};
    headers['Content-Type'] = 'application/json';
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    // send headers
    resp.writeHead(200, headers);

    xkcd.img(function(err, res){
        if(err){
            return resp.end(JSON.stringify({ error: err.message }));
        }
        return resp.end(JSON.stringify(res));
    });
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log("Server running at http://127.0.0.1/ on port " + port);
});

