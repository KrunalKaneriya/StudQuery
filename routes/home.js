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

router.get("/",catchAsync(indexController.renderHomePage));

router.post("/",(req,res) => {
    res.send(req.body)
})

module.exports = router;