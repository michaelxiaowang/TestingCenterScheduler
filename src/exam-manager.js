var db = require('./db');
var exams = db.collection('exams');

//Create an exam request
exports.createExam = function(req) {
	//var duration	= req.body.duration;
	var students	= req.body.students;//ad-hoc
	var adhoc = (req.body.type == "ad-hoc");
	if(!adhoc) {
		//var classID = req.body.course;
		var ClassID = "11111-1158"
		var Roster = ['student'];
	} else {
		var ClassID = req.body.name;
		var Roster = req.body.students;
	}
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
	exams.insert({
		"ClassID": ClassID,
		"examID": ClassID,
		"Instructors": req.user.NetID,
		"Roster": Roster,
		"startTime": startTime,
		"startDate": startDate,
		"endTime": endTime,
		"endDate": endDate,
		"adhoc": adhoc,
		"status": "pending"
	});
}

//Remove a pending exam request
exports.removePendingExam = function(req) {
	//Remove only if numbers of exams > 0
	exams.count(function(err, count) {
		if(count > 0) {
			exams.findOne({examID: req.body.exam}, function(err, exam) {
				//remove the exam only if it is pending
				if (exam.status == "pending") {
					exams.remove({examID: req.body.exam});
					return "Exam removed."
				} else {
					return "Cannot remove exam that does not have the status 'pending'."
				}
			});	
		}
	});
}