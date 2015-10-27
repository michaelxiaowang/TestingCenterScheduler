//The variables hold information for the page name and route
exports.admin = {
	info:{
		name: "Edit Info",
		link: "/admin/info"
	},
	import:{
		name: "Import Data",
		link: "/admin/import"
	},
	util:{
		name: "Display Utilization",
		link: "/admin/util"
	},
	review:{
		name: "Review Requests",
		link: "/admin/review"
	},
	add:{
		name: "Add Appointment",
		link: "/admin/add"
	},
	list:{
		name: "Appointment List",
		link: "/admin/list"
	},
	checkin:{
		name: "Check-In Student",
		link: "/admin/checkin"
	},
	report:{
		name: "Generate Report",
		link: "/admin/report"
	}
};

exports.instructor = {
	attendance: {
		name: "See Attendance",
		link: "/instructor/attendance"
	},
	cancel: {
		name: "Cancel Request",
		link: "/instructor/cancel"
	},
	list: {
		name: "View All Exams",
		link: "/instructor/list"
	},
	request: {
		name: "Request Exam",
		link: "/instructor/request"
	}
};

exports.student = {
	add: {
		name: "Add Appointment",
		link: "/student/add"
	},
	cancel: {
		name: "Cancel Appt.",
		link: "/student/cancel"
	},
	list: {
		name: "Appointment List",
		link: "/student/list"
	}
};