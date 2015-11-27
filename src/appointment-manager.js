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

		getAvailableTimeslots(exam, function(result) {
			/*var informTimes = "Available times for this exam are:                         " + "\\n"; //some space for formatting
			for(i in result) {
				var dateString = prettyDate(result[i]);
				informTimes = informTimes + dateString + "\\n";
			}
			return callback(informTimes);*/

		});
		

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
			} else if(req.body.hour == 12) {
				req.body.hour = 0;
			}
			var start = parseInt(req.body.hour*3600000) + parseInt(req.body.minute*60000);
			var end = start + exam.duration;

			//Check if start and end are entirely within operating hours
			if(start < TC.OperatingHours[date.getDay()][0] || start + exam.duration > TC.OperatingHours[date.getDay()][1]) {
				console.log(start);
				console.log(end);
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

			//Check if the appointment is entirely within exam period
			if(date.getTime() + start < exam.startDate.getTime() + exam.startTime || date.getTime() + start > exam.endDate.getTime() + exam.endTime ||
				date.getTime() + start + exam.duration < exam.startDate.getTime() + exam.startTime || date.getTime() + start + exam.duration > exam.endDate.getTime() + exam.endTime) {
				return callback("The duration of this exam is not within the exam period");
			}

			//Find all appointments that are on this day
			/*appointments.find({day: date}).toArray(function(err, Appts) {
				if(err) {
					console.log(err);
				}

				//Sort appointments by seat, then start time
				Appts.sort(sortAppt);

				//check appointment for a conflict
				var currentSeat = 1; //The seat currently being examined
				for(i in Appts) {

				}
			});*/

			appointments.find({student: req.user.NetID}).toArray(function(err, sameDay) {
				if(err) {
					console.log(err);
				}
				//If there is more than 0 appointments
				if(sameDay.length > 0) {
					for(i in sameDay) {
						if((sameDay[i].startTime >= start && sameDay[i].startTime < end) ||
							(sameDay[i].endTime > start && sameDay[i].endTime < end)) {
							return callback("You already have an exam in this time period");
						}
					}
				}
				appointments.insert({
					student: req.user.NetID,
					examID: req.body.exam,
					day: date,
					startTime: start,
					endTime: end,
					seat: 1,
					attended: false
				})

			});	
			return callback("Appointment created.");	
		});
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

function sortAppt(appt1, appt2) {
	if(appt1.seatNumber < appt2.seatNumber) {
		return -1;
	}
	if(appt2.seatNumber < appt1.seatNumber) {
		return 1;
	}
	if(appt1.startTime < appt2.startTime) {
		return -1;
	}
	if(appt2.startTime < appt1.startTime) {
		return 1;
	}
}

function sortApptByTime(appt1, appt2) {
	if(appt1.startTime < appt2.startTime) {
		return -1;
	}
	if(appt2.startTime < appt1.startTime) {
		return 1;
	}
}

function sortApptBySeat(appt1, appt2) {
	if(appt1.seatNumber < appt2.seatNumber) {
		return -1;
	}
	if(appt2.seatNumber < appt1.seatNumber) {
		return 1;
	}
}

//Gets the format of a Date in: Day of Week, Month Day of Month, Year
function prettyDate(date) {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	var ampm = "AM";
	if(date.getHours() >= 12) {
		ampm = "PM";
	}
	var hours = date.getHours() % 12;
	if(hours == 0) {
		hours = 12;
	}
	var minutes = date.getMinutes();
	if(minutes < 10) {
		minutes = "0" + minutes;
	}
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + hours + ":" + minutes + ampm;
}

function getAvailableTimeslots(exam, callback) {

	//Find the testing center for this term
	testingcenters.findOne({Term: exam.ClassID.substring(exam.ClassID.indexOf('-') + 1)}, function(err, TC) {

		//If the exam period doesn't start on a half hour, find the first half hour
		if(exam.startTime % 1800000 != 0) {
			var halfHour = exam.startTime + 1800000 - (exam.startTime % 1800000);
		} else {
			var halfHour = exam.startTime + exam.startDate.getTime();
		}

		var end = exam.endTime + exam.endDate.getTime(); //end of exam period
		var validTimes = []; //Instantiate new array to hold valid time slots

		//We examine each half hour in the exam period
		for(var z = halfHour; z < end; z += 1800000) {
			var withinOH = false;
			var notRD = false;
			var notCD = false;

			endOfExam = z + exam.duration;

			//If the half hour isn't in operating hours, go to next half hour
			if(z % 86400000 >= TC.OperatingHours[new Date(z).getDay()][0] &&
				endOfExam % 86400000 <= TC.OperatingHours[new Date(z).getDay()][1]) {
				withinOH = true;
			} else {
				continue;
			}

			//If the half hour isn't within reserved periods
			for(i in TC.ReservedDates) {
				if(!((z > TC.ReservedDates[i].Start.getTime() && z < TC.ReservedDates[i].End.getTime()) ||
					(endOfExam > TC.ReservedDates[i].Start.getTime() && endOfExam < TC.ReservedDates[i].End.getTime()))) {
					notRD = true;
				}
			}

			//If the half hour isn't within closed periods
			for(i in TC.ClosedDates) {
				if(!((z > TC.ClosedDates[i].Start.getTime() && z < TC.ClosedDates[i].End.getTime()) ||
					(endOfExam > TC.ClosedDates[i].Start.getTime() && endOfExam < TC.ClosedDates[i].End.getTime()))) {
					notCD = true;
				}
			}	

			//If all three time conditions are met
			if(withinOH && notRD && notCD) {
				var d = new Date(z);
				d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(z % 86400000/3600000), Math.floor(z % 86400000 % 3600000/60000));
				validTimes.push(d);
			}
		}

		//Now we examine all other appointments that use this time period
		var availableTimes = [] //Holds all timeslots which are available

		//Get every appointment in exam period
		appointments.find({startTime: { $gte: halfHour, $lte: end}}).toArray(function(err, Appts) {

			//For each valid time
			for(var i = 0; i < validTimes.length; i++) {
				var taken = false;
				//For each seat
				for(var j = 1; j <= TC.numSeats + TC.numSetAside; j++) {
					//For each appointment
					for(var k = 0; k < Appts.length; k++) {
						if(Appts[k].seat == j && 
							Appts[k].startTime.getTime() >= validTimes[i].getTime() && 
							Appts[k].startTime.getTime() <= validTimes[i].getTime() + exam.duration + TC.gapTime ||
							Appts[k].endTime.getTime() >= validTimes[i].getTime() && 
							Appts[k].endTime.getTime() <= validTimes[i].getTime() + exam.duration + TC.gapTime) {
							taken = true;
						}
					}
				}
				if(!taken) {
					availableTimes.push(validTimes[i]);
				}
			}

			return callback(availableTimes);
		});
	});
}