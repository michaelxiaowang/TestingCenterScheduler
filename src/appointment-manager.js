var db = require('./db');
var exams = db.collection('exams');
var appointments = db.collection('appointments');
var testingcenters = db.collection('testingcenters');

//Exported functions can be used by other file that require this module

/*Creates a new appointment*/
exports.studentCreateAppointment = function(req, callback) {
	var seatNum; //1-numSeats is regular, numSeats+1-numSeats+numSetAside are set-aside

	//Check if appointment starts on hour or half-hour
	if(req.body.minute != 0 && req.body.minute != 30) {
		return callback("Appointment must start on the hour or half hour")
	}

	//Find the exam with this specific id
	exams.findOne({examID: req.body.exam}, function(err, exam) {
		if(err) {
			console.log(err);
		}
		
		//Find which term this exam is for
		testingcenters.findOne({Term: exam.ClassID.substring(exam.ClassID.indexOf('-') + 1)}, function(err, TC) {
			if(err) {
				console.log(err);
			}

			//Convert our parameters to right format
			var date = new Date(req.body.year, req.body.month-1, req.body.day);
			if(req.body.ampm == 'pm') {
				req.body.hour = parseInt(req.body.hour) % 12 + 12;
			}
			var start = req.body.hour*3600000 + req.body.minute*60000;
			var end = start + exam.duration + TC.gapTime*60000; //end time includes gap time

			//Check if start and end are entirely within operating hours
			if(start < TC.OperatingHours[date.getDay()][0] || start + exam.duration > TC.OperatingHours[date.getDay()][1]) {
				return callback("Appointment is not within the operating hours for this day");
			}

			//Check if the appointment is set on a closed day
			for(i in TC.ClosedDates) {
				if(date.getTime() + start >= TC.ClosedDates[i].Start.getTime() && date.getTime() + start + exam.duration <= TC.ClosedDates[i].End.getTime()) {
					return callback("Testing center is closed on this date: Appointment cannot be on a closed date");
				}
			}

			//Check if the appointment is on a reserved period
			for(i in TC.ReservedDates) {
				if(date.getTime() + start >= TC.ReservedDates[i].Start.getTime() && date.getTime() + start + exam.duration <= TC.ReservedDates[i].End.getTime()) {
					return callback("Testing center is reserved for this period: Appointment cannot be on a reserved time");
				}
			}

			//Find all appointments that are on this day
			appointments.find({day: date}).toArray(function(err, Appts) {
				if(err) {
					console.log(err);
				}

				//var availableSlots = 
				
				return callback('hi');
			});	
		});
	
		/*appointments.insert({
			student: req.user.NetID,
			examID: req.body.exam,
			day: date,
			startTime: start,
			endTime: end,
			attended: false
		})*/
		//return callback("Appointment created.");
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