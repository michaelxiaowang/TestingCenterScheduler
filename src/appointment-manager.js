var db = require('./db');
var exams = db.collection('exams');
var appointments = db.collection('appointments');

//Exported functions can be used by other file that require this module

/*Creates a new appointment*/
exports.studentCreateAppointment = function(req, callback) {
	exams.findOne({examID: req.body.exam}, function(err, exam) {
		if(err) {
			console.log(err);
		}
		var date = new Date((new Date).getFullYear(), req.body.month-1, req.body.day);
		if(req.body.ampm == 'pm') {
			req.body.hour += 12;
		}
		var start = req.body.hour*3600000 + req.body.minute*60000;
		var end = start + exam.duration;
		appointments.insert({
			student: req.user.NetID,
			examID: req.body.exam,
			day: date,
			startTime: start,
			endTime: end,
			attended: false
		})
		return callback("Appointment created.")
	});
}

/*Cancels an appointment*/
exports.cancelAppointment = function(req, callback) {
	//Remove only if numbers of exams > 0
	appointments.count(function(err, count) {
		if(count > 0) {
			appointments.findOne({examID: req.body.exam}, function(err, exam) {
				if(err) {
					console.log(err);
				}
				//remove the appointment only if it did not pass yet
				//if (exam.status == "pending") {
				appointments.remove({examID: req.body.exam});
				return callback("Appointment cancelled.");
					//Inform user that removing was successful
					//return callback("Exam removed.");
				//} else {
					//User cannot remove past appointment
				//	return callback("Cannot remove exam that does not have the status 'pending'.");
				//}
			});	
		} else {
			return callback("Cannot cancel because no exam is selected.");
		}
	});
}

/*Confirm an appointment*/
exports.confirmAppointment = function(student, exam) {
	appointments.update({
		"student": student,
		"examID": exam
	},{
		$set: {attended: true}
	});
}

//Admin cancel appointment
exports.adminCancel = function(student, exam) {
	appointments.remove({"student": student, examID: exam});
}