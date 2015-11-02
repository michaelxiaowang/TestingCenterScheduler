var db = require('./db');
var exams = db.collection('exams');
var appointments = db.collection('appointments');

//set up logger
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/student_add.log'),			'student_add');
log4js.addAppender(log4js.appenders.file('logs/student_cancel.log'),		'student_cancel');
log4js.addAppender(log4js.appenders.file('logs/admin_checkin.log'),			'admin_checkin');

//Exported functions can be used by other file that require this module

/*Creates a new appointment*/
exports.studentCreateAppointment = function(req, callback) {
	log4js.getLogger('student_add').trace("Entering AM.studentCreateAppointment");
	exams.findOne({examID: req.body.exam}, function(err, exam) {
		if(err) {
			console.log(err);
			log4js.getLogger('student_add').error(err);
		}
		var date = new Date((new Date).getFullYear(), req.body.month-1, req.body.day);
		if(req.body.ampm == 'pm') {
			req.body.hour += 12;
		}
		var start = req.body.hour*3600000 + req.body.minute*60000;
		var end = start + exam.duration;
		log4js.getLogger('student_add').info("{student:"+req.user.NetID+", examID:"+req.body.exam+", day:"+date+", startTime:"+start+", endTime:"+end+", attended:false}");
		appointments.insert({
			student: req.user.NetID,
			examID: req.body.exam,
			day: date,
			startTime: start,
			endTime: end,
			attended: false
		})
		log4js.getLogger('student_add').debug("Appointment created.");
		return callback("Appointment created.")
	});
}

/*Cancels an appointment*/
exports.cancelAppointment = function(req, callback) {
	log4js.getLogger('student_cancel').trace("Entering AM.cancelAppointment");
	//Remove only if numbers of exams > 0
	appointments.count(function(err, count) {
		if(count > 0) {
			appointments.findOne({examID: req.body.exam}, function(err, exam) {
				if(err) {
					console.log(err);
					log4js.getLogger('student_cancel').error(err);
				}
				//remove the appointment only if it did not pass yet
				//if (exam.status == "pending") {
				log4js.getLogger('student_add').info("{examID:"+req.body.exam+"}");
				appointments.remove({examID: req.body.exam});
				log4js.getLogger('student_add').debug("Appointment removed.");
				return callback("Appointment cancelled.");
					//Inform user that removing was successful
					//return callback("Exam removed.");
				//} else {
					//User cannot remove past appointment
				//	return callback("Cannot remove exam that does not have the status 'pending'.");
				//}
			});	
		} else {
			log4js.getLogger('student_add').warn("Cannot cancel because no exam is selected.");
			return callback("Cannot cancel because no exam is selected.");
		}
	});
}

/*Confirm an appointment*/
exports.confirmAppointment = function(student, exam) {
	log4js.getLogger('admin_checkin').trace("Entering AM.confirmAppointment");
	log4js.getLogger('admin_checkin').info("{student:"+student+", examID:"+exam+", attended:true}");
	appointments.update({
		"student": student,
		"examID": exam
	},{
		$set: {attended: true}
	});
	log4js.getLogger('admin_checkin').debug("Appointment confirmed.");
}

//Admin cancel appointment
exports.adminCancel = function(student, exam) {
	appointments.remove({"student": student, examID: exam});
}