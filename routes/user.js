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
const answer = require("../models/answer");

/***************************************************
    //TODO CREATING A PAGE WHICH LIST ALL THE USERS *
    //TODO THE ROUTE WILL BE GET /USERS       *
 ***************************************************/

/*******************************************************************************************
   //TODO WHEN A LOGGED IN USER CLICKS ON A USER THEN ALLOW THEM TO SEE THE USER DETAILS  *
  //TODO BUT WHEN THE USER IS NOT THE USER WHICH IS LOGGED IN THEN DISABLE ALL THE FIELDS *
  //TODO IF THE USER IS THE USER WHICH IS LOGGED IN THEN ALLOW THEM TO EDIT THE DETAILS.  *
 *******************************************************************************************/

router.get("/user/:id",catchAsync(async (req, res) => {
		const userSession = req.session;

		const { id } = req.params;
		const user = await User.findById(id);
		const questions = await User.findById(id).populate("questions");
		const questionCount = await User.findById(id).populate("questions").countDocuments();
		const answerCount = await User.findById(id).populate("answers").countDocuments();
		res.render("user", { user, questions, userSession, questionCount, answerCount });
	})
);

router.post("/user/:id",catchAsync(async (req, res) => {
		const { id } = req.params;
		const user = User.findById(id);
	})
);

router.put("/user/:id",catchAsync(async (req, res) => {
		const { id } = req.params;
		const user = await User.findByIdAndUpdate(id, { ...req.body.user });
		res.redirect(`/user/${id}`);
	})
);

router.delete(
	"/user/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const userSession = req.session;
		const user = await User.findById(id).populate("questions").populate("answers");
		const deletedQuestions = await question.deleteMany({ _id: { $in: user.questions } });
		const deletedUser = await User.findByIdAndDelete(id);
		const deletedAnswers = await Answer.deleteMany({ _id: { $in: user.answers } });
		res.redirect("/logout");
	})
);


router.get("/user/personal/questions",async (req,res) => {
	
	const userSession = req.session;
	
	
	if(!userSession.isLoggedIn) {
		req.flash("error","Log in first to view the Questions.");
		const redirectUrl = req.session.redirectUrl || '/';
		res.redirect(redirectUrl);
	} else {
		const user = await User.findById(userSession.userid);
		const result =await User.findById(userSession.userid).populate("questions");
		res.render("myQuestions",{userSession,result:result.questions,user});
	}
})


module.exports = router;
