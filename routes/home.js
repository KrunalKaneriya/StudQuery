const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const session = require("express-session");
const Post = require("../models/postSchema");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const indexController = require("../controllers/user/index");

/**********************************************************************
 * THIS ROUTE WILL BE DISPLAYED FIRST WHEN THE USER LOGS IN.HOME PAGE *
 **********************************************************************/

//Get Route to Render Home Page or Index Page
router.get("/",catchAsync(indexController.renderHomePage));

//Post Route to Render Home Page with Filters Applied
router.post("/",catchAsync(indexController.filterQuestions));

module.exports = router;