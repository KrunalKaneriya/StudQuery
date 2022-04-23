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
	 const {userid} = userSession;
     const { id } = req.params;
     const user = await User.findById(id);

	 //Checking if the loggedin User follows the other user of which the profile page is viewed.
	 const isUserFollowed = await User.exists({_id:userid,followedUsers:id});

     const questions = await User.findById(id).populate("questions");
    //  const questionCount = await User.findById(id,{questions}).countDocuments({questions});
	const questionCount = questions.questions.length;
     const answerCount = questions.answers.length

     res.render("user", { user, questions, userSession, questionCount, answerCount,isUserFollowed });
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
	 const {username,alias,email,country,description} = req.body;
	 const user = await User.findById(id);

	 if(req.file) {
		const {path,filename} = req.file;
		const image = {
			url:path,
			filename
		}
		user.image = image;
		req.session.imageUrl = path; //Updating User Image url
	 }

     await User.findByIdAndUpdate(id, { username,alias,email,country,description });
	 await user.save();
     res.redirect(`/user/${id}`);
}

module.exports.deleteUser = async (req, res) => {
     const { id } = req.params;
     const userSession = req.session;
     const user = await User.findById(id).populate("questions").populate("answers");
     await Question.deleteMany({ _id: { $in: user.questions } });
     await User.findByIdAndDelete(id);
     await Answer.deleteMany({ _id: { $in: user.answers } });
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

module.exports.followUser = async(req,res) => {
	const userSession = req.session;
	const {isLoggedIn,userid} = userSession;
	const {id} = req.params;
		const loggedInUser = await User.findById(userid);
		const followedUser = await User.findById(id);
		loggedInUser.followedUsers.push(followedUser);
		await loggedInUser.save();
		req.flash("success","You are following this user.");
		res.redirect(`/user/${id}`);
}

module.exports.getFollowedUsers = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {id} = req.params;
	if(!isLoggedIn) {
		req.flash("error","You need to login");
		const redirectUrl = req.session.redirectUrl || "/";
		res.redirect(redirectUrl);
	} else {
		const users = await User.findById(userid).populate("followedUsers");
		const followedUsers = users.followedUsers;
		res.render("followedUsers",{followedUsers,userSession});
	}
}

module.exports.getFollowedUsersQuestions = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {id} = req.params;

	const users = await User.findById(userid).populate("followedUsers");
	const questions = await Question.find({user: {$in:users.followedUsers}}).populate("user");

	res.render("followedUsersQuestions",{questions,userSession});
}

module.exports.unfollowUser = async(req,res) => {
	const userSession = req.session;
	const {id} = req.params;
	const {userid} = userSession;

	await User.findByIdAndUpdate(userid,{$pull: {followedUsers:{$in : id}}  });
	req.flash("success","You are now unfollowed this user.");
	res.redirect('back');
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

module.exports.filterQuestions = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	

	if(!isLoggedIn) {
		req.flash("error","You need to login.");
		res.redirect('back');
	} else {
		const {createdAt,votes} = req.query;
		const user = await User.findById(userid);
		if(createdAt) {
			const result = await Question.find().populate("answers").populate("user").sort({createdAt:createdAt})
			res.render("myQuestions",{result,userSession,user});
	   } else if(votes) {
			const result = await Question.find().populate("answers").populate("user").sort({votes:votes});
			res.render("myQuestions",{result,userSession,user});
	   }
	}
}

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

module.exports.getUsers = async(req,res) => {
	const userSession = req.session;
	const users = await User.find();
	res.render("users",{users,userSession});
}