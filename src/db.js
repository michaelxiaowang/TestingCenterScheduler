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
	//Create initial user objects for easy testing, will be removed in live version
	db.createCollection("users", function(err, collection) {
		//admin obj
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
        //student obj
        collection.update({
        	NetID: "student"
	    },{
        	FirstName: "student",
        	LastName: "student",
        	NetID: "student",
        	Email: "student@example.com",
        	PasswordHash: "student",
        	Type: 'student'
        },{
         	upsert: true
        });
        //instructor obj
        collection.update({
        	NetID: "instructor"
	    },{
        	FirstName: "instructor",
        	LastName: "instructor",
        	NetID: "instructor",
        	Email: "instructor@example.com",
        	PasswordHash: "instructor",
        	Type: 'instructor'
        },{
         	upsert: true
        });
	});
});

module.exports = db;