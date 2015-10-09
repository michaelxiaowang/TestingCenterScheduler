var passport = require('passport');
var passportLocal = require('passport-local');

passport.use(new passportLocal.Strategy(function(username, password, done) {
	if(username == password) {
		done(null, {id: username, name: username, usertype: username});
	} else {
		done(null, null);
	}
}));

exports.authenticate = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
    	if (err) { return next(err); }
    	if (!user) { return res.redirect('/login'); }
    	req.logIn(user, function(err) {
      		if (err) { return next(err); }
      		return res.redirect('/' + user.usertype);
    	});
  })(req, res, next);
}