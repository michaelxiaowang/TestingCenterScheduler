//require db
var db = require('../src/db');
var exams = db.collection('exams');
var classes = db.collection('classes');
var roster = db.collection('roster');
var testingcenters = db.collection('testingcenters');

//The makeArgs function query the database for relevant info and display it to the user
exports.makeArgsAdmin = function(req, args) {
	switch(req.params.value) {
		case "info": //Edit Info
			if (req.query.term) {
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
			} else {
				args.term = 0;
			}
		break;
		case "import": //Import Data
			args.action = "/admin/import"; //POST action
		break;
		case "util": //Display Utilization
			args.action = "/admin/util";
			args.terms	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
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
			args.data = [
				{course:"course display name", start:"start date/time", end:"end date/time", approve:"/admin/review?approve=?", deny:"/admin/review?deny=?"},
				{course:"course display name", start:"start date/time", end:"end date/time", approve:"/admin/review?approve=?", deny:"/admin/review?deny=?"},
				{course:"course display name", start:"start date/time", end:"end date/time", approve:"/admin/review?approve=?", deny:"/admin/review?deny=?"},
			];
		break;
		case "add": //Add Appointment
			args.action = "/admin/add"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
		break;
		case "list": //Appointment List
			args.data	= [
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{course:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
			];
		break;
		case "checkin": //Check-In Student
			args.action = "/admin/checkin"; //POST action
		break;
		case "report": //Generate Report
			args.action = "/admin/report"; //POST action
			args.terms 	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
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
						//Find the number of hours/minutes
						var startHour = Math.floor((examArray[i].startTime/3600000));
						var startMin = Math.floor((examArray[i].startTime%3600000)/60000);
						//If minutes are less than 10, pad with another 0
						if(startMin < 10) {
							startMin = '0' + startMin.toString();
						} else {
							startMin = startMin.toString();
						}
						//If hours > 12, subtract 12 and it is PM time, else it is AM time
						if(startHour > 12) {
							startHour -= 12;
							var startTime = startHour.toString() + ":" + startMin + "PM";
						} else {
							var startTime = startHour.toString() + ":" + startMin + "AM";
						}
						//Find the number of hours/minutes
						var endHour = Math.floor((examArray[i].endTime/3600000));
						var endMin = Math.floor((examArray[i].endTime%3600000)/60000);
						//If minutes are less than 10, pad with another 0
						if(endMin < 10) {
							endMin = '0' + endMin.toString();
						} else {
							endMin = endMin.toString();
						}
						//If hours > 12, subtract 12 and it is PM time, else it is AM time
						if(endHour > 12) {
							endHour -= 12;
							var endTime = endHour.toString() + ":" + endMin + "PM";
						} else {
							var endTime = endHour.toString() + ":" + endMin + "AM";
						}
						args.data.push({exam: examArray[i].examID, start: startTime, end: endTime,
							status: examArray[i].status, scheduled: 0, taken: 0, cancel:"/instructor/cancel?exam=" + i});
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
						args.courses.push({name: classArray[i].Class, value: "course POST value"});
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
			roster.find({Roster: [req.user.NetID]}).toArray(function(err, rosterArray) {
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
}