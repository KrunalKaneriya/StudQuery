const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");
const Question = require("../models/question");



//This router page is the home route and it will display the questions and answers of the users
//This route will be displayed first when the user logs in.

router.get("/",async (req,res) => {
    const posts = await Question.find().populate("answers").populate("user");
    const userSession = req.session;
    res.render("home",{posts,userSession});
});




module.exports = router;