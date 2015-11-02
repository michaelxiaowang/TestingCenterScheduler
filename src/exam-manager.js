var db = require('./db');
var classes = db.collection('classes');
var roster = db.collection('roster');
var exams = db.collection('exams');

//set up logger
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/instructor_request.log'),	'instructor_request');
log4js.addAppender(log4js.appenders.file('logs/instructor_cancel.log'),		'instructor_cancel');
log4js.addAppender(log4js.appenders.file('logs/admin_review.log'),			'admin_review');

//Create an exam request
exports.createExam = function(req, callback) {
	log4js.getLogger('instructor_request').trace("Entering EM.createExam");
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
		log4js.getLogger('instructor_request').info("course exam");
		//If the name field is empty, inform user
		if(req.body.name[0] == "") {
				log4js.getLogger('instructor_request').warn("Must have Exam Name field.");
				return callback("Must have Exam Name field");
		}
		//Find a course with the course name
		classes.findOne({Class: req.body.course}, function(err, course) {
			if(err) {
				console.log(err);
				log4js.getLogger('instructor_request').error(err);
			}
			//Get the class id from course name
			ClassID = course.ClassID;
			//Set name of the exam
			var examID = req.body.course + "_" + req.body.name[0];
			//Find the roster for this class
			roster.findOne({"ClassID": ClassID}, function(err, roster) {
				if(err) {
					console.log(err);
					log4js.getLogger('instructor_request').error(err);
				}
				Roster = roster.Roster;
			});
			log4js.getLogger('instructor_request').info("{ClassID:"+ClassID+", examID:"+examID", Instructors:"+req.user.NetID+", Roster:"+Roster+", startTime:"+startTime+", startDate:"+startDate+", endTime:"+endTime+", endDate:"+endDate+", duration:"+duration+", adhoc:"+adhoc+", status:pending}");
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
			log4js.getLogger('instructor_request').debug("Exam created.");
			//Inform user request was successsful
			return callback("Success");
		});
	} else { //is adhoc
		log4js.getLogger('instructor_request').info("ad-hoc exam");
		//If the name field is empty, inform user
		if(req.body.name[1] == "") {
				log4js.getLogger('instructor_request').warn("Must have Exam Name field.");
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
		log4js.getLogger('instructor_request').info("{ClassID:"+ClassID+", examID:"+examID", Instructors:"+req.user.NetID+", Roster:"+Roster+", startTime:"+startTime+", startDate:"+startDate+", endTime:"+endTime+", endDate:"+endDate+", duration:"+duration+", adhoc:"+adhoc+", status:pending}");
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
		log4js.getLogger('instructor_request').debug("Exam created.");
		//Inform user request was successsful
		return callback("Success");
	}
}

//Remove a pending exam request
exports.removePendingExam = function(req, callback) {
	log4js.getLogger('instructor_cancel').trace("Entering EM.removePendingExam");
	//Remove only if numbers of exams > 0
	exams.count(function(err, count) {
		if(count > 0) {
			exams.findOne({examID: req.body.exam}, function(err, exam) {
				if(err) {
					console.log(err);
					log4js.getLogger('instructor_cancel').error(err);
				}
				//remove the exam only if it is pending
				if (exam.status == "pending") {
					log4js.getLogger('instructor_cancel').info("{examID:"+req.body.exam+"}");
					exams.remove({examID: req.body.exam});
					//Inform user that removing was successful
					log4js.getLogger('instructor_cancel').debug("Exam removed.");
					return callback("Exam removed.");
				} else {
					//User cannot remove exam that is not pending
					log4js.getLogger('instructor_cancel').warn("Cannot remove exam that does not have the status 'pending'.");
					return callback("Cannot remove exam that does not have the status 'pending'.");
				}
			});	
		} else {
			log4js.getLogger('instructor_cancel').warn("Cannot cancel because no exam is selected.");
			return callback("Cannot cancel because no exam is selected.");
		}
	});
}

//Approve exam
exports.approvePendingExam = function(exam) {
	log4js.getLogger('admin_review').trace("Entering EM.approvePendingExam");
	log4js.getLogger('admin_review').info("{examID:+"+exam+", status: approved}");
	exams.update({
		examID: exam
	},{
		$set: {status: "approved"}
	});
	log4js.getLogger('admin_checkin').debug("Exam approved.");
}

//Deny exam
exports.denyPendingExam = function(exam) {
	log4js.getLogger('admin_review').trace("Entering EM.denyPendingExam");
	log4js.getLogger('admin_review').info("{examID:+"+exam+"}");
	exams.remove({examID: exam});
	log4js.getLogger('admin_checkin').debug("Exam removed.");
}