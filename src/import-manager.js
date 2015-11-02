//require modules
var fs = require('fs');
var csv = require('fast-csv');

//set up logger
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/admin_import.log'),			'admin_import');

//require db
var db = require('./db');
var users = db.collection('users');
var classes = db.collection('classes');
var roster = db.collection('roster');
var appointments = db.collection('appointments'); //used to update superfluous appointments

exports.upload = function(req, res) {
	log4js.getLogger('admin_review').trace("Entering IM.upload");
	//if no file is selected, req.file is null, we will inform the user
	if(req.file == null) {
		log4js.getLogger('admin_review').warn("No file was selected.");
		return "No file was selected.";
	}
	//checks to see if file is not a csv file
	if(req.file.mimetype != 'text/csv') {
		log4js.getLogger('admin_review').error("Not a valid csv file.");
		return "Not a valid csv file."
	} else {
		var stream = fs.createReadStream(req.file.path);
		
		/*We check for file name here instead of in .on('data') so there is one check rather
		than one for every row in the .csv file*/
		if(req.file.originalname == "user.csv") {
			log4js.getLogger('admin_review').info("importing user.csv");
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
			    	//update if user's email is already in db, else insert user
					log4js.getLogger('admin_review').info("{Email:"+data.Email+", FirstName:"+data.FirstName+", NetID:"+data.NetID+", Email:"+data.Email+", PasswordHash:"+data.NetID+", Type:student}");
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
					 log4js.getLogger('admin_review').debug("Import completed.");
			         return "Upload completed.";
		    	});
		} else if(req.file.originalname == "class.csv") {
			log4js.getLogger('admin_review').info("importing class.csv");
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
					log4js.getLogger('admin_review').info("{ClassID:"+data.ClassID+", Class:"+data.Subject + data.CatalogNumber + '-' + data.Section+", Term:"+data.ClassID.substring(data.ClassID.indexOf('-')+1)+", Instructors:"+[data.InstructorNetID]+"}");
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
					 log4js.getLogger('admin_review').debug("Import completed.");
			         return "Upload completed.";
		    	});
		} else if(req.file.originalname == "roster.csv") {
			log4js.getLogger('admin_review').info("importing roster.csv");
			var csvStream = csv
				.fromStream(stream, {
					headers : true,
					discardUnmappedColumns: true
				})
			    .on("data", function(data){
					log4js.getLogger('admin_review').info("{ClassID:"+data.ClassID+"}");
			        roster.update({
			        	ClassID : data.ClassID
			        },{
			        	"$addToSet": {"Roster": data.NetID}
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
					 log4js.getLogger('admin_review').debug("Import completed.");
			         return "Upload completed.";
		    	});
		} else {
			return "Only accepts csv files with name 'user.csv', 'class.csv', or 'roster.csv'.";
		}
	}
	
	fs.unlink(req.file.path); //remove the uploaded file from temp/
};