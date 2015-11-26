//require node modules
var fs = require('fs');
var csv = require('fast-csv');

//require db and necessary collections
var db = require('./db');
var users = db.collection('users');
var classes = db.collection('classes');
var roster = db.collection('roster');
var appointments = db.collection('appointments'); //used to update superfluous appointments

exports.upload = function(req, res, callback) {
	//if no file is selected, req.file is null, we will inform the user
	if(req.file == null) {
		return callback("No file was selected.");
	}
	//checks to see if file has csv extension
	if(req.file.originalname.indexOf('.csv') == -1) {
		return callback("File does not have .csv extension.");
	} else {
		var stream = fs.createReadStream(req.file.path);
		
		/*We check for file name here instead of in .on('data') so there is one check rather
		than one for every row in the .csv file*/
		if(req.file.originalname == "user.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers: true,
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
			         return callback("Upload completed.");
		    	});
		} else if(req.file.originalname == "class.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true,
				})
			    .on("data", function(data) {
			    	classes.update({
			        	ClassID : data.ClassID
			        },{
			        	ClassID : data.ClassID,
			        	Class: data.Subject + data.CatalogNumber + '-' + data.Section,
			        	Term: data.ClassID.substring(data.ClassID.indexOf('-')+1), //Extract the term which appears after the '-' character
			        	Instructors: [data.InstructorNetID]
			        },{
			         	upsert: true
			        });
			        //Create a instructor user
			        users.update({
			        	Email: data.InstructorNetID
			        },{
			        	FirstName: data.InstructorNetID,
			        	LastName: data.InstructorNetID,
			        	NetID: data.InstructorNetID,
			        	Email: data.Email + "@example.com",
			        	PasswordHash: data.InstructorNetID,
			        	Type: 'instructor'
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         return callback("Upload completed.");
		    	});
		} else if(req.file.originalname == "roster.csv") {
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
			        roster.update({
			        	ClassID : data.ClassID
			        },{
			        	"$addToSet": {"Roster": data.NetID}
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         return callback("Upload completed.");
		    	});
		} else {
			return callback("Only accepts csv files with name 'user.csv', 'class.csv', or 'roster.csv'.");
		}
	}
	
	fs.unlink(req.file.path); //remove the uploaded file from temp/
};