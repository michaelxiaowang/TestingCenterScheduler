var db = require('./db');
var testingcenters = db.collection('testingcenters');

exports.updateTCInfo = function(req) {
	testingcenters.update({
    	Term: req.body.term
    },{
    	Term: req.body.term,
    	Seats: req.body.seats,
		SetAsideSeats: req.body.sas, //set-aside seats
		GapTime: req.body.gap,
		ReminderInterval: req.body.reminder //interval
    },{
     	upsert: true
    });
}