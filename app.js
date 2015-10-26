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
var hbs = require('hbs');

var log = require("./logger").LOG;

//require db
var db = require('./db');
var users = db.collection('users');

var app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/img', express.static('img'));

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper("alt", function(index_count,block) {
	if(parseInt(index_count)%2 === 1)
		return block.fn(this);
});

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
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
		users.findOne({_id: new require('mongodb').ObjectID(id)}, function(err, user) {
	    done(err, user);
	});
});

//routes
require(path.join(__dirname, 'routes'))(app, fs);

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

console.log("Listening on port " + port);