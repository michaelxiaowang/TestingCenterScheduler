module.exports = function(app, passport) {
	
	//homepage redirects user to login if not logged in
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			res.render('student', {
				name: req.user.username
			});
		} else {
			res.redirect('/login');
		}
	});

	app.post('/', function(req, res) {
		res.redirect('/login')
	});

	//login page
	app.get('/login', function(req, res) {
		res.render('login');
	});

	app.post('/login', passport.authenticate('local'), function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/');
		} else {
			res.redirect('/login');
		}
	});
};