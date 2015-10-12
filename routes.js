var path = require('path');
var multer = require('multer');
var upload = multer({dest: "temp/"});

var LM = require(path.join(__dirname, 'login-manager'));
var IM = require(path.join(__dirname, 'import-manager'));

module.exports = function(app, fs) {
	
	//homepage redirects user to login if not logged in
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			console.log(req.user);
			res.redirect('/' + req.user.Type);
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
		} else if(req.user.Type != "student") {
			res.redirect('/' + req.user.Type);
		} else {
			res.render('student', {
				name: req.user.username
			});
		}
	})

	app.post('/student', function(req, res) {
		req.logout();
		res.redirect('/login')
	});

	//instructor homepage
	app.get('/instructor', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "instructor") {
			res.redirect('/' + req.user.Type);
		} else {
			res.render('instructor', {
				name: req.user.username
			});
		}
	})

	app.post('/instructor', function(req, res) {
		req.logout();
		res.redirect('/login')
	});

	//admin homepage
	app.get('/admin', function(req, res) {
		if(!req.isAuthenticated()) {
			res.redirect('/login');
		} else if(req.user.Type != "admin") {
			res.redirect('/' + req.user.Type);
		} else {
			res.render('admin', {
				name: req.user.username
			});
		}
	});

	app.post('/admin', function(req, res) {
		req.logout();
		res.redirect('/login')
	});

	//import data page
	app.get('/import', function(req, res) {
		if(!req.isAuthenticated() || req.user.Type!='admin') {
			res.redirect('/');
		} else {
			res.render('import');
		}
	});

	app.post('/import', upload.single('csvfile'), function(req, res) {
		if(!req.isAuthenticated() || req.user.Type !='admin') {
			res.redirect('/');
		} else {
			IM.upload(req, res);
			res.redirect('/admin');
		}
	});
};