const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const ReportedQuestion = require("../../models/reportedQuestions");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const Admin = require("../../models/admin");
const crypt = require("bcrypt");
const adminIndexController = require("../../controllers/admin/index");

//TODO: To create a separate admin session because when the admin is logged in it also displays that the normal user is also logged in.

const adminLogin = catchAsync(async(req,res,next) => {
	const {username,password} = req.body;

	const admin = await Admin.findOne({username});

	if(admin) {
		const result = await crypt.compare(password,admin.userHash);
		if(result) {
			req.session.username = admin.username;
			req.session.userid = admin._id;
			req.session.isLoggedIn = true;
			next();
		} 
	} else {
		throw new ExpressError(401,"Username or Password is Incorrect");
	}


})


router.post("/adminLogin",adminLogin,catchAsync(adminIndexController.sendAdminLogInInfo));

router.get("/adminLogout",adminIndexController.adminLogout);


router.get("/admin",catchAsync(adminIndexController.renderAdminHomePage));

module.exports = router;