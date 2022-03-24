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
     const userHash = await crypt.hash(password,12);
     
     const user = new User({
         username,alias,email,userHash,description,country
     });

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