const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");
const Question = require("../models/question");



router.get("/", async (req, res) => {

    const { username, userid, email } = req.session;


    // const users = await User.find({});
    // const usersCount = users.length;

    const questions = await Question.find({}).populate('user').sort("asc");



    // for (let singleQuestion of question) {
    //     const { questionTitle, questionDescription } = singleQuestion;
    //     const { username, alias, email, city } = singleQuestion.user;

    //     // console.log(`The Name is ${username} and Their Title is ${questionTitle} and the Description
    //     //         is ${questionDescription}`);
    //     console.log(singleQuestion);
    // }

    res.render("home",{questions,username,userid,email});


    // res.send(user.questions)
})

module.exports = router;