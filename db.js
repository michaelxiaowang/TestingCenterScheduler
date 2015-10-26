var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'tcs';

var log = require("./logger").LOG;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(err, d){
	if (err) {
		console.log(err);
	} else {
		console.log('connected to database :: ' + dbName);
	}
	db.createCollection("users", function(err, collection) {
		collection.update({
        	NetID: "admin"
	    },{
        	FirstName: "admin",
        	LastName: "admin",
        	NetID: "admin",
        	Email: "admin@example.com",
        	PasswordHash: "admin",
        	Type: 'admin'
        },{
         	upsert: true
        });
	});
});

module.exports = db;