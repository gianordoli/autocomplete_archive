/*-------------------- MODULES --------------------*/
var express = require('express');
var app = express();
var server = app.listen(3011, function(){
	console.log('Listening on 3011');
});
var io = require('socket.io').listen(server);
var MongoClient = require('mongodb').MongoClient;


/*-------------------- SETUP --------------------*/

app.use(function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('incoming request from ---> ' + ip);
	var url = req.originalUrl;
	console.log('### requesting ---> ' + url);
	next();
});

app.use('/', express.static(__dirname + '/public'));
