var path = require('path');

//require db
var db = require('../src/db');
var exams = db.collection('exams');
var classes = db.collection('classes');
var roster = db.collection('roster');
var appointments = db.collection('appointments');
var testingcenters = db.collection('testingcenters');

var EM = require(path.join(__dirname, '../src/exam-manager'));
var AM = require(path.join(__dirname, '../src/appointment-manager'));

//The makeArgs function query the database for relevant info and display it to the user
exports.makeArgsAdmin = function(req, args, callback) {
	switch(req.params.value) {
		case "info": //Edit Info
			if (req.query.term) {
				testingcenters.findOne({Term: req.query.term}, function(err, TC) {
					if(err) {
						console.log(err);
					}
					if(TC == null) { //If TC with the term cannot be found, display default info
						args.term		= req.query.term; //term number
						args.termname	= "" //term display name
						args.termstatus = "future"; //term status
						args.action		= "/admin/info"; //POST action
						args.seats		= 64; //current setting for # of total seats
						args.sas		= 8; //current setting for # of set-aside seats
						//current setting for testing center hours
						//monday
						args.from_hour_mon	= 12;
						args.from_minute_mon= 0;
						args.from_ampm_mon	= "am";
						args.to_hour_mon	= 12;
						args.to_minute_mon	= 0;
						args.to_ampm_mon	= "am";
						//tuesday
						args.from_hour_tue	= 12;
						args.from_minute_tue= 0;
						args.from_ampm_tue	= "am";
						args.to_hour_tue	= 12;
						args.to_minute_tue	= 0;
						args.to_ampm_tue	= "am";
						//wednesday
						args.from_hour_wed	= 12;
						args.from_minute_wed= 0;
						args.from_ampm_wed	= "am";
						args.to_hour_wed	= 12;
						args.to_minute_wed	= 0;
						args.to_ampm_wed	= "am";
						//thursday
						args.from_hour_thu	= 12;
						args.from_minute_thu= 0;
						args.from_ampm_thu	= "am";
						args.to_hour_thu	= 12;
						args.to_minute_thu	= 0;
						args.to_ampm_thu	= "am";
						//friday
						args.from_hour_fri	= 12;
						args.from_minute_fri= 0;
						args.from_ampm_fri	= "am";
						args.to_hour_fri	= 12;
						args.to_minute_fri	= 0;
						args.to_ampm_fri	= "am";
						//saturday
						args.from_hour_sat	= 12;
						args.from_minute_sat= 0;
						args.from_ampm_sat	= "am";
						args.to_hour_sat	= 12;
						args.to_minute_sat	= 0;
						args.to_ampm_sat	= "am";
						//sunday
						args.from_hour_sun	= 12;
						args.from_minute_sun= 0;
						args.from_ampm_sun	= "am";
						args.to_hour_sun	= 12;
						args.to_minute_sun	= 0;
						args.to_ampm_sun	= "am";
						//current setting for closed date ranges
						args.closed = [
							{from_month:1, from_day:1, from_year: new Date().getFullYear(), to_month:1, to_day:1, to_year: new Date().getFullYear()},
							{from_month:1, from_day:1, from_year: new Date().getFullYear(), to_month:1, to_day:1, to_year: new Date().getFullYear()},
						]
						//current settings for reserved time ranges
						args.reserved = [
							{from_month:1, from_day:1, from_year: new Date().getFullYear(), from_hour:12, from_minute:0, from_ampm:"am", 
							to_month:1, to_day:1, to_year: new Date().getFullYear(), to_hour:12, to_minute:0, to_ampm:"am"},
							{from_month:1, from_day:1, from_year: new Date().getFullYear(), from_hour:12, from_minute:0, from_ampm:"am", 
							to_month:1, to_day:1, to_year: new Date().getFullYear(), to_hour:12, to_minute:0, to_ampm:"am"},
						]
						//TODO: date range
						args.gap		= 0; //current setting for gap time
						args.reminder	= 1440; //current setting for reminder interval
					} else { //Display this term's current info
						args.term = TC.Term;
						args.termname = TC.Name;
						args.termstatus = TC.Status;
						args.action		= "/admin/info"; //POST action
						args.seats		= TC.numSeats; //current setting for # of total seats
						args.sas		= TC.numSetAside; //current setting for # of set-aside seats
						args.gap = TC.gapTime;
						args.reminder = TC.ReminderInterval;
						//sunday
						args.from_hour_sun	= msToHour(TC.OperatingHours[0][0]);
						args.from_minute_sun= Math.floor((TC.OperatingHours[0][0]%3600000)/60000);
						args.from_ampm_sun	= ampmMS(TC.OperatingHours[0][0]);
						args.to_hour_sun	= msToHour(TC.OperatingHours[0][1]);
						args.to_minute_sun	= Math.floor((TC.OperatingHours[0][1]%3600000)/60000);
						args.to_ampm_sun	= ampmMS(TC.OperatingHours[0][1]);
						//monday
						args.from_hour_mon	= msToHour(TC.OperatingHours[1][0]);
						args.from_minute_mon= Math.floor((TC.OperatingHours[1][0]%3600000)/60000);
						args.from_ampm_mon	= ampmMS(TC.OperatingHours[1][0]);
						args.to_hour_mon	= msToHour(TC.OperatingHours[1][1]);
						args.to_minute_mon	= Math.floor((TC.OperatingHours[1][1]%3600000)/60000);
						args.to_ampm_mon	= ampmMS(TC.OperatingHours[1][1]);
						//tuesday
						args.from_hour_tue	= msToHour(TC.OperatingHours[2][0]);
						args.from_minute_tue= Math.floor((TC.OperatingHours[2][0]%3600000)/60000);
						args.from_ampm_tue	= ampmMS(TC.OperatingHours[2][0]);
						args.to_hour_tue	= msToHour(TC.OperatingHours[2][1]);
						args.to_minute_tue	= Math.floor((TC.OperatingHours[2][1]%3600000)/60000);
						args.to_ampm_tue	= ampmMS(TC.OperatingHours[2][1]);
						//wednesday
						args.from_hour_wed	= msToHour(TC.OperatingHours[3][0]);
						args.from_minute_wed= Math.floor((TC.OperatingHours[3][0]%3600000)/60000);
						args.from_ampm_wed	= ampmMS(TC.OperatingHours[3][0]);
						args.to_hour_wed	= msToHour(TC.OperatingHours[3][1]);
						args.to_minute_wed	= Math.floor((TC.OperatingHours[3][1]%3600000)/60000);
						args.to_ampm_wed	= ampmMS(TC.OperatingHours[3][1]);
						//thursday
						args.from_hour_thu	= msToHour(TC.OperatingHours[4][0]);
						args.from_minute_thu= Math.floor((TC.OperatingHours[4][0]%3600000)/60000);
						args.from_ampm_thu	= ampmMS(TC.OperatingHours[4][0]);
						args.to_hour_thu	= msToHour(TC.OperatingHours[4][1]);
						args.to_minute_thu	= Math.floor((TC.OperatingHours[4][1]%3600000)/60000);
						args.to_ampm_thu	= ampmMS(TC.OperatingHours[4][1]);
						//friday
						args.from_hour_fri	= msToHour(TC.OperatingHours[4][0]);
						args.from_minute_fri= Math.floor((TC.OperatingHours[4][0]%3600000)/60000);
						args.from_ampm_fri	= ampmMS(TC.OperatingHours[4][0]);
						args.to_hour_fri	= msToHour(TC.OperatingHours[4][1]);
						args.to_minute_fri	= Math.floor((TC.OperatingHours[4][1]%3600000)/60000);
						args.to_ampm_fri	= ampmMS(TC.OperatingHours[4][1]);
						//saturday
						args.from_hour_sat	= msToHour(TC.OperatingHours[4][0]);
						args.from_minute_sat= Math.floor((TC.OperatingHours[4][0]%3600000)/60000);
						args.from_ampm_sat	= ampmMS(TC.OperatingHours[4][0]);
						args.to_hour_sat	= msToHour(TC.OperatingHours[4][1]);
						args.to_minute_sat	= Math.floor((TC.OperatingHours[4][1]%3600000)/60000);
						args.to_ampm_sat	= ampmMS(TC.OperatingHours[4][1]);
						//closed date ranges
						args.closed = [];
						for(i in TC.ClosedDates) {
							args.closed.push({from_month: TC.ClosedDates[i].Start.getMonth()+1, from_day: TC.ClosedDates[i].Start.getDate(), from_year: TC.ClosedDates[i].Start.getFullYear(),
								to_month: TC.ClosedDates[i].End.getMonth()+1, to_day: TC.ClosedDates[i].End.getDate(), to_year: TC.ClosedDates[i].End.getFullYear()});
						}
						//reserved time ranges
						args.reserved = [];
						for(i in TC.ReservedDates) {
							var startHour = TC.ReservedDates[i].Start.getHours();
							var endHour = TC.ReservedDates[i].End.getHours();
							if(TC.ReservedDates[i].Start.getHours() == 0) {
								startHour = 12;
							}
							if(TC.ReservedDates[i].End.getHours() == 0) {
								endHour = 12;
							}
							args.reserved.push({from_month: TC.ReservedDates[i].Start.getMonth()+1, from_day: TC.ReservedDates[i].Start.getDate(), from_year: TC.ReservedDates[i].Start.getFullYear(), 
								from_hour: startHour, from_minute: TC.ReservedDates[i].Start.getMinutes(), from_ampm: ampm(TC.ReservedDates[i].Start.getHours()), 
								to_month: TC.ReservedDates[i].End.getMonth()+1, to_day: TC.ReservedDates[i].End.getDate(), to_year: TC.ReservedDates[i].End.getFullYear(), 
								to_hour: endHour, to_minute: TC.ReservedDates[i].End.getMinutes(), to_ampm: ampm(TC.ReservedDates[i].End.getHours())})
						}
					}
					callback();
				});
				
			} else {
				args.term = 0;
				callback();
			}
		break;
		case "import": //Import Data
			args.action = "/admin/import"; //POST action
			args.termimports = [];
			testingcenters.find().toArray(function(err, TC) {
				if(err) {
					console.log(err);
				}

				for(i in TC) {
					//User can only import data for non-"past" terms
					if(TC[i].Status != "past") {
						args.termimports.push({name: TC[i].Name, value: TC[i].Term});
					}
				}
				callback();
			});
		break;
		case "util": //Display Utilization
			args.action = "/admin/util";
			args.terms	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
			callback();
		break;
		case "review": //Review Requests
			//if approval query string exists in url
			if (req.query.approve) {
				var request = req.query.approve;
				//approve request
				EM.approvePendingExam(request);
			}
			//if denial query string exists in url
			if (req.query.deny) {
				var request = req.query.deny;
				//deny request
				EM.denyPendingExam(request);
			}
			args.data = [];
			//Find the pending requests in database
			exams.find({status: "pending"}).toArray(function(err, pendingRequests) {
				if(err) {
					console.log(err);
				}
				//for each pending request
				for(i in pendingRequests) {
					//push the info for each pending exam into the array args.data
					args.data.push({course: pendingRequests[i].examID, 
						start: prettyDate(pendingRequests[i].startDate) + " at " + msToTime(pendingRequests[i].startTime), 
						end: prettyDate(pendingRequests[i].endDate) + " at " + msToTime(pendingRequests[i].endTime), 
						approve: "/admin/review/?approve=" + pendingRequests[i].examID, 
						deny: "/admin/review/?deny=" + pendingRequests[i].examID});
				}
			})
			callback();
		break;
		case "add": //Add Appointment
			args.action = "/admin/add"; //POST action
			if (req.query.student) {
				args.student = req.query.student;
				args.courses= [
					{name:"course Display Name", value:"course POST value"},
					{name:"course Display Name", value:"course POST value"},
					{name:"course Display Name", value:"course POST value"},
				];
			}
			callback();
		break;
		case "list": //Appointment List
			args.data = [];
			//If cancel query exists in url
			if(req.query.cancel) {
				AM.adminCancel(req.query.cancel, req.query.exam);
			}
			//Get all the appointments
			appointments.find().toArray(function(err, appointmentArray) {
				if(err) {
					console.log(err);
				}
				//for each appointment
				for(i in appointmentArray) {
					//if not attended
					if(appointmentArray[i].attended == false) {
						args.data.push({course: appointmentArray[i].examID, student: appointmentArray[i].student, date: prettyDate(appointmentArray[i].day),
							time: msToTime(appointmentArray[i].startTime) + " to " + msToTime(appointmentArray[i].endTime),
							cancel: "/admin/list/?cancel=" +  appointmentArray[i].student + "&exam=" + appointmentArray[i].examID,
							modify: "/admin/list/?modify=" +  appointmentArray[i].student + "&exam=" + appointmentArray[i].examID,
						});
					}
				}
				callback();
			});		
		break;
		case "checkin": //Check-In Student
			args.action = "/admin/checkin"; //POST action
			if (req.query.confirm) {
				AM.confirmAppointment(req.query.confirm, req.query.exam);
			}
			callback();
		break;
		case "report": //Generate Report
			args.action = "/admin/report"; //POST action
			args.terms 	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
			callback();
		break;
	}
}

//Make the arguments which contain the data to display to instructors
exports.makeArgsInstructor = function(req, args, callback) {
	switch(req.params.value) {
		case "attendance": //Show the exams the instructor has/has requested
			args.action = "/instructor/attendance"; //POST action
			args.exams = [];
			exams.find().toArray(function(err, examArray) {
				if(err) {
					console.log(err);
				}
				for(i in examArray) {
					if(examArray[i].Instructors.indexOf(req.user.NetID) > -1) {
						args.exams.push({name: examArray[i].examID, value: examArray[i].examID});
					}
				}
				return callback(args);
			});
		break;
		case "cancel": //Show the exams the instructor has/has requested
			args.action = "/instructor/cancel"; //POST action
			args.exams = [];
			exams.find().toArray(function(err, examArray) {
				if(err) {
					console.log(err);
				}
				for(i in examArray) {
					//Only display in cancel list if pending
					if(examArray[i].status == 'pending') {
						if(examArray[i].Instructors.indexOf(req.user.NetID) > -1) {
							args.exams.push({name: examArray[i].examID, value: examArray[i].examID});
						}
					}
				}
				if (args.exams[req.query.exam]) {
					args.exams[req.query.exam].selected = true;
				}
				return callback(args);
			});
		break;
		case "list": //Display a list of exams
			args.data = [];
			exams.find().toArray(function(err, examArray) {
				if(err) {
					console.log(err);
				}
				//look for this instructors' exams
				var cancelnum = 0; //This assigns the cancel queries
				for(i in examArray) {
					//Push the fields to display to user if this exam period has not ended
					if(examArray[i].Instructors.indexOf(req.user.NetID) > -1 && (new Date().getTime()) < examArray[i].endDate.getTime() + examArray[i].endTime) {
						if(examArray[i].status == 'approved') {
							args.data.push({exam: examArray[i].examID, start: prettyDate(examArray[i].startDate) + " at " + msToTime(examArray[i].startTime), 
							end: prettyDate(examArray[i].endDate) + " at " + msToTime(examArray[i].endTime), status: examArray[i].status, 
							scheduled: 0, taken: 0});
						}
						else {
							args.data.push({exam: examArray[i].examID, start: prettyDate(examArray[i].startDate) + " at " + msToTime(examArray[i].startTime), 
							end: prettyDate(examArray[i].endDate) + " at " + msToTime(examArray[i].endTime), status: examArray[i].status, 
							scheduled: 0, taken: 0, cancel:"/instructor/cancel?exam=" + cancelnum});
							cancelnum++;
						}
					}
				}
				return callback(args);
			})
		break;
		case "request":
			args.action	= "/instructor/request"; //POST action
			//instantiate the args.courses array and get the class objects in an array
			args.courses = [];
			//Find all the classes
			classes.find().toArray(function(err, classArray) {
				if(err) {
					console.log(err);
				}
				//Add each class this instructor teaches to the term dropbox
				for(i in classArray) {
					if(classArray[i].Instructors.indexOf(req.user.NetID) > -1) {
						args.courses.push({name: classArray[i].Class, value: classArray[i].Class});
					}
				}
				args.courses.sort();
				//instantiate the args.terms array and get the testing centers objects in an array
				args.terms = [];
				testingcenters.find().toArray(function(err, tcenters) {
					if(err) {
						console.log(err);
					}
					//Add each non-past term to the term dropbox
					for(i in tcenters) {
						if(tcenters[i].Status != "past") {
							args.terms.push({name: tcenters[i].Term, value: tcenters[i].Term});
						}
					}
					args.terms.sort();
					return callback(args);
				});
			});
		break;
	}
}

//Make the arguments which contain the data to display to students
exports.makeArgsStudent = function(req, args, callback) {
	switch(req.params.value) {
		case "add":
			args.action = "/student/add"; //POST action
			args.exams = [];
			//get the roster collection objects into an array
			roster.find({Roster: req.user.NetID}).toArray(function(err, rosterArray) {
				for(i in rosterArray) {
					//find each exam with this class id
					exams.find({ClassID: rosterArray[i].ClassID}).toArray(function(err, examArray) {
						for(j in examArray) {
							//push each class with an exam that's approved to display to user
							if(examArray[j].status == 'approved') {
								args.exams.push({name: examArray[j].examID, value: examArray[j].examID});
							}
						}
					});
				}
				callback(args);
			});
		break;
		case "cancel":
			args.action = "/student/cancel"; //POST action
			args.exams = [];
			//get a list of exams student has appointments for
			appointments.find({student: req.user.NetID}).toArray(function(err, appointmentArray) {
				if(err) {
					console.log(err);
				}
				//push each appointment student has
				for(i in appointmentArray) {
					args.exams.push({name: appointmentArray[i].examID, value: appointmentArray[i].examID});
				}
			})
			//If a query exists, pre-select the particular exam
			if (args.exams[req.query.exam]) {
				args.exams[req.query.exam].selected = true;
			}
			callback(args);
		break;
		case "list":
			args.data = [];
			appointments.find({student: req.user.NetID}).toArray(function(err, appointmentArray) {
				if(err) {
					console.log(err);
				}
				for(i in appointmentArray) {
					args.data.push({class: appointmentArray[i].examID, date: prettyDate(appointmentArray[i].day), 
						time: msToTime(appointmentArray[i].startTime) + " to " + msToTime(appointmentArray[i].endTime), cancel: "/student/cancel?exam=" + i});
				}
			})
			callback(args);
		break;
	}
};

//view the attendance for an exam
exports.viewAttendance = function(req, args, callback) {
	args.data = [];
	//get a list of all appointments with this exam id
	appointments.find({examID: req.body.exam}).toArray(function(err, appointmentArray) {
		if(err) {
			console.log(err);
		}
		//for each appointment
		for(i in appointmentArray) {
			//push the appointment's information
			args.data.push({student: appointmentArray[i].student, time: prettyDate(appointmentArray[i].day) + " at " + msToTime(appointmentArray[i].startTime) + " to " + msToTime(appointmentArray[i].endTime), 
				seat: "assigned seat", present: appointmentArray[i].attended});
		}
		callback(args);
	})
}

//get check-in list
exports.checkInList = function(req, args, callback) {
	args.data = [];
	//get a list of all appointments associated with this id
	appointments.find({student: req.body.studentid}).toArray(function (err, appointmentArray) {
		if(err) {
			console.log(err);
		}
		for(i in appointmentArray) {
			//if attended is false, push the appointment info into args.data
			if(appointmentArray[i].attended == false) {
				args.data.push({class: appointmentArray[i].examID, date: prettyDate(appointmentArray[i].day), 
				time: msToTime(appointmentArray[i].startTime) + " to " + msToTime(appointmentArray[i].endTime), 
				confirm:"/admin/checkin/?confirm=" + appointmentArray[i].student + "&exam=" + appointmentArray[i].examID});
			}
		}
		callback();
	});
}

//Gets the format of a Date in: Day of Week, Month Day of Month, Year
function prettyDate(date) {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

//Converts milliseconds to HH:MM AM/PM format
function msToTime(ms) {
	var hour = Math.floor(ms/3600000);
	var minutes = Math.floor((ms%3600000)/60000);
	if(minutes < 10) {
		minutes = '0' + minutes.toString();
	} else {
		minutes = minutes.toString();
	}
	if(hour == 0) {
		hour = 12;
	} else if(hour >= 12) {
		if(hour > 12) {
			hour -= 12;
		}
		return hour.toString() + ":" + minutes + "PM";
	} 
	return hour.toString() + ":" + minutes + "AM";
}

//Converts milliseconds to HH format
function msToHour(ms) {
	var hour = Math.floor(ms/3600000)%12;
	if(hour == 0) {
		return 12;
	} else {
		return hour;
	}
}

//milliseconds to apmpm
function ampm(hours) {
	if(hours >= 12) {
		return 'pm';
	}
	return 'am';
}

//milliseconds to apmpm
function ampmMS(ms) {
	if(ms >= 43200000) {
		return 'pm';
	}
	return 'am';
}