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
			args.terms	= [];
			testingcenters.find().toArray(function(err, TCs) {
				if(err) {
					console.log(err);
				}
				TCs.forEach(function(TCs) {
					args.terms.push({name: TCs.Term + " - " + TCs.Name, value: TCs.Term});
				});
				callback();
			});
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
				args.courses= [];
				//find each exam with this class id
				exams.find({Roster: args.student}).toArray(function(err, examArray) {
					examArray.forEach(function (examArray) {
						appointments.findOne({student: req.user.NetID, examID: examArray.examID}, function(err, alreadySigned) {
							if(err) {
								console.log(err);
							}
							if(alreadySigned == null) {
								if(examArray.status == 'approved') {
									//push each class with an exam that's approved to display to user
									args.courses.push({name: examArray.examID, value: examArray.examID});
								}
							}
						});		
					});	
					callback();
				});
			} else {
				callback();
			}
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
				appointmentArray.forEach(function(appointmentArray) {
					//if not attended
					if(appointmentArray.attended == false) {
						args.data.push({course: appointmentArray.examID, student: appointmentArray.student, date: prettyDate(appointmentArray.day),
							time: msToTime(appointmentArray.startTime) + " to " + msToTime(appointmentArray.endTime),
							cancel: "/admin/list/?cancel=" +  appointmentArray.student + "&exam=" + appointmentArray.examID,
							modify: "/admin/list/?modify=" +  appointmentArray.student + "&exam=" + appointmentArray.examID,
						});
					}
				})	
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
			args.terms 	= [];
			testingcenters.find().sort({Term: 1}).toArray(function(err, TCs) {
				TCs.forEach(function(TCs) {
					args.terms.push({name: TCs.Term + " - " + TCs.Name, value: TCs.Term});
				});
				callback();
			});
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
			if(req.query.exam) {
				exams.findOne({examID: req.query.exam}, function(err, Exam) {
					if(err) {
						console.log(err);
					}
					AM.getAvailableTimeslots(Exam, function(result) {
						args.result = result;
						//find each exam with this class id
						exams.find({Roster: req.user.NetID}).toArray(function(err, examArray) {
							examArray.forEach(function (examArray) {
								appointments.findOne({student: req.user.NetID, examID: examArray.examID}, function(err, alreadySigned) {
									if(err) {
										console.log(err);
									}
									if(alreadySigned == null) {
										if(examArray.status == 'approved') {
											//push each class with an exam that's approved to display to user
											args.exams.push({name: examArray.examID, value: examArray.examID});
										}
									}
								});		
							});	
							callback(args);
						});
					});
				});
			} else {
				//find each exam with this class id
				exams.find({Roster: req.user.NetID}).toArray(function(err, examArray) {
					examArray.forEach(function (examArray) {
						appointments.findOne({student: req.user.NetID, examID: examArray.examID}, function(err, alreadySigned) {
							if(err) {
								console.log(err);
							}
							if(alreadySigned == null) {
								if(examArray.status == 'approved') {
									//push each class with an exam that's approved to display to user
									args.exams.push({name: examArray.examID, value: examArray.examID});
								}
							}
						});		
					});	
					callback(args);
				});
			}
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
				//If a query exists, pre-select the particular exam
				if (req.query.exam) {
					for(var i = 0; i < args.exams.length; i++) {
						if(args.exams[i].name == req.query.exam) {
							args.exams[i].selected = true;
						}
					}
				}
			});
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
						time: msToTime(appointmentArray[i].startTime) + " to " + msToTime(appointmentArray[i].endTime), cancel: "/student/cancel?exam=" + appointmentArray[i].examID});
				}
			})
			callback(args);
		break;
	}
};


//Display Utilization
exports.displayUtilization = function(req, args, callback) {
	req.body.from_term;
	req.body.from_month;
	req.body.from_day;
	var examIDs;
	if(req.body.from_term == req.body.to_term) { //If it is same term, find exams in this range
		if(req.body.from_month > req.body.to_month) {
			return callback("The second time is before the first time");
		} else if(req.body.from_month == req.body.to_month) {
			if(req.body.from_day > req.body.to_day) {
				return callback("The second time is before the first time");
			}
		}
		exams.find({term: req.body.from_term}).toArray(function(err, Exams) {
			if(err) {
				console.log(err);
			}
			examIDs = Exams;
			callback("");
		});
	} else {
		if(req.body.to_term < req.body.from_term) {
			return callback("The second term is earlier than the first term");
		} else {
			exams.find({term: req.body.from_term}).toArray(function(err, Exams1) {
				if(err) {
					console.log(err);
				}
				exams.find({term: req.body.to_term}).toArray(function(err, Exams2) {
					if(err) {
						console.log(err);
					}
					examIDs = Exams1.concat(Exams2);
					callback("");
				});
			});
		}
	}
}

//Generate reports
exports.generateReport = function(req, args, callback) {
	var type	= req.body.type; //'day' 'week' 'term' or 'range'
	var start	= req.body.start; //term
	var end 	= req.body.end; //term
	var isExport= req.body.export; //if set, export was clicked
	//do something with these
	if (type == "day") {
		args.day = true;
		args.data = [];
		appointments.find().sort({day: 1}).toArray(function(err, Appts) {
			if(err) {
				console.log(err);
			}
			Appts.forEach(function(Appts) {
				if(args.data.length == 0) {
					args.data.push({day:prettyDate(Appts.day), appts: 1});
				} else {
					if(args.data[args.data.length-1].day == prettyDate(Appts.day)) {
						args.data[args.data.length-1].appts += 1;
					} else {
						args.data.push({day:prettyDate(Appts.day), appts: 1});
					}
				}
			});
			callback();
		});
	} else if (type == "week") {
		args.week = true;
		args.data = [];
		appointments.find({term: start}).sort({day: 1, examID: 1}).toArray(function(err, Appts) {
			var weeks = [];
			//Create weeks for each appointment
			Appts.forEach(function(Appts) {
				if(weeks.length == 0) {
					weeks.push(new Date(Appts.day.getTime() - (Appts.day.getDay()*24*60*60*1000)));
				} else {
					if(Appts.day.getTime() > weeks[weeks.length-1].getTime() + (7*24*60*60*1000)) {
						weeks.push(new Date(Appts.day.getTime() - (Appts.day.getDay()*24*60*60*1000)));
					}
				}
			});
			//Fill in missing weeks
			for(var i = 0; i < weeks.length - 1; i++) {
				if(weeks[i+1].getTime() != weeks[i].getTime() + (7*24*60*60*1000)) {
					weeks.splice(i+1, 0, new Date(weeks[i].getTime() + (7*24*60*60*1000)));
					i = 0;
				}
			}
			//Create a value for each week
			weeks.forEach(function(week) {
				args.data.push({week:"Week of " + prettyDate(week), appts: 0, courses: ""});
			});
			//Now add the values
			Appts.forEach(function(Appts) {
				for(var i = 0; i < weeks.length; i++) {
					if(i < weeks.length - 1) {
						if(Appts.day.getTime() >= weeks[i].getTime() && Appts.day.getTime() < weeks[i+1].getTime()) {
							args.data[i].appts += 1;
							if(args.data[i].courses == "") {
								args.data[i].courses += (Appts.examID.substring(0, Appts.examID.indexOf('-')));
							} else if(args.data[i].courses.indexOf(Appts.examID.substring(0, Appts.examID.indexOf('-'))) == -1) {
								args.data[i].courses += (", " + Appts.examID.substring(0, Appts.examID.indexOf('-')));
							}
							break;
						}
					} else {
						args.data[i].appts += 1;
						if(args.data[i].courses == "") {
							args.data[i].courses += (Appts.examID.substring(0, Appts.examID.indexOf('-')));
						} else if(args.data[i].courses.indexOf(Appts.examID.substring(0, Appts.examID.indexOf('-'))) == -1) {
							args.data[i].courses += (", " + Appts.examID.substring(0, Appts.examID.indexOf('-')));
						}
					}
				}
			});
			callback();
		});
	} else if (type == "term") {
		args.term = true;
		args.data = [];
		exams.find({term: start, adhoc: false}).sort({examID: 1}).toArray(function(err, Exams) {
			if(err) {
				console.log(err);
			}
			Exams.forEach(function(Exams) {
				Exams.examID = Exams.examID.substring(0, Exams.examID.indexOf('-'));
				var exists = false;
				args.data.forEach(function(data) {
					if(data.course == Exams.examID) {
						exists = true;
					}
				});
				if (exists == false) {
					args.data.push({course: Exams.examID});
				}
			});
			callback();
		});
	} else if (type == "range") {
		args.range = true;
		args.data = [];	
		testingcenters.find({Term: {$lte: end, $gte: start}}).sort({Term: 1}).toArray(function(err, TCs) {
			if(err) {
				console.log(err);
			}
			TCs.forEach(function(TCs) {
				appointments.find({term: TCs.Term}).toArray(function(err, Appts) {
					args.data.push({term: TCs.Term + " - " + TCs.Name, appts: Appts.length});
				});
			});
			callback();
		});
	}
}

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
				seat: appointmentArray[i].seat + " (" + appointmentArray[i].seatType + ")", present: appointmentArray[i].attended});
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