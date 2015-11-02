var db = require('./db');
var classes = db.collection('classes');
var roster = db.collection('roster');
var exams = db.collection('exams');

//Create an exam request
exports.createExam = function(req, callback) {
	var students	= req.body.students;//ad-hoc
	
	//Set the variables related to exam term and time
	var term = req.body.term;
	var startDate = new Date(req.body.start_month + " " + req.body.start_day + ", " + (new Date).getFullYear().toString());
	var endDate = new Date(req.body.end_month + " " + req.body.end_day + ", " + (new Date).getFullYear().toString());
	var startTime = parseInt(req.body.start_hour) * 3600000 + parseInt(req.body.start_minute) * 60000;
	if(req.body.start_ampm == 'pm') {
		startTime += 43200000;
	}
	var endTime = parseInt(req.body.end_hour) * 3600000 + parseInt(req.body.end_minute) * 60000;
	if(req.body.end_ampm == 'pm') {
		endTime += 43200000;
	}
	var duration = req.body.duration * 60000;
	
	//Set the variables that differ based on whether exam is adhoc or not.
	var adhoc = (req.body.type == "ad-hoc");
	//If not adhoc
	if(!adhoc) {
		//If the name field is empty, inform user
		if(req.body.name[0] == "") {
				return callback("Must have Exam Name field");
		}
		//Find a course with the course name
		classes.findOne({Class: req.body.course}, function(err, course) {
			if(err) {
				console.log(err);
			}
			//Get the class id from course name
			ClassID = course.ClassID;
			//Set name of the exam
			var examID = req.body.course + "_" + req.body.name[0];
			//Find the roster for this class
			roster.findOne({"ClassID": ClassID}, function(err, roster) {
				if(err) {
					console.log(err);
				}
				Roster = roster.Roster;
			})
			//Insert the exam into database
			exams.insert({
				"ClassID": ClassID,
				"examID": examID,
				"Instructors": req.user.NetID,
				"Roster": Roster,
				"startTime": startTime,
				"startDate": startDate,
				"endTime": endTime,
				"endDate": endDate,
				"duration": duration,
				"adhoc": adhoc,
				"status": "pending"
			});
			//Inform user request was successsful
			return callback("Success");
		});
	} else { //is adhoc
		//If the name field is empty, inform user
		if(req.body.name[1] == "") {
				return callback("Must have Exam Name field");
		}
		var ClassID = "adhoc"; //ClassID is adhoc
		var examID = ClassID + "_" + req.body.name[1]; //Set name to adhoc_(name)
		var Roster = []; //create empty roster to populate
		var students = (req.body.students).split('\r\n'); //split the textfield into an array with elements holding each line
		for(i in students) {
			//for each line, split the line by commas
			var studentInfo = students[i].split(', ');
			//insert the netid into roster
			Roster.push(studentInfo[0]);
		}
		//Insert the exam into database
		exams.insert({
			"ClassID": ClassID,
			"examID": examID,
			"Instructors": req.user.NetID,
			"Roster": Roster,
			"startTime": startTime,
			"startDate": startDate,
			"endTime": endTime,
			"endDate": endDate,
			"duration": duration,
			"adhoc": adhoc,
			"status": "pending"
		});
		//Inform user request was successsful
		return callback("Success");
	}
}

//Remove a pending exam request
exports.removePendingExam = function(req, callback) {
	//Remove only if numbers of exams > 0
	exams.count(function(err, count) {
		if(count > 0) {
			exams.findOne({examID: req.body.exam}, function(err, exam) {
				if(err) {
					console.log(err);
				}
				//remove the exam only if it is pending
				if (exam.status == "pending") {
					exams.remove({examID: req.body.exam});
					//Inform user that removing was successful
					return callback("Exam removed.");
				} else {
					//User cannot remove exam that is not pending
					return callback("Cannot remove exam that does not have the status 'pending'.");
				}
			});	
		}
	});
}

//Approve exam
exports.approvePendingExam = function(exam) {
	exams.update({
		examID: exam
	},{
		$set: {status: "approved"}
	});
}

//Deny exam
exports.denyPendingExam = function(exam) {
	exams.remove({examID: exam});
}