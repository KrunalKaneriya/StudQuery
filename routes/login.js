const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

//TODO: Separate the Login Route of Admin and create it in admin route folder

/*******************
 * VALIDATION SCHEMA *
 *******************/
const { logInValidator } = require("../models/validationSchema");


/***************************************************************************************************
 * MAKE A MIDDLEWARE FUNCTION TO GET THE DETAILS OF THE USER AND SEND NEXT OTHERWISE THROW ERROR *
 ***************************************************************************************************/

const requestLogin = catchAsync(async (req, res, next) => {
	const { username, password } = req.body; //Fetching Username And Password From Browser
	
	const user = await User.findOne({ $or: [{ username }, { email: username }] }); //Finding The Username Or Email in DB
	if (user) {
		//Checking if the User is founded
		const result = await crypt.compare(password, user.userHash); //Decrypt The password from the db of user
		const { _id: id } = user; //Take the id from the user founded in the db

		//Find The Logged in User and run Update Query to Update the lastLoggedIn To Latest Time
		await User.findByIdAndUpdate(id, { $set: { lastLoggedIn: new Date() } });

		req.session.username = user.username; //Create a session and add username to it.
		req.session.userid = user._id; //Add user id into the session
		req.session.isLoggedIn = true; //Add isLogged in to the session

		if (result) {
			return next();
		}
	}
	throw new ExpressError(404, "Username Or Password is Incorrect!");
});

router.get("/login", (req, res) => {
	res.render("login");
});

router.post("/login",requestLogin,logInValidator,catchAsync(async (req, res) => {
		req.flash("welcome", "Welcome to Studquery");
		const redirectUrl = req.session.redirectUrl || '/';
		res.redirect(redirectUrl);
	})
);


router.get("/logout", (req, res) => {
	if (req.session.isLoggedIn) {
		req.session.destroy(() => {
			res.redirect("/");
		});
	}
});

module.exports = router;