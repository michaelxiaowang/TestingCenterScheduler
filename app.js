//require modules
var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var passport = require('passport');
var passportLocal = require('passport-local');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');

var app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({ 
	secret: process.env.SECRET || 'secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, {id: id, username: id, usertype: id});
});

//routes
require(path.join(__dirname, 'routes'))(app);

//create a secure server with https and pass our credentials
var server = https.createServer({
	cert: fs.readFileSync(path.join(__dirname, 'credentials/myCert.crt')),
	key: fs.readFileSync(path.join(__dirname, 'credentials/myKey.key'))
}, app);

//set port and listen to it
var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log("Listening on https://127.0.0.1:" + port);
});