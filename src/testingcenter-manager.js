//Require our db and necessary collections
var db = require('./db');
var testingcenters = db.collection('testingcenters');

//Exported functions can be used by other file that require this module

/*Updates the testing center info, there can only be one testing center with a particular term,
For duplicate terms, the newest one will replace previous versions*/
exports.updateTCInfo = function(req, callback) {

    //If name field is empty reject the update
    if(req.body.termname == null || req.body.termname.match(/^\s*$/)) {
        return callback("FAILED: Must have name field.");
    }

    //If any of the weeks operating hours has a end time earlier than the start time
    if(hourToMS(req.body.from_hour_mon, req.body.from_minute_mon, req.body.from_ampm_mon) > hourToMS(req.body.to_hour_mon, req.body.to_minute_mon, req.body.to_ampm_mon) ||
        hourToMS(req.body.from_hour_tue, req.body.from_minute_tue, req.body.from_ampm_tue) > hourToMS(req.body.to_hour_tue, req.body.to_minute_tue, req.body.to_ampm_tue) ||
        hourToMS(req.body.from_hour_wed, req.body.from_minute_wed, req.body.from_ampm_wed) > hourToMS(req.body.to_hour_wed, req.body.to_minute_wed, req.body.to_ampm_wed) ||
        hourToMS(req.body.from_hour_thu, req.body.from_minute_thu, req.body.from_ampm_thu) > hourToMS(req.body.to_hour_thu, req.body.to_minute_thu, req.body.to_ampm_thu) ||
        hourToMS(req.body.from_hour_fri, req.body.from_minute_fri, req.body.from_ampm_fri) > hourToMS(req.body.to_hour_fri, req.body.to_minute_fri, req.body.to_ampm_fri) ||
        hourToMS(req.body.from_hour_sat, req.body.from_minute_sat, req.body.from_ampm_sat) > hourToMS(req.body.to_hour_sat, req.body.to_minute_sat, req.body.to_ampm_sat) ||
        hourToMS(req.body.from_hour_sun, req.body.from_minute_sun, req.body.from_ampm_sun) > hourToMS(req.body.to_hour_sun, req.body.to_minute_sun, req.body.to_ampm_sun)) {
        return callback("FAILED: at least one of the operating hour time ranges has end time before the start time.");
    }

    //Check for valid closed dates
    var closed = new Array();
    var i = 0;
    while(req.body["closed_from_month_"+i]) {
        closed[i] = new Object();
        closed[i].Start = new Date(req.body["closed_from_year_" +i], req.body["closed_from_month_" +i]-1, req.body["closed_from_day_"   +i]);
        closed[i].End = new Date(req.body["closed_to_year_" +i], req.body["closed_to_month_" +i]-1, req.body["closed_to_day_"   +i]);
        //Check to see if the end date is earlier than the start date; if they are equal we assume that one day is closed
        if(closed[i].End < closed[i].Start) {
            return callback("FAILED: at least one of the closed date ranges has an end time that is earlier than the start time.");
        }
        i++;
    }

    //Check valid for reserved periods
    var reserved = new Array();
    i = 0;
    while(req.body["from_month_"+i]) {
        reserved[i] = new Object();
        if(req.body["from_ampm_"+i] == 'pm') {
            if(parseInt(req.body["from_hour_"+i]) != 12) {
                req.body["from_hour_"+i] = parseInt(req.body["from_hour_"+i]) + 12;
            }
        } else if(parseInt(req.body["from_hour_"+i]) == 12) {
            req.body["from_hour_"+i] = 0;
        }
        reserved[i].Start = new Date(req.body["from_year_"+i], req.body["from_month_"+i]-1, req.body["from_day_"+i], req.body["from_hour_"+i], req.body["from_minute_"+i]);
        if(req.body["to_ampm_"+i] == 'pm') {
            if(parseInt(req.body["to_hour_"+i]) != 12) {
                req.body["to_hour_"+i] = parseInt(req.body["to_hour_"+i]) + 12;
            }
        } else if(parseInt(req.body["to_hour_"+i]) == 12) {
            req.body["to_hour_"+i] = 0;
        }
        reserved[i].End = new Date(req.body["to_year_"+i], req.body["to_month_"+i]-1, req.body["to_day_"+i], req.body["to_hour_"+i], req.body["to_minute_"+i]);
        //Check to see if the end time is earlier than or equal the start time
        if(reserved[i].End <= reserved[i].Start) {
            return callback("FAILED: at least one of the reserved date ranges has an end time that is earlier or equal to the start time.");
        }
        i++;
    }

    //Valid gap time is checked by the form

    //Check if a testing center with this term name already exists
    testingcenters.findOne({Name: req.body.termname}, function(err, tctermbyname) {
        if(err) {
            console.log(err);
        }
        //If the term and name are both equal, it must be the same term
        //But if not, then you cannot have duplicate term names
        if(tctermbyname != null && tctermbyname.Name.toUpperCase() == req.body.termname.toUpperCase() && tctermbyname.Term != req.body.term) {
            return callback("FAILED: A term with this name already exists with a different term number.");
        } else {
            testingcenters.findOne({Term: req.body.term}, function(err, tctermbyterm) {
                if(err) {
                    console.log(err);
                }
                //Check if there is a term with this term number that doesn't have this name
                if(tctermbyterm != null && tctermbyterm.Name.toUpperCase() != req.body.termname.toUpperCase() && tctermbyterm.Term == req.body.term) {
                    return callback("FAILED: A term with this term number already exists with a different term name.");
                } else {
                    //make testing center object
                    updatedTC = {
                        Term: req.body.term,
                        Name: req.body.termname,
                        Status: req.body.termstatus,
                        numSeats: req.body.seats,
                        numSetAside: req.body.sas, //set-aside seats
                        gapTime: req.body.gap,
                        OperatingHours: [
                            //Convert all the HH:MM AM/PM to milliseconds
                            [hourToMS(req.body.from_hour_sun, req.body.from_minute_sun, req.body.from_ampm_sun), hourToMS(req.body.to_hour_sun, req.body.to_minute_sun, req.body.to_ampm_sun)],
                            [hourToMS(req.body.from_hour_mon, req.body.from_minute_mon, req.body.from_ampm_mon), hourToMS(req.body.to_hour_mon, req.body.to_minute_mon, req.body.to_ampm_mon)],
                            [hourToMS(req.body.from_hour_tue, req.body.from_minute_tue, req.body.from_ampm_tue), hourToMS(req.body.to_hour_tue, req.body.to_minute_tue, req.body.to_ampm_tue)],
                            [hourToMS(req.body.from_hour_wed, req.body.from_minute_wed, req.body.from_ampm_wed), hourToMS(req.body.to_hour_wed, req.body.to_minute_wed, req.body.to_ampm_wed)],
                            [hourToMS(req.body.from_hour_thu, req.body.from_minute_thu, req.body.from_ampm_thu), hourToMS(req.body.to_hour_thu, req.body.to_minute_thu, req.body.to_ampm_thu)],
                            [hourToMS(req.body.from_hour_fri, req.body.from_minute_fri, req.body.from_ampm_fri), hourToMS(req.body.to_hour_fri, req.body.to_minute_fri, req.body.to_ampm_fri)],
                            [hourToMS(req.body.from_hour_sat, req.body.from_minute_sat, req.body.from_ampm_sat), hourToMS(req.body.to_hour_sat, req.body.to_minute_sat, req.body.to_ampm_sat)]
                           
                        ],
                        ClosedDates: closed,
                        ReservedDates: reserved,
                        ReminderInterval: req.body.reminder, //interval
                    }

                    //Can't edit past terms
                    if(req.body.termstatus == "past") {
                        if(tctermbyterm != null && tctermbyterm.Status == "past") {
                            return callback('FAILED: Cannot edit a past term.');
                        } else if(tctermbyterm == null) {
                            return callback('FAILED: Cannot create a past term.');
                        }
                        testingcenters.update({
                            Term: req.body.term
                        }, {
                            $set: {Status: "past"}
                        });
                        callback("SUCCESS: Updated Term Info.");
                    } else if(req.body.termstatus == "current") {
                        //if status is current, check to make sure the current term is the one being updated
                        testingcenters.findOne({Status: "current"}, function(err, currentterm) {
                            if(err) {
                                console.log("err");
                            }
                            //if it isn't an update
                            if(currentterm != null && currentterm.Term != req.body.term) {
                                return callback("A different term already exists as the current term");
                            } else {
                                testingcenters.update({
                                    Term: req.body.term
                                }, updatedTC, {
                                    upsert: true
                                });
                                callback("SUCCESS: Updated Term Info.");
                            }   
                        });
                    } else { //must be future
                        testingcenters.update({
                            Term: req.body.term
                        }, updatedTC, {
                            upsert: true
                        });
                        callback("SUCCESS: Updated Term Info.");
                    }
                }
            });
        }
    });
}

//HH:MM AM/PM format to milliseconds
function hourToMS(hours, minutes, ampm) {
    if(ampm == 'pm') {
        if(hours < 12) {
            hours = parseInt(hours) + 12;
        }
        return hours*3600000 + minutes*60000;
    } else {
        if(hours == 12) {
            hours = 0;
        }
        return hours*3600000 + minutes*60000;
    }
}