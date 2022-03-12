const crypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const session = require("express-session");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");

module.exports.renderUserProfilePage = async (req, res) => {
     const userSession = req.session;

     const { id } = req.params;
     const user = await User.findById(id);
     const questions = await User.findById(id).populate("questions");
     const questionCount = await User.findById(id).populate("questions").countDocuments();
     const answerCount = await User.findById(id).populate("answers").countDocuments();
     res.render("user", { user, questions, userSession, questionCount, answerCount });
};

module.exports.getNotifications = async (req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;

	if(isLoggedIn) {
		const user = await User.findById(userid);
		const notifications = user.notifications;
		res.json({notifications});
	} else {
		// req.flash("error","Log in first to view the notifications")
	}
}

module.exports.editUser = async (req, res) => {
     const { id } = req.params;
	 console.log(req.file);
     const user = await User.findByIdAndUpdate(id, { ...req.body.user });
     res.redirect(`/user/${id}`);
}

module.exports.deleteUser = async (req, res) => {
     const { id } = req.params;
     const userSession = req.session;
     const user = await User.findById(id).populate("questions").populate("answers");
     const deletedQuestions = await question.deleteMany({ _id: { $in: user.questions } });
     const deletedUser = await User.findByIdAndDelete(id);
     const deletedAnswers = await Answer.deleteMany({ _id: { $in: user.answers } });
     res.redirect("/logout");
};

module.exports.getSavedQuestions = async(req,res) => {
	const userSession = req.session;

	if(!userSession.isLoggedIn) {
		req.flash("error","Log in first to view the Questions.");
		const redirectUrl = req.session.redirectUrl || '/';
		res.redirect(redirectUrl);
	} else {
		const {userid} = userSession;
		const data = await User.findById(userid).populate({path:"savedQuestions" , populate:{path:"user"}});
		res.render("savedQuestions",{userSession,data:data.savedQuestions})
	}
}

module.exports.createdQuestions = async (req,res) => {
	
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
};

module.exports.saveQuestion = async(req,res) => {
	const userSession = req.session;
	const {isLoggedIn,userid} = userSession;
	const {questionId} = req.params;
	if (userSession.isLoggedIn) {
		const user = await User.findById(userid);
		const saveQuestion = await Question.findById(questionId);

		//First Check that the Saved Question is already there in user account
		const isSavedQuestion = await User.exists({_id: userid, savedQuestions : questionId})

		//If the Saved Question is already there then pull the saved Question from the user
		if(isSavedQuestion) {
			await User.findByIdAndUpdate(userid,{ $pull : {savedQuestions : saveQuestion._id} });

			req.flash("error","This Question is removed from your account.");
		} else {
			user.savedQuestions.push(saveQuestion);
			user.save();
			req.flash("success","This Question is saved in your account.");
		}

		if(req.session.redirectUrl) {
			res.redirect(req.session.redirectUrl);
		} else {
			res.redirect("/");
		}
		
	} else {
		req.flash("error","You need to login to save a question");
		res.redirect("/login");
	}
};

module.exports.renderUserError = async(req,res) => {
	req.flash("error","You need to login to see Questions");
	res.redirect("/");
};	