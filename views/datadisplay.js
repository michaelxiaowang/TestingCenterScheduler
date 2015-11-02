var path = require('path');

//require db
var db = require('../src/db');
var exams = db.collection('exams');
var classes = db.collection('classes');
var roster = db.collection('roster');
var testingcenters = db.collection('testingcenters');

var EM = require(path.join(__dirname, '../src/exam-manager'));


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
							{from_month:1, from_day:1, to_month:1, to_day:1},
							{from_month:1, from_day:1, to_month:1, to_day:1},
						]
						//current settings for reserved time ranges
						args.reserved = [
							{from_month:1, from_day:1, from_hour:12, from_minute:0, from_ampm:"am", to_month:1, to_day:1, to_hour:12, to_minute:0, to_ampm:"am"},
							{from_month:1, from_day:1, from_hour:12, from_minute:0, from_ampm:"am", to_month:1, to_day:1, to_hour:12, to_minute:0, to_ampm:"am"},
						]
						//TODO: date range
						args.gap		= 0; //current setting for gap time
						args.reminder	= 1440; //current setting for reminder interval
					} else { //Display this term's current info
						args.term = TC.Term;
						args.termname = TC.Name;
						args.action		= "/admin/info"; //POST action
						args.seats		= TC.numSeats; //current setting for # of total seats
						args.sas		= TC.numSetAside; //current setting for # of set-aside seats
						args.gap = TC.gapTime;
						args.reminder = TC.ReminderInterval;
						//monday
						args.from_hour_mon	= Math.floor((TC.OperatingHours.Monday[0]/3600000)%12);
						args.from_minute_mon= Math.floor((TC.OperatingHours.Monday[0]%3600000)/60000);
						args.from_ampm_mon	= ampm(TC.OperatingHours.Monday[0]);
						args.to_hour_mon	= Math.floor((TC.OperatingHours.Monday[1]/3600000)%12);
						args.to_minute_mon	= Math.floor((TC.OperatingHours.Monday[1]%3600000)/60000);
						args.to_ampm_mon	= ampm(TC.OperatingHours.Monday[1]);
						//tuesday
						args.from_hour_tue	= Math.floor((TC.OperatingHours.Tuesday[0]/3600000)%12);
						args.from_minute_tue= Math.floor((TC.OperatingHours.Tuesday[0]%3600000)/60000);
						args.from_ampm_tue	= ampm(TC.OperatingHours.Tuesday[0]);
						args.to_hour_tue	= Math.floor((TC.OperatingHours.Tuesday[1]/3600000)%12);
						args.to_minute_tue	= Math.floor((TC.OperatingHours.Tuesday[1]%3600000)/60000);
						args.to_ampm_tue	= ampm(TC.OperatingHours.Tuesday[1]);
						//wednesday
						args.from_hour_wed	= Math.floor((TC.OperatingHours.Wednesday[0]/3600000)%12);
						args.from_minute_wed= Math.floor((TC.OperatingHours.Wednesday[0]%3600000)/60000);
						args.from_ampm_wed	= ampm(TC.OperatingHours.Wednesday[0]);
						args.to_hour_wed	= Math.floor((TC.OperatingHours.Wednesday[1]/3600000)%12);
						args.to_minute_wed	= Math.floor((TC.OperatingHours.Wednesday[1]%3600000)/60000);
						args.to_ampm_wed	= ampm(TC.OperatingHours.Wednesday[1]);
						//thursday
						args.from_hour_thu	= Math.floor((TC.OperatingHours.Thursday[0]/3600000)%12);
						args.from_minute_thu= Math.floor((TC.OperatingHours.Thursday[0]%3600000)/60000);
						args.from_ampm_thu	= ampm(TC.OperatingHours.Thursday[0]);
						args.to_hour_thu	= Math.floor((TC.OperatingHours.Thursday[1]/3600000)%12);
						args.to_minute_thu	= Math.floor((TC.OperatingHours.Thursday[1]%3600000)/60000);
						args.to_ampm_thu	= ampm(TC.OperatingHours.Thursday[1]);
						//friday
						args.from_hour_fri	= Math.floor((TC.OperatingHours.Friday[0]/3600000)%12);
						args.from_minute_fri= Math.floor((TC.OperatingHours.Friday[0]%3600000)/60000);
						args.from_ampm_fri	= ampm(TC.OperatingHours.Friday[0]);
						args.to_hour_fri	= Math.floor((TC.OperatingHours.Friday[1]/3600000)%12);
						args.to_minute_fri	= Math.floor((TC.OperatingHours.Friday[1]%3600000)/60000);
						args.to_ampm_fri	= ampm(TC.OperatingHours.Friday[1]);
						//saturday
						args.from_hour_sat	= Math.floor((TC.OperatingHours.Saturday[0]/3600000)%12);
						args.from_minute_sat= Math.floor((TC.OperatingHours.Saturday[0]%3600000)/60000);
						args.from_ampm_sat	= ampm(TC.OperatingHours.Saturday[0]);
						args.to_hour_sat	= Math.floor((TC.OperatingHours.Saturday[1]/3600000)%12);
						args.to_minute_sat	= Math.floor((TC.OperatingHours.Saturday[1]%3600000)/60000);
						args.to_ampm_sat	= ampm(TC.OperatingHours.Saturday[1]);
						//monday
						args.from_hour_sun	= Math.floor((TC.OperatingHours.Sunday[0]/3600000)%12);
						args.from_minute_sun= Math.floor((TC.OperatingHours.Sunday[0]%3600000)/60000);
						args.from_ampm_sun	= ampm(TC.OperatingHours.Sunday[0]);
						args.to_hour_sun	= Math.floor((TC.OperatingHours.Sunday[1]/3600000)%12);
						args.to_minute_sun	= Math.floor((TC.OperatingHours.Sunday[1]%3600000)/60000);
						args.to_ampm_sun	= ampm(TC.OperatingHours.Sunday[1]);
						//closed date ranges
						args.closed = [];
						for(i in TC.ClosedDates) {
							args.closed.push({from_month: TC.ClosedDates[i].Start.getMonth()+1, from_day: TC.ClosedDates[i].Start.getDate(), 
								to_month: TC.ClosedDates[i].End.getMonth()+1, to_day: TC.ClosedDates[i].End.getDate()});
						}
						//reserved time ranges
						args.reserved = [];
						for(i in TC.ReservedDates) {
							args.reserved.push({from_month: TC.ReservedDates[i].Start.getMonth()+1, from_day: TC.ReservedDates[i].Start.getDate(), 
								from_hour: TC.ReservedDates[i].Start.getHours()%12, from_minute: TC.ReservedDates[i].Start.getMinutes(), from_ampm: ampm(TC.ReservedDates[i].Start.getHours()), 
								to_month: TC.ReservedDates[i].End.getMonth()+1, to_day: TC.ReservedDates[i].End.getDate(), 
								to_hour: TC.ReservedDates[i].End.getHours()%12, to_minute: TC.ReservedDates[i].End.getMinutes(), to_ampm: ampm(TC.ReservedDates[i].End.getHours())})
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
			callback();
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
			if (req.query.approve) {
				var request = req.query.approve;
				//approve request
			}
			if (req.query.deny) {
				var request = req.query.deny;
				//deny request
			}
			args.data = [];
			//Find the pending requests in database
			exams.find({status: "pending"}).toArray(function(err, pendingRequests) {
				if(err) {
					console.log(err);
				}
				for(i in pendingRequests) {
					startDate = (pendingRequests[i].startDate.getMonth()+1) + "/" + pendingRequests[i].startDate.getDate() + "/" + pendingRequests[i].startDate.getFullYear();
					endDate = (pendingRequests[i].endDate.getMonth()+1) + "/" + pendingRequests[i].endDate.getDate() + "/" + pendingRequests[i].endDate.getFullYear();
					args.data.push({course: pendingRequests[i].examID, 
						start: prettyDate(pendingRequests[i].startDate) + " at " + msToHour(pendingRequests[i].startTime), 
						end: prettyDate(pendingRequests[i].endDate) + " at " + msToHour(pendingRequests[i].endTime), 
						approve: EM.approvePendingExam(pendingRequests[i].examID, function(result) {args.result = result}), 
						deny: EM.denyPendingExam(pendingRequests[i].examID, function(result) {args.result = result})});
				}
			})
			callback();
		break;
		case "add": //Add Appointment
			args.action = "/admin/add"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
			callback();
		break;
		case "list": //Appointment List
			args.data	= [
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
			];
			callback();
		break;
		case "checkin": //Check-In Student
			args.action = "/admin/checkin"; //POST action
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
exports.makeArgsInstructor = function(req, args) {
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
						args.exams.push({name: examArray[i].examID, value: "exam POST value"});
					}
				}
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
					if(examArray[i].Instructors.indexOf(req.user.NetID) > -1) {
						args.exams.push({name: examArray[i].examID, value: examArray[i].examID});
					}
				}
				if (args.exams[req.query.exam]) {
					args.exams[req.query.exam].selected = true;
				}
			});
		break;
		case "list": //Display a list of exams
			args.data = [];
			exams.find().toArray(function(err, examArray) {
				if(err) {
					console.log(err);
				}
				//look for this instructors' exams
				for(i in examArray) {
					//Push the fields to display to user
					if(examArray[i].Instructors.indexOf(req.user.NetID) > -1) {
						args.data.push({exam: examArray[i].examID, start: prettyDate(examArray[i].startDate) + " at " + msToHour(examArray[i].startTime), 
							end: prettyDate(examArray[i].endDate) + " at " + msToHour(examArray[i].endTime), status: examArray[i].status, 
							scheduled: 0, taken: 0, cancel:"/instructor/cancel?exam=" + i});
					}
				}
			})
		break;
		case "request":
			args.action	= "/instructor/request"; //POST action
			////instantiate the args.classes array and get the class objects in an array
			args.courses = [];
			classes.find().toArray(function(err, classArray) {
				if(err) {
					console.log(err);
				}
				//Add each class to the term dropbox
				for(i in classArray) {
					if(classArray[i].Instructors.indexOf(req.user.NetID) > -1) {
						args.courses.push({name: classArray[i].Class, value: classArray[i].Class});
					}
				}
				args.courses.sort();
			});
			//instantiate the args.terms array and get the testing centers objects in an array
			args.terms = [];
			testingcenters.find().toArray(function(err, tcenters) {
				if(err) {
					console.log(err);
				}
				//Add each term to the term dropbox
				for(i in tcenters) {
					args.terms.push({name: tcenters[i].Term, value: "course POST value"});
				}
				args.terms.sort();
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
							//push each class with an exam to display to user
							args.exams.push({name: examArray[j].examID, value: "course POST value"});
						}
					});
				}
				callback(args);
			});
		break;
		case "cancel":
			args.action = "/student/cancel"; //POST action
			args.exams	= [
				{name:"exam display name1", value:"exam POST value"},
				{name:"exam display name2", value:"exam POST value"},
				{name:"exam display name3", value:"exam POST value"},
			];
			if (args.exams[req.query.exam]) {
					args.exams[req.query.exam].selected = true;
				}
			callback(args);
		break;
		case "list":
			args.data	= [
				{class:"class display name1", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=0"},
				{class:"class display name2", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=1"},
				{class:"class display name3", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=2"},
			]
			callback(args);
		break;
	}
};

//Gets the format of a Date in: Day of Week, Month Day of Month, Year
function prettyDate(date) {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

//Converts milliseconds to HH:MM AM/PM format
function msToHour(ms) {
	var hour = Math.floor(ms/3600000);
	var minutes = Math.floor((ms%3600000)/60000);
	if(minutes < 10) {
		minutes = '0' + minutes.toString();
	} else {
		minutes = minutes.toString();
	}
	if(hour > 12) {
		hour -= 12;
		return hour.toString() + ":" + minutes + "PM";
	} 
	return hour.toString() + ":" + minutes + "AM";
}

//milliseconds to apmpm
function ampm(ms) {
	if(ms >= 43200000) {
		return 'pm';
	}
	return 'am';
}