//require node modules
var path = require('path');
var multer = require('multer');
var upload = multer({dest: "temp/"});

//require view managers
var DD = require(path.join(__dirname, '../views/datadisplay'));
var NB = require(path.join(__dirname, '../views/navigationbar'));

//require application logic managers
var LM = require(path.join(__dirname, 'login-manager'));
var IM = require(path.join(__dirname, 'import-manager'));
var TM = require(path.join(__dirname, 'testingcenter-manager'));
var AM = require(path.join(__dirname, 'appointment-manager'));
var EM = require(path.join(__dirname, 'exam-manager'));

module.exports = function(app, fs) {
	//homepage redirects user to login if not logged in
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/' + req.user.Type);
		} else {
			res.redirect('/login');
		}
	});

	//login page redirects to root when authenticated
	app.get('/login', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/');
		} else {
			var args = {
				name: "",
				sidelink: {},
				title: "Login",
				partial: "login",
			};
			res.render('frame', args);
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
		} else if(req.user.Type != "student") {
			res.redirect('/' + req.user.Type);
		} else {
			res.redirect('/student/list');
		}
	})
	
	app.get('/student/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "student") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.student[req.params.value]) {
			res.redirect('/student/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.student,
				title: NB.student[req.params.value].name,
				partial: "student_" + req.params.value,
				logout: true,
			};
			DD.makeArgsStudent(req, args, function(args) {
				res.render('frame', args);
			});
		}
	})

	app.post('/student/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "student") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.student[req.params.value]) {
			res.redirect('/student/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.student,
				title: NB.student[req.params.value].name,
				partial: "student_" + req.params.value,
				logout: true,
			};
			switch(req.params.value) {
				case "add":
					//do something with these
					AM.studentCreateAppointment(req);
					args.result = "Success?"; //display result to user
				break;
				case "cancel":
					var exam	= req.body.exam; //exam POST value
					//do something with this
					args.result = "Success?"; //display result to user
				break;
			}
			DD.makeArgsStudent(req, args);
			res.render('frame', args);
		}
	});

	//instructor homepage
	app.get('/instructor', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "instructor") {
			res.redirect('/' + req.user.Type);
		} else {
			res.redirect('/instructor/list');
		}
	})
	
	app.get('/instructor/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "instructor") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.instructor[req.params.value]) {
			res.redirect('/instructor/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.instructor,
				title: NB.instructor[req.params.value].name,
				partial: "instructor_" + req.params.value,
				logout: true,
			};
			DD.makeArgsInstructor(req, args);
			res.render('frame', args);
		}
	});

	app.post('/instructor/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "instructor") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.instructor[req.params.value]) {
			res.redirect('/instructor/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.instructor,
				title: NB.instructor[req.params.value].name,
				partial: "instructor_" + req.params.value,
				logout: true,
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
					//do something with this
					EM.removePendingExam(req); //display result to user
					//args.result = "test";
				break;
				case "request":
					EM.createExam(req);
				break;
			}
			DD.makeArgsInstructor(req, args);
			res.render('frame', args);
		}
	});

	//admin homepage
	app.get('/admin', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "admin") {
			res.redirect('/' + req.user.Type);
		} else {
			res.redirect('/admin/list');
		}
	});
	
	app.get('/admin/:value', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "admin") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.admin[req.params.value]) {
			res.redirect('/admin/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.admin,
				title: NB.admin[req.params.value].name,
				partial: "admin_" + req.params.value,
				logout: true,
			};
			DD.makeArgsAdmin(req, args);
			res.render('frame', args);
		}
	});

	app.post('/admin/:value', upload.single('csvfile'), function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "admin") {
			res.redirect('/' + req.user.Type);
		} else if(!NB.admin[req.params.value]) {
			res.redirect('/admin/list');
		} else {
			var args = {
				name: req.user.username,
				sidelink: NB.admin,
				title: NB.admin[req.params.value].name,
				partial: "admin_" + req.params.value,
				logout: true,
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
					var uploadStatus = IM.upload(req, res);
					args.result = uploadStatus; //display result to user
				break;
				case "info":
					var term 		= req.body.term;
					var termname	= req.body.termname;
					var seats 		= req.body.seats;
					var sas			= req.body.sas; //set-aside seats
					var gap			= req.body.gap;
					var reminder	= req.body.reminder; //interval
					//monday hours
					var from_hour_mon	= req.body.from_hour_mon;
					var from_minute_mon	= req.body.from_minute_mon;
					var from_ampm_mon	= req.body.from_ampm_mon;
					var to_hour_mon		= req.body.to_hour_mon;
					var to_minute_mon	= req.body.to_minute_mon;
					var to_ampm_mon		= req.body.to_ampm_mon;
					//tuesday hours
					var from_hour_tue	= req.body.from_hour_tue;
					var from_minute_tue	= req.body.from_minute_tue;
					var from_ampm_tue	= req.body.from_ampm_tue;
					var to_hour_tue		= req.body.to_hour_tue;
					var to_minute_tue	= req.body.to_minute_tue;
					var to_ampm_tue		= req.body.to_ampm_tue;
					//wednesday hours
					var from_hour_wed	= req.body.from_hour_wed;
					var from_minute_wed	= req.body.from_minute_wed;
					var from_ampm_wed	= req.body.from_ampm_wed;
					var to_hour_wed		= req.body.to_hour_wed;
					var to_minute_wed	= req.body.to_minute_wed;
					var to_ampm_wed		= req.body.to_ampm_wed;
					//thursday hours
					var from_hour_thu	= req.body.from_hour_thu;
					var from_minute_thu	= req.body.from_minute_thu;
					var from_ampm_thu	= req.body.from_ampm_thu;
					var to_hour_thu		= req.body.to_hour_thu;
					var to_minute_thu	= req.body.to_minute_thu;
					var to_ampm_thu		= req.body.to_ampm_thu;
					//friday hours
					var from_hour_fri	= req.body.from_hour_fri;
					var from_minute_fri	= req.body.from_minute_fri;
					var from_ampm_fri	= req.body.from_ampm_fri;
					var to_hour_fri		= req.body.to_hour_fri;
					var to_minute_fri	= req.body.to_minute_fri;
					var to_ampm_fri		= req.body.to_ampm_fri;
					//saturday hours
					var from_hour_sat	= req.body.from_hour_sat;
					var from_minute_sat	= req.body.from_minute_sat;
					var from_ampm_sat	= req.body.from_ampm_sat;
					var to_hour_sat		= req.body.to_hour_sat;
					var to_minute_sat	= req.body.to_minute_sat;
					var to_ampm_sat		= req.body.to_ampm_sat;
					//sunday hours
					var from_hour_sun	= req.body.from_hour_sun;
					var from_minute_sun	= req.body.from_minute_sun;
					var from_ampm_sun	= req.body.from_ampm_sun;
					var to_hour_sun		= req.body.to_hour_sun;
					var to_minute_sun	= req.body.to_minute_sun;
					var to_ampm_sun		= req.body.to_ampm_sun;
					//closd periods
					var closed = new Array();
					var i = 0;
					while(req.body["closed_from_month_"+i]) {
						closed[i] = new Object();
						closed[i].from_month= req.body["closed_from_month_"	+i];
						closed[i].from_day	= req.body["closed_from_day_"	+i];
						closed[i].to_month	= req.body["closed_to_month_"	+i];
						closed[i].to_day	= req.body["closed_to_day_"		+i];
						i++;
					}
					//reserved periods
					var reserved = new Array();
					i = 0;
					while(req.body["from_month_"+i]) {
						reserved[i] = new Object();
						reserved[i].from_month	= req.body["from_month_"	+i];
						reserved[i].from_day	= req.body["from_day_"		+i];
						reserved[i].from_hour	= req.body["from_hour_"		+i];
						reserved[i].from_minute	= req.body["from_minute_"	+i];
						reserved[i].from_ampm	= req.body["from_ampm_"		+i];
						reserved[i].to_month	= req.body["to_month_"		+i];
						reserved[i].to_day		= req.body["to_day_"		+i];
						reserved[i].to_hour		= req.body["to_hour_"		+i];
						reserved[i].to_minute	= req.body["to_minute_"		+i];
						reserved[i].to_ampm		= req.body["to_ampm_"		+i];
						i++;
					}
					//do something with these
					TM.updateTCInfo(req);
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
			DD.makeArgsAdmin(req, args);
			res.render('frame', args);
		}
	});
	
	//Log the user out and return to login page
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login')
	});

	//If every other route fails then user is directed back to root
	app.get('/*', function(req, res) {
		res.redirect('/');
	});
};