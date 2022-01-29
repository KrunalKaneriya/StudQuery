const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");
const Answer = require("../models/answer");
const question = require("../models/question");


/***************************************************
    //TODO CREATING A PAGE WHICH LIST ALL THE USERS *
    //TODO THE ROUTE WILL BE GET /USERS       *
 ***************************************************/


/*******************************************************************************************
   //TODO WHEN A LOGGED IN USER CLICKS ON A USER THEN ALLOW THEM TO SEE THE USER DETAILS  *
  //TODO BUT WHEN THE USER IS NOT THE USER WHICH IS LOGGED IN THEN DISABLE ALL THE FIELDS *
  //TODO IF THE USER IS THE USER WHICH IS LOGGED IN THEN ALLOW THEM TO EDIT THE DETAILS.  *
 *******************************************************************************************/

router.get("/user/:id",async (req,res) => {

    const userSession = req.session;

    const {id} = req.params;
    const user = await User.findById(id);
    const questions = await User.findById(id).populate("questions");
    const questionCount = await User.findById(id).populate("questions").count();
    const answerCount = await User.findById(id).populate("answers").count();
    res.render("user",{user,questions,userSession,questionCount,answerCount});
})

router.post("/user/:id",async(req,res) => {
    const {id} = req.params;
    const user = User.findById(id);
})

router.put("/user/:id",async(req,res) => {
    const {id} = req.params;
    const user = await User.findByIdAndUpdate(id,{ ...req.body.user });
    res.redirect(`/user/${id}`);
})


router.delete("/user/:id",async (req,res) => {
    const {id} = req.params;
    const userSession = req.session;
    const user = await User.findById(id).populate("questions").populate("answers");
    const deletedQuestions =await question.deleteMany({_id: {$in : user.questions }});
    const deletedUser = await User.findByIdAndDelete(id);
    const deletedAnswers = await Answer.deleteMany({_id : {$in : user.answers}});
    res.redirect("/logout");


})


// router.get("/users",async(req,res) => {
//     const users = await User.find().populate({path:"questions"});
//     res.json(users);
// })

module.exports = router;