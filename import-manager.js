//require modules
var fs = require('fs');
var csv = require('fast-csv');

//require db
var db = require('./db');
var userdb = db.collection('userdb');
var classdb = db.collection('classdb');
var appointmentdb = db.collection('appointmentdb');

exports.upload = function(req, res) {
	//check to see if file type is correct
	//if(req.file.mimetype != 'text/csv') {
		console.log("not a valid csv file")
	//} else {
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
			        userdb.update({
			        	Email: data.Email
			        },{
			        	FirstName: data.FirstName,
			        	LastName: data.LastName,
			        	NetID: data.NetID,
			        	Email: data.Email,
			        	PasswordHash: data.NetID,
			        	Type: 'Student'
			        },{
			         	upsert: true
			        });
			    })
			    .on("end", function(){
			         console.log("done");
		    });
		} else {console.log('not user.csv')}
	//}
	
	//removed the uploaded file
	fs.unlink(req.file.path);
};