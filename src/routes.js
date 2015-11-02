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
			DD.makeArgsStudent(req, args, function(args) {
				res.render('frame', args);
			});
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
					DD.makeArgsInstructor(req, args);
					res.render('frame', args);
				break;
				case "cancel":
					//do something with this
					EM.removePendingExam(req, function(result) {
						args.result = result; //display result to user
						DD.makeArgsInstructor(req, args);
						res.render('frame', args);
					}); 
				break;
				case "request":
					EM.createExam(req, function(result) {
						args.result = result;
						DD.makeArgsInstructor(req, args);
						res.render('frame', args);
					});
				break;
			}
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
			DD.makeArgsAdmin(req, args, function() {
				res.render('frame', args);
			});
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
					//do something with these
					TM.updateTCInfo(req, args);
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
			DD.makeArgsAdmin(req, args, function() {
				res.render('frame', args);
			});	
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