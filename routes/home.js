const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");
const Question = require("../models/question");
const Post = require("../models/postSchema");


router.get("/", async (req, res) => {

    const { username, userid, email } = req.session;

    // res.send("The User is Logged In...");
    


    // const posts = await Post.find().populate("user").populate("question");
    // const users = await User.find({}).populate("questions");

    // const usersCount = users.length;

    const questions = await Question.find({}).populate('user').sort("asc");
    // const users = await User.find().lean();
    // const questions = await Questions.find()

    // printUserAndQuestion(users);
    // console.log(questions)

    // console.log(posts);


    // for (let singleQuestion of question) {
    //     const { questionTitle, questionDescription } = singleQuestion;
    //     const { username, alias, email, city } = singleQuestion.user;

        // console.log(`The Name is ${username} and Their Title is ${questionTitle} and the Description
        //         is ${questionDescription}`);
    //     console.log(singleQuestion);
    // }



    if(req.session.username) {
    res.render("home",{username,questions});
        
    } else {
        res.render("home",{questions});

    }
    // console.log(questions);


    // res.send(user.questions)
})

    const printUserAndQuestion = async (users) => {
        let newUser = [];
        let question = [];
        for(let user of users) {
            if(user.username === "Krunal Kaneria") {
                for(let singleQuestion of user.questions) {
                    newUser.push(user);
                    question.push(singleQuestion);
                }

            }
        }

        // console.log(newUser);
        for(let user of newUser) {
            console.log(user);
        }
    }


module.exports = router;