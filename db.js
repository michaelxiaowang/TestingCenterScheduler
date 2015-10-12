var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'tcs';

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(err, d){
	if (err) {
		console.log(err);
	} else {
		console.log('connected to database :: ' + dbName);
	}
});

module.exports = db;