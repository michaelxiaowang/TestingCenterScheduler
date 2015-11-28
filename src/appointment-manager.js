var db = require('./db');
var exams = db.collection('exams');
var appointments = db.collection('appointments');
var testingcenters = db.collection('testingcenters');

//Exported functions can be used by other file that require this module

/*Creates a new appointment*/
exports.studentCreateAppointment = function(req, callback) {

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
		testingcenters.findOne({Term: exam.term}, function(err, TC) {
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
			appointments.find({day: date}).toArray(function(err, Appts) {
				if(err) {
					console.log(err);
				}

				var occupiedSeats = []; //holds info whether seat is empty, occupied or occupied by appt for the same exam

				for(var i = 0; i < TC.numSeats; i++) {
					occupiedSeats.push(0); //0 means seat is empty, we will do analysis
				}

				for(i in Appts) {
					//If there is an appointment that overlaps
					if((Appts[i].startTime >= start && Appts[i].startTime < end) ||
						(Appts[i].endTime > start && Appts[i].endTime < end)) {
						if(Appts[i].examID == req.body.exam) {
							//If it is the same exam occupying that spot
							if(Appts[i].seatType == 'normal') {
								occupiedSeats[Appts[i].seat-1] = 2;
							}
							
						} else {
							//If it is a different exam occupying that spot
							if(Appts[i].seatType == 'normal') {
								occupiedSeats[Appts[i].seat-1] = 1;
							}
						}
					}
				}

				//Now find a seat from occupied seats
				var firstAvailable = 0; //first available seat
				var seatNum = 0;
				for (i in occupiedSeats) {
					if(occupiedSeats[i] == 0) { //If the seat is empty
						if(i == 0) { //If this is the first seat
							if(occupiedSeats[1] == 0 || occupiedSeats[1] == 1) {//If the second seat is empty or contains a different exam
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						} else if (i == TC.numSeats-1) { //Last seat
							if(occupiedSeats[TC.numSeats-1] == 0 || occupiedSeats[TC.numSeats-1] == 1) {//If the second seat is empty or contains a different exam
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						} else { //Some seat in middle
							if((occupiedSeats[parseInt(i)-1] == 0 || occupiedSeats[parseInt(i)-1] == 1) && 
								(occupiedSeats[parseInt(i)+1] == 0 || occupiedSeats[parseInt(i)+1] == 1)) {
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						}
					}
				}
				if(firstAvailable == 0 && seatNum == 0) {
					return callback("There are no seats available at this time slot");
				}
				if(seatNum == 0) {
					seatNum = firstAvailable;
				}

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
						term: exam.term,
						student: req.user.NetID,
						examID: req.body.exam,
						day: date,
						startTime: start,
						endTime: end,
						seat: seatNum,
						seatType: 'normal',
						attended: false
					})
					return callback("Appointment created.");
				});
			});	
		});
	});
}

/*Creates a new appointment*/
exports.adminCreateAppointment = function(req, callback) {
	//Check if appointment starts on hour or half-hour
	if(req.body.minute != 0 && req.body.minute != 30) {
		return callback("Appointment must start on the hour or half hour")
	}

	//Find the exam with this specific id
	exams.findOne({examID: req.body.course}, function(err, exam) {

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
		testingcenters.findOne({Term: exam.term}, function(err, TC) {
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
			appointments.find({day: date}).toArray(function(err, Appts) {
				if(err) {
					console.log(err);
				}

				var occupiedSeats = []; //holds info whether seat is empty, occupied or occupied by appt for the same exam

				if(req.body.seattype == 'normal') {
					for(var i = 0; i < TC.numSeats; i++) {
						occupiedSeats.push(0); //0 means seat is empty, we will do analysis
					}
					for(i in Appts) {
						//If there is an appointment that overlaps
						if((Appts[i].startTime >= start && Appts[i].startTime < end) ||
							(Appts[i].endTime > start && Appts[i].endTime < end)) {
							if(Appts[i].examID == req.body.course) {
								//If it is the same exam occupying that spot
								if(Appts[i].seatType == 'normal') {
									occupiedSeats[Appts[i].seat-1] = 2;
								}
							} else {
								//If it is a different exam occupying that spot
								if(Appts[i].seatType == 'normal') {
									occupiedSeats[Appts[i].seat-1] = 1;
								}
							}
						}
					}
				} else {
					for(var i = 0; i < TC.numSetAside; i++) {
						occupiedSeats.push(0); //0 means seat is empty, we will do analysis
					}
						for(i in Appts) {
						//If there is an appointment that overlaps
						if((Appts[i].startTime >= start && Appts[i].startTime < end) ||
							(Appts[i].endTime > start && Appts[i].endTime < end)) {
							if(Appts[i].examID == req.body.course) {
								//If it is the same exam occupying that spot
								if(Appts[i].seatType != 'normal') {
									occupiedSeats[Appts[i].seat-1] = 2;
								}
							} else {
								//If it is a different exam occupying that spot
								if(Appts[i].seatType != 'normal') {
									occupiedSeats[Appts[i].seat-1] = 1;
								}
							}
						}
					}
				}

				//Now find a seat from occupied seats
				var firstAvailable = 0; //first available seat
				var seatNum = 0;
				for (i in occupiedSeats) {
					if(occupiedSeats[i] == 0) { //If the seat is empty
						if(i == 0) { //If this is the first seat
							if(occupiedSeats[1] == 0 || occupiedSeats[1] == 1) {//If the second seat is empty or contains a different exam
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						} else if (i == TC.numSeats-1) { //Last seat
							if(occupiedSeats[TC.numSeats-1] == 0 || occupiedSeats[TC.numSeats-1] == 1) {//If the second seat is empty or contains a different exam
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						} else { //Some seat in middle
							if((occupiedSeats[parseInt(i)-1] == 0 || occupiedSeats[parseInt(i)-1] == 1) && 
								(occupiedSeats[parseInt(i)+1] == 0 || occupiedSeats[parseInt(i)+1] == 1)) {
								seatNum = parseInt(i)+1;
								break;
							} else if (firstAvailable == 0) {
								firstAvailable = parseInt(i)+1;
							}
						}
					}
				}
				if(firstAvailable == 0 && seatNum == 0) {
					return callback("There are no seats available at this time slot");
				}
				if(seatNum == 0) {
					seatNum = firstAvailable;
				}

				appointments.find({student: req.body.student}).toArray(function(err, sameDay) {
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
					if(req.body.seattype == 'normal') {
						appointments.insert({
							term: exam.term,
							student: req.body.student,
							examID: req.body.course,
							day: date,
							startTime: start,
							endTime: end,
							seat: seatNum,
							seatType: 'normal',
							attended: false
						});
					} else {
						appointments.insert({
							term: exam.term,
							student: req.body.student,
							examID: req.body.course,
							day: date,
							startTime: start,
							endTime: end,
							seat: seatNum,
							seatType: 'setaside',
							attended: false
						});
					}
					return callback("Appointment created.");
				});
			});	
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
	testingcenters.findOne({Term: exam.term}, function(err, TC) {

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