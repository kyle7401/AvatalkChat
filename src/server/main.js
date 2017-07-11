// Load modules
var socket = require('socket.io');
var express = require('express');
var http = require('http');
var init = require('./init.js');

// 추가
var debug = require('debug')('spika:server');

// initialization
var app = express();

// http://enable-cors.org/server_expressjs.html
// http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var server = http.createServer(app);
var port = init.port;
var io = socket.listen(server);

// Start Spika as stand alone server
var spika = require('./index.js');

var SpikaServer = new spika(app,io,init);
    
server.listen(init.port, function(){
    console.log('Server listening on port ' + init.port + '!');
});