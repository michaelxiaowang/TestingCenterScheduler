//require modules
var fs = require('fs');
var csv = require('fast-csv');

//require db
var db = require('./db');
var users = db.collection('users');
var classes = db.collection('classes');
var appointments = db.collection('appointments');

var log = require("./logger").LOG;

exports.upload = function(req, res) {
	//check to see if file type is correct
	if(req.file.mimetype != 'text/csv') {
	} else {
		var stream = fs.createReadStream(req.file.path);
		
		/*We check for file name here instead of in .on('data') so there is one check rather
		than one for every row in the .csv file*/
		if(req.file.originalname == "user.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
			    	//update if user's email is already in db, else insert user
			        users.update({
			        	Email: data.Email
			        },{
			        	FirstName: data.FirstName,
			        	LastName: data.LastName,
			        	NetID: data.NetID,
			        	Email: data.Email,
			        	PasswordHash: data.NetID,
			        	Type: 'student'
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         console.log("done");
		    });
		} else if(req.file.originalname == "class.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
			        classes.update({
			        	ClassID : data.ClassID
			        },{
			        	ClassID : data.ClassID,
			        	Class: data.Subject + data.CatalogNumber + '-' + data.Section,
			        	Term: data.ClassID.substring(data.ClassID.indexOf('-')+1), //Extract the term which appears after the '-' character

			        	
			        },{
			        	"$pushAll": {"Instructors": [data.InstructorNetID]},
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         console.log("done");
		    });
		} else if(req.file.originalname == "roster.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
			        classes.update({
			        	ClassID : data.ClassID
			        },{
			        	"$pushAll": {"Roster": [data.NetID]}
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         console.log("done");
		    });
		}
	}
	
	//removed the uploaded file from temp/
	fs.unlink(req.file.path);
};