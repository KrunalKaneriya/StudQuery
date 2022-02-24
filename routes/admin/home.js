const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const Admin = require("../../models/admin");
const crypt = require("bcrypt");

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


router.post("/adminLogin",adminLogin,catchAsync(async (req,res) => {
	res.redirect("/admin");
}))

router.get("/adminLogout",(req,res) => {
	if(req.session) {
		req.session.destroy(() => {
			res.redirect("/login");
		})
	}
})


router.get("/admin",catchAsync(async(req,res) => {
    const userSession = req.session;
    const {isLoggedIn,userid} = req.session;

	const questionCount = await Question.find().countDocuments();
	const answerCount = await Answer.find().countDocuments();
	const userCount = await User.find().countDocuments();
	console.log(questionCount)


    if(isLoggedIn) {
        res.render("admin/homepage",{userSession,questionCount,answerCount,userCount});
    }
    else {
        throw new ExpressError(401,"User is Required to login");
    }

}))

module.exports = router;