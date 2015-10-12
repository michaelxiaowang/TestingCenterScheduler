var path = require('path');
var LM = require(path.join(__dirname, 'login-manager'));

var admin = {
	info:{
		name: "Edit Info",
		link: "/admin/info"
	},
	import:{
		name: "Import Data",
		link: "/admin/import"
	},
	util:{
		name: "Display Utilization",
		link: "/admin/util"
	},
	review:{
		name: "Review Requests",
		link: "/admin/review"
	},
	add:{
		name: "Add Appointment",
		link: "/admin/add"
	},
	list:{
		name: "Appointment List",
		link: "/admin/list"
	},
	checkin:{
		name: "Check-In Student",
		link: "/admin/checkin"
	},
	report:{
		name: "Generate Report",
		link: "/admin/report"
	}
};

var instructor = {
	attendance: {
		name: "See Attendance",
		link: "/instructor/attendance"
	},
	cancel: {
		name: "Cancel Request",
		link: "/instructor/cancel"
	},
	list: {
		name: "View All Exams",
		link: "/instructor/list"
	},
	request: {
		name: "Request Exam",
		link: "/instructor/request"
	}
};

var student = {
	add: {
		name: "Add Appointment",
		link: "/student/add"
	},
	cancel: {
		name: "Cancel Appt.",
		link: "/student/cancel"
	},
	list: {
		name: "Appointment List",
		link: "/student/list"
	}
};

module.exports = function(app) {
	
	//homepage redirects user to login if not logged in
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			console.log(req.user);
			res.redirect('/student');
		} else {
			res.redirect('/login');
		}
	});

	//login page
	app.get('/login', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/');
		} else {
			res.render('login');
		}	
	});

	app.post('/login', function(req, res, next) {
		LM.authenticate(req, res, next);
	});

	//user pages will redirect:
	//to /login when user is not authenticated
	//to /admin if an admin tries to access /student or /instructor
	//to /instructor if an admin tries to access /student or /admin
	//to /student if an admin tries to access /admin or /instructor

	//student homepage
	app.get('/student', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "student") {
			res.redirect('/' + req.user.usertype);
		} else {
			res.redirect('/student/list');
		}
	})
	
	app.get('/student/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "student") {
			res.redirect('/' + req.user.usertype);
		} else if(!student[req.params.value]) {
			res.redirect('/student/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: student,
				title: student[req.params.value].name,
				partial: "student_" + req.params.value,
			};
			makeArgsStudent(req.params.value, args);
			if (req.params.value == "cancel") {
				if (args.exams[req.query.exam]) {
					args.exams[req.query.exam].selected = true;
				}
			}
			res.render('frame', args);
		}
	})

	app.post('/student/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "student") {
			res.redirect('/' + req.user.usertype);
		} else if(!student[req.params.value]) {
			res.redirect('/student/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: student,
				title: student[req.params.value].name,
				partial: "student_" + req.params.value,
			};
			switch(req.params.value) {
				case "add":
					var course 	= req.body.course;
					var month 	= req.body.month;
					var day 	= req.body.day;
					var hour 	= req.body.hour;
					var minute 	= req.body.minute;
					var ampm 	= req.body.ampm; //'am' or 'pm'
					//do something with these
					args.result = "Success?"; //display result to user
				break;
				case "cancel":
					var exam	= req.body.exam; //exam POST value
					//do something with this
					args.result = "Success?"; //display result to user
				break;
			}
			makeArgsStudent(req.params.value, args);
			res.render('frame', args);
		}
	});

	//instructor homepage
	app.get('/instructor', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "instructor") {
			res.redirect('/' + req.user.usertype);
		} else {
			res.redirect('/instructor/list');
		}
	})
	
	app.get('/instructor/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "instructor") {
			res.redirect('/' + req.user.usertype);
		} else if(!instructor[req.params.value]) {
			res.redirect('/instructor/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: instructor,
				title: instructor[req.params.value].name,
				partial: "instructor_" + req.params.value,
			};
			makeArgsInstructor(req.params.value, args);
			if (req.params.value == "cancel") {
				if (args.exams[req.query.exam]) {
					args.exams[req.query.exam].selected = true;
				}
			}
			res.render('frame', args);
		}
	});

	app.post('/instructor/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "instructor") {
			res.redirect('/' + req.user.usertype);
		} else if(!instructor[req.params.value]) {
			res.redirect('/instructor/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: instructor,
				title: instructor[req.params.value].name,
				partial: "instructor_" + req.params.value,
			};
			switch(req.params.value) {
				case "attendance":
					args.data	= [ //result based on input
						{student:"student display", time:"appointment time", seat:"assigned seat", present:"present for appointment (Yes/No)"},
						{student:"student display", time:"appointment time", seat:"assigned seat", present:"present for appointment (Yes/No)"},
						{student:"student display", time:"appointment time", seat:"assigned seat", present:"present for appointment (Yes/No)"},
					];
				break;
				case "cancel":
					var exam 	= req.body.exam; //exam POST value
					//do something with this
					args.result = "Success?"; //display result to user
				break;
				case "request":
					var start_month	= req.body.start_month;
					var start_day	= req.body.start_day;
					var start_hour	= req.body.start_hour;
					var start_minute= req.body.start_minute;
					var start_ampm	= req.body.start_ampm;
					var end_month	= req.body.end_month;
					var end_day		= req.body.end_day;
					var end_hour	= req.body.end_hour;
					var end_minute	= req.body.end_minute;
					var end_ampm	= req.body.end_ampm;
					var duration	= req.body.duration;
					var type		= req.body.type;	//'course' or 'ad-hoc'
					var course		= req.body.course;	//course
					var term		= req.body.term;	//course
					var name		= req.body.name;	//ad-hoc
					var students	= req.body.students;//ad-hoc
				break;
			}
			makeArgsInstructor(req.params.value, args);
			res.render('frame', args);
		}
	});

	//admin homepage
	app.get('/admin', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "admin") {
			res.redirect('/' + req.user.usertype);
		} else {
			res.redirect('/admin/list');
		}
	});
	
	app.get('/admin/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "admin") {
			res.redirect('/' + req.user.usertype);
		} else if(!admin[req.params.value]) {
			res.redirect('/admin/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: admin,
				title: admin[req.params.value].name,
				partial: "admin_" + req.params.value,
			};
			makeArgsAdmin(req.params.value, args);
			res.render('frame', args);
		}
	});

	app.post('/admin/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.usertype != "admin") {
			res.redirect('/' + req.user.usertype);
		} else if(!admin[req.params.value]) {
			res.redirect('/admin/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: admin,
				title: admin[req.params.value].name,
				partial: "admin_" + req.params.value,
			};
			switch(req.params.value) {
				case "add":
					var id 		= req.body.studentid;
					var course 	= req.body.course;
					var month 	= req.body.month;
					var day 	= req.body.day;
					var hour 	= req.body.hour;
					var minute 	= req.body.minute;
					var ampm 	= req.body.ampm; //'am' or 'pm'
					//do something with these
					args.result = "Success?"; //display result to user
				break;
				case "checkin":
					var id		= req.body.studentid;
					//do something with this
					args.data	= [ //result based on input
						{class:"class display name", date:"display date", time:"display time", confirm:"/admin/?"},
						{class:"class display name", date:"display date", time:"display time", confirm:"/admin/?"},
						{class:"class display name", date:"display date", time:"display time", confirm:"/admin/?"},
					];
				break;
				case "import":
					var file 	= req.body.file;
					//do something with this
					args.result = "Success?"; //display result to user
				break;
				case "info":
					var seats 	= req.body.seats;
					var sas		= req.body.sas; //set-aside seats
					var gap		= req.body.gap;
					var reminder= req.body.reminder; //interval
					//do something with these
					args.result = "Saved?"; //display result to user
				break;
				case "report":
					var type	= req.body.type; //'day' 'week' 'term' or 'range'
					var start	= req.body.start; //term
					var end 	= req.body.end; //term
					var isExport= req.body.export; //if set, export was clicked
					//do something with these
					if (type == "day") {
						args.day = true;
						args.data = [
							{day:"display day", appts:"number of appointments"},
							{day:"display day", appts:"number of appointments"},
							{day:"display day", appts:"number of appointments"},
						];
					} else
					if (type == "week") {
						args.week = true;
						args.data = [
							{week:"display week", appts:"number of appointments", courses:"list of courses"},
							{week:"display week", appts:"number of appointments", courses:"list of courses"},
							{week:"display week", appts:"number of appointments", courses:"list of courses"},
						];
					} else
					if (type == "term") {
						args.term = true;
						args.data = [
							{course:"course display name"},
							{course:"course display name"},
							{course:"course display name"},
						];
					} else
					if (type == "range") {
						args.range = true;
						args.data = [
							{term:"term display name", appts:"number of appointments"},
							{term:"term display name", appts:"number of appointments"},
							{term:"term display name", appts:"number of appointments"},
						];
					}
				break;
				case "util":
					var from_term	= req.body.from_term; //term
					var from_month	= req.body.from_month; //1-12
					var from_day	= req.body.from_day; //0-59
					var to_term		= req.body.to_term; //term
					var to_month	= req.body.to_month; //1-12
					var to_day		= req.body.to_day; //0-59
					//do something with these
					args.data = [
						{day:"display date", util:"utilization (see spec)"},
						{day:"display date", util:"utilization (see spec)"},
						{day:"display date", util:"utilization (see spec)"},
					];
				break;
			}
			makeArgsAdmin(req.params.value, args);
			res.render('frame', args);
		}
	});
	
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login')
	});
};

function makeArgsAdmin(page, args) {
	switch(page) {
		case "info": //Edit Info
			args.action		= "/admin/info"; //POST action
			args.seats		= 64; //current setting for # of total seats
			args.sas		= 8; //current setting for # of set-aside seats
			//TODO: date range
			args.gap		= 0; //current setting for gap time
			args.reminder	= 1440 //current setting for reminder interval
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
			args.data = [
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
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
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
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

function makeArgsInstructor(page, args) {
	switch(page) {
		case "attendance":
			args.action = "/instructor/attendance"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "cancel":
			args.action = "/instructor/cancel"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "list":
			args.data	= [
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
			]
		break;
		case "request":
			args.action	= "/instructor/request"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
			args.terms	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
		break;
	}
}

function makeArgsStudent(page, args) {
	switch(page) {
		case "add":
			args.action = "/student/add"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
		break;
		case "cancel":
			args.action = "/student/cancel"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "list":
			args.data	= [
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
			]
		break;
	}
}