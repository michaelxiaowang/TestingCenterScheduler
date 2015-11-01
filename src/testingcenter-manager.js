var db = require('./db');
var testingcenters = db.collection('testingcenters');

//Exported functions can be used by other file that require this module

/*Updates the testing center info, there can only be one testing center with a particular term,
For duplicate terms, the newest one will replace previous versions*/
exports.updateTCInfo = function(req) {
	testingcenters.update({
    	Term: req.body.term
    },{
    	Term: req.body.term,
        Name: "Fall 2015",
    	numSeats: req.body.seats,
		numSetAside: req.body.sas, //set-aside seats
		gapTime: req.body.gap,
        OperatingHours: {
            Monday: [36000000, 72000000],
            Tuesday: [36000000, 72000000],
            Wednesday: [36000000, 72000000],
            Thursday: [36000000, 72000000],
            Friday: [36000000, 72000000],
            Saturday: [0, 0],
            Sunday: [0, 0]
        },
        ClosedDates: [
            {
                Start: new Date("December 20, 2015"),
                End: new Date("January 2, 2016")
            }],
        ReservedDates: [
            {
                Start: new Date("November 21, 2015"),
                End: new Date("November 22, 2015")
            }],
        ReminderInterval: req.body.reminder, //interval
    },{
     	upsert: true
    });
}