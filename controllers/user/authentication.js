const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Admin = require("../../models/admin");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

module.exports.renderLoginForm = (req, res) => {
	res.render("login");
};

module.exports.loginSuccessful = (req, res) => {
     req.flash("welcome", "Welcome to Studquery");
     
     //If there is some url found in session when logging in then go to that url otherwise go to home route
     const redirectUrl = req.session.redirectUrl || '/';
     res.redirect(redirectUrl);
};

module.exports.logout =  (req, res) => {
	if (req.session.isLoggedIn) {
		req.session.destroy(() => {
			res.redirect("/");
		});
	}
};

module.exports.renderSignUpForm = (req,res) => {
     res.render("signup");
};

module.exports.sendSignUpInfo = async (req,res) => {
     const {username,alias,email,password,description,country} = req.body;
     const userHash = await crypt.hash(password,12); //Create a user hash by hashing password
     
     const user = new User({
         username,alias,email,userHash,description,country
     });

     //If there is profile picture then create a new object of image in which url and filename of image will be stored
     //and save it to the user.image in database
     if(req.file) {
          const {path,filename} = req.file;
          const image = {
               url:path,
               filename
          }
          user.image = image
     }
     
	await user.save();
     res.redirect("/login");
};