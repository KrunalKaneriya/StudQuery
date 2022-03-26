const express = require("express");
const router = express.Router();
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const adminIndexController = require("../../controllers/admin/index");

//Middleware function to login for admin
const adminLogin = catchAsync(async(req,res,next) => {
	const {username,password} = req.body;

	// const admin = await Admin.findOne({username});

	// if(admin) {
	// 	const result = await crypt.compare(password,admin.userHash);
		if(username === "admin" && password === "admin") {
			req.session.username = "admin";
			// req.session.userid = admin._id;
			req.session.isLoggedIn = true;
			next();
		} else {
			throw new ExpressError(401,"Username or Password is Incorrect");
		}
	// } else {
	// 	throw new ExpressError(401,"Username or Password is Incorrect");
	// }


})

router.get("/admin/login",catchAsync(adminIndexController.renderAdminLoginPage));

//Post route to send the login info to function
router.post("/admin/login",adminLogin,catchAsync(adminIndexController.sendAdminLogInInfo));

//Get route to logout
router.get("/adminLogout",adminIndexController.adminLogout);

//Get route to render admin home page
router.get("/admin",catchAsync(adminIndexController.renderAdminHomePage));

module.exports = router;