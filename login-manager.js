//require modules
var passport = require('passport');
var passportLocal = require('passport-local');

//require db
var db = require('./db');
var userdb = db.collection('userdb');

/*Strategy used by passport. Checks to see if there is a user with NetID with value username 
and that user's PasswordHash is equal to password*/
passport.use(new passportLocal.Strategy(
	function(username, password, done) {
		console.log(username);
	    userdb.findOne({ NetID: username }, function (err, user) {
	      if (err) { return done(err); }
	      if (!user) {
	      	console.log('invalid username');
	        return done(null, false, { message: 'Incorrect username.' });
	      }
	      if (user.PasswordHash != password) {
	      	console.log('invalid password');
	        return done(null, false, { message: 'Incorrect password.' });
	      }
	      return done(null, user);
	    });
	}
));

//Redirect to login if authentication failed, else redirect to homepage of user type
exports.authenticate = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
    	if (err) { return next(err); }
    	if (!user) { return res.redirect('/login'); }
    	req.logIn(user, function(err) {
      		if (err) { return next(err); }
      		return res.redirect('/' + user.Type);
    	});
  })(req, res, next);
}