//The makeArgs function query the database for relevant info and display it to the user
exports.makeArgsAdmin = function(page, args) {
	switch(page) {
		case "info": //Edit Info
			args.action		= "/admin/info"; //POST action
			args.seats		= 64; //current setting for # of total seats
			args.sas		= 8; //current setting for # of set-aside seats
			//TODO: date range
			args.gap		= 0; //current setting for gap time
			args.reminder	= 1440 //current setting for reminder interval
		break;
		case "import": //Import Data
			args.action = "/admin/import"; //POST action
		break;
		case "util": //Display Utilization
			args.action = "/admin/util";
			args.terms	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
		break;
		case "review": //Review Requests
			args.data = [
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
				{class:"class display name", start:"start date/time", end:"end date/time", approve:"/admin/?", deny:"/admin/?"},
			];
		break;
		case "add": //Add Appointment
			args.action = "/admin/add"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
		break;
		case "list": //Appointment List
			args.data	= [
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
				{class:"class display name", student:"student display", date:"display date", time:"display time", cancel:"/admin/?", modify:"/admin/?"},
			];
		break;
		case "checkin": //Check-In Student
			args.action = "/admin/checkin"; //POST action
		break;
		case "report": //Generate Report
			args.action = "/admin/report"; //POST action
			args.terms 	= [
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
		break;
	}
}

exports.makeArgsInstructor = function(page, args) {
	switch(page) {
		case "attendance":
			args.action = "/instructor/attendance"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "cancel":
			args.action = "/instructor/cancel"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "list":
			args.data	= [
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
				{exam:"exam display name", start:"start display time", end:"end display time", status:"Approved/Denied/Pending", scheduled:"# students scheduled", taken:"# students taken", cancel:"/instructor/cancel?exam=?"},
			]
		break;
		case "request":
			args.action	= "/instructor/request"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
			args.terms	= [
				{name:"test", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
				{name:"term display name", value:"term POST value"},
			];
		break;
	}
}

exports.makeArgsStudent = function(page, args) {
	switch(page) {
		case "add":
			args.action = "/student/add"; //POST action
			args.courses= [
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
				{name:"course Display Name", value:"course POST value"},
			];
		break;
		case "cancel":
			args.action = "/student/cancel"; //POST action
			args.exams	= [
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
				{name:"exam display name", value:"exam POST value"},
			];
		break;
		case "list":
			args.data	= [
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
				{class:"class display name", date:"exam display date", time:"exam display time", cancel:"/student/cancel?exam=?"},
			]
		break;
	}
}