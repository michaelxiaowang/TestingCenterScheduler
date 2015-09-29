module.exports = function(app, passport, passportLocal) {
	passport.use(new passportLocal.Strategy(function(username, password, done) {
		if(username == password) {
			done(null, {id: username, name: username});
		} else {
			done(null, null);
		}
	}));
}