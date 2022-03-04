const crypt = require("bcrypt");
const express = require("express");
const User = require("../models/user");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const authenticateController = require("../controllers/user/authentication");

/*******************
 * VALIDATION SCHEMA *
 *******************/
 const {signUpValidator} = require("../models/validationSchema"); 

router.get("/signup", authenticateController.renderSignUpForm); 

router.post("/signup",signUpValidator,catchAsync(authenticateController.sendSignUpInfo));

module.exports = router;

/*
1. Take all the data of the user from the browser
2. To hash the given password and create a userHash
3. Store all the data of the user in the DB except password
4. Create a session with following Details
        [isLoggedin,user_id,username,email,age,alias]
*/