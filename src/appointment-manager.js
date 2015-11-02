var db = require('./db');
var exams = db.collection('exams');
var appointments = db.collection('appointments');

//Exported functions can be used by other file that require this module

/*Creates a new appointment*/
exports.studentCreateAppointment = function(req) {
	console.log(req.body.exam);
	exams.findOne({examID: req.body.exam}, function(err, exam) {
		if(err) {
			console.log(err);
		}
		console.log(exam);
		var examID 	= req.body.exam;
		var date = new Date(req.body.month + " " + req.body.day + (new Date).getFullYear().toString());
		if(req.body.ampm == 'pm') {
			req.body.hour += 12;
		}
		console.log(exam);
		//var duration = req.body.hour*3600000 + req.body.minute*60000 + exam.duration;

	});
}