const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answers = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const Comment = require("../../models/comment");
const ExpressError = require("../../utils/ExpressError");
const {stripHtml} = require("string-strip-html");
const { cloudinary } = require("../../cloudinary");

module.exports.viewQuestion = async (req, res) => {
	const userSession = req.session;
	req.session.redirectUrl = req.originalUrl;
	const { questionId } = req.params;
	const question = await Question.findById(questionId)
			.lean().populate("user").
			populate({ 
				path: "answers",
			 	populate: { path: "user" } 
			}).
			populate({
				path:"comments",
				populate: {path:"user"}
			}).
			populate({
				path:"answers",
				populate : {
					path:"answerComments",
					populate:{
						path:"user"
					}
				}
			})
	const answers = question.answers;
	const comments = question.comments;

	res.render("fullQuestion", { question, answers,comments , userSession });
};

module.exports.renderEditQuestionForm = async (req, res) => {
	const userSession = req.session;
	const {isLoggedIn,userid} = userSession;
	const { questionId } = req.params;
	if(!isLoggedIn) {
		req.flash("error","You need to login to edit this Question");
		res.redirect(`/question/${questionId}`);
	} else {
		const question = await Question.findById(questionId)
			.lean().populate("user")
			.populate({ path: "answers", populate: { path: "user" } });

		if(question.user._id == userid) {
			//When we are retrieving tags from questions replace , with space from each element and pass to ejs file
			let tagsArray = question.tags.toString().replaceAll(",", " ");
			res.render("editQuestion", { question, userSession, tagsArray });
		} else {
			req.flash("error","You are not the owner of this question.");
			res.redirect(`/question/${questionId}`);
		}
	}
	
};

module.exports.updateQuestion = async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const { questionTitle, questionDescription, tags } = req.body;
	const snippet = stripHtml(questionDescription.substring(0,430)).result; //Create a snippet of the question body 
	const tagsArray = tags.split(" "); //This Function takes string of words separated by space and returns array

	const question = await Question.findByIdAndUpdate(questionId, {
		questionTitle,
		questionDescription,
		tags: tagsArray,
		snippet,
	});

	//Checking if there are images uploaded.
	if(req.files.length>0) { //We are checking that if there are files like images in the request object passed
		const uploadImagesArray = req.files.map(image => { //If there is then for each image we create a new array and assign the all images array to imagesArray
			return { 
				url:image.path, //Assigning the url as image passed path 
				filename:image.filename //Assigning the filename as image passed filename
			} //Now returning the object to add it into question database
		})
		question.images.push(...uploadImagesArray);
	}
	
	await question.save();

	// When a image is checked in editQuestion the its url is added in deleteImages and it is sended via form
	if(req.body.deleteImages) {
		//Updating the Question By Pulling the element from images array where the filename is == to filename in deleteImages Array
		
		//After deleting the images from database loop over the filenames and call the uploader.destroy to delete the images by passing the filename to the cloud.
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename,{invalidate:true,resource_type:"image",type:"upload"});
		}
		await question.updateOne({ $pull: {images: {filename: { $in: req.body.deleteImages }}}});
	}
	req.flash("edit", "Updated Your Question.");
	res.redirect(`/question/${questionId}`);
};

module.exports.closeQuestion = async(req,res) => {
	const userSession = req.session;
	const {isLoggedIn,userid} = userSession;
	const {questionId} = req.params;

	const question = await Question.findById(questionId).populate("user");

	if(isLoggedIn && question.user._id==userid) {
		question.isClosed = true;
		await question.save();
		req.flash("success","This Question is now Closed");
		res.redirect(`/question/${questionId}`);
	} else {
		req.flash("error","You cannot close this question");
		res.redirect(`/question/${questionId}`);
	}
}

module.exports.openQuestion = async(req,res) => {
	const userSession = req.session;
	const {isLoggedIn,userid} = userSession;
	const {questionId} = req.params;

	const question = await Question.findById(questionId).populate("user");

	if(isLoggedIn && question.user._id==userid) {
		question.isClosed = false;
		await question.save();
		req.flash("success","This Question is now Opened");
		res.redirect(`/question/${questionId}`);
	} else {
		req.flash("error","You cannot Open this question");
		res.redirect(`/question/${questionId}`);
	}
}

module.exports.deleteQuestion = async (req, res) => {
	const userSession = req.session;
	const redirectUrl = req.session.redirectUrl || '/';
	const { userid,isLoggedIn } = userSession;
	const { questionId } = req.params;
	const question = await Question.findById(questionId).populate("answers");

	if(!isLoggedIn) {
		req.flash("error","You need to login.");
		res.redirect(`/question/${questionId}`);
	} else {
			if(question.user._id == userid) {
				//Remove the Question from database
				await Question.findByIdAndDelete(questionId);

				//Deleting Comments From Comment Database
				await Comment.deleteMany({
					_id:{
						$in:question.comments
					}
				});

				//Delete Single Question From the User Schema By Using Pull and Questionid
				await User.findByIdAndUpdate(userid, { $pull: { questions: questionId } });

				//Pull the answers from User which id == question.answers.id
				await User.findByIdAndUpdate(userid, { $pull: { answers: { $in: question.answers } } });

				//Deleting The Pictures From the Cloud of the Questions
				if(question.images.length > 0) {
					for(let image of question.images) {
						await cloudinary.uploader.destroy(image.filename,{invalidate:true,resource_type:"image",type:"upload"});
					}
				}


				//search For _id of the Answer and remove all the answers of question which has id in question.answers Database
				//*Its like _id is the searching parameter and $in will find the id in question.answers and if a _id is found in question.answers then it is removed
				await Answers.deleteMany({
					_id: {
						$in: question.answers._id
					},
				});

				//Deleting the answers images from the Cloud
				if(question.answers.length > 0) {
					for(let answer of question.answers) {
						for(let image of answer.images) {
							await cloudinary.uploader.destroy(image.filename,{invalidate:true,resource_type:"image",type:"upload"})
						}
					}
				}

				req.flash("success", "Deleted the question successfully.");
				res.redirect("/");
		} else {
			req.flash("error","You cannot delete this question.");
			res.redirect("back");
		}
	}
};

module.exports.questionVoteInc = async (req, res) => {
	const {isPersonalQuestion} = req.query;
	const { questionId } = req.params;
	const userSession = req.session;
	const { userid, isLoggedIn } = userSession;
	

	if (!isLoggedIn) {

		req.flash("error", "To vote you need to login first.");
		if (req.query.fullQuestion) {
			res.redirect(`/question/${questionId}`);
		} else {
			res.redirect("/");
		}
	}
	else {
		const question = await Question.findById(questionId).populate("user");
		const user = question.user;
		const upVote = await Question.exists({ _id: questionId, upVotes: userid });

		if (!upVote) {
			question.upVotes.push(userid);
			question.votes += 1;
		} else {
			question.upVotes.pull(userid);
			question.votes -= 1;
			await User.findByIdAndUpdate(user._id,{$pull : {notifications : {questionId}}});
			
			
		}
		await user.save();

		const downVote = await Question.exists({ _id: questionId, downVotes: userid });

		if (downVote) {
			await Question.findByIdAndUpdate(questionId, { $pull: { downVotes: userid } });
			question.votes += 1;
		}

		await question.save();

		res.json({ votes: question.votes });
	}
};

module.exports.questionVoteDec = async (req, res) => {
	const {isPersonalQuestion} = req.query;
	const { questionId } = req.params;
	const userSession = req.session;
	const { userid, isLoggedIn } = userSession;



	if (!isLoggedIn) {
		req.flash("error", "To vote you need to login first.");

		if (req.query.fullQuestion) {
			res.redirect(`/question/${questionId}`);
		} else {
			res.redirect("/");
		}

	} else {
		const question = await Question.findById(questionId);
		const downVote = await Question.exists({ _id: questionId, downVotes: userid });

		if (!downVote) {
			question.downVotes.push(userid);
			question.votes -= 1;
		} else {
			question.downVotes.pull(userid);
			question.votes +=1;
			// await Question.findByIdAndUpdate(questionId,{$pull:{downVotes : userid}});
			// question.votes +=1;
		}

		const upVote = await Question.exists({ _id: questionId, upVotes: userid });

		if (upVote) {
			await Question.findByIdAndUpdate(questionId, { $pull: { upVotes: userid } });
			question.votes -= 1;
		}

		await question.save();
		res.json({ votes: question.votes });
	}

};

module.exports.addComment = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {questionId} = req.params
	if(isLoggedIn) {
		
		const user = await User.findById(userid);
		const {commentDescription} = req.body;
		const question = await Question.findById(questionId);
		const comment = new Comment({
			commentDescription,
			user,
			question
		});
		question.comments.push(comment);
		await question.save();
		await comment.save();
		req.flash("success","Comment Created");
		res.redirect(`/question/${questionId}`);
	} else {
		req.flash("error","Login to Add A Comment");
		res.redirect(`/question/${questionId}`);
	}
}

module.exports.editComment = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {questionId,commentId} = req.params;
	const {editCommentDescription} = req.body;

	if(isLoggedIn) {
		const existingComment = await Comment.findById(commentId);
		existingComment.commentDescription = editCommentDescription;
		await existingComment.save();
		req.flash("success","Comment Edited");
		res.redirect(`/question/${questionId}`);
	} else {
		req.flash("error","Error Changing A Comment");
		res.redirect(`/question/${questionId}`);
	}
}
module.exports.deleteComment = async(req,res) => {
	const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {questionId,commentId} = req.params;
	
	if(isLoggedIn) {
		//Remove the Comment from the Question
		await Question.findByIdAndUpdate(questionId,{ $pull : {comments : commentId } });

		//Remove the Comment from Comment Schema
		await Comment.findByIdAndDelete(commentId);

		req.flash("success","Comment Deleted!");
		res.redirect(`/question/${questionId}`);

	} else {

		req.flash("error","Error Deleting Comment!!");
		res.redirect(`/question/${questionId}`);
	}
}

module.exports.renderNewQuestionForm = async (req, res) => {
	//If the User Viewed The Question Page And When Clicks On Login Then redirect to the same page.
	req.session.redirectUrl = req.originalUrl;

	const { id } = req.params;
	const userSession = req.session;
	const user = await User.findById(userSession.userid).lean();
	res.render("question", { user, userSession });
};

module.exports.createQuestion = async (req, res ,next) => {
	const userSession = req.session;
	const { id } = req.params;
	const user = await User.findById(userSession.userid);

	if (!user) {
		throw new ExpressError(400, "User is not Found");
	}

	const { questionTitle, questionDescription, tags } = req.body;
	const tagsArray = tags.split(" ");

	if(req.files) { //We are checking that if there are files like images in the request object passed
		var imagesArray = req.files.map(image => { //If there is then for each image we create a new array and assign the all images array to imagesArray
			return { 
				url:image.path, //Assigning the url as image passed path 
				filename:image.filename //Assigning the filename as image passed filename
			} //Now returning the object to add it into question database
		})
	}

	const question = new Question({
		questionTitle,
		questionDescription,
		tags: tagsArray,
		images:imagesArray
	});

	user.questions.push(question);
	question.user = user;

	await question.save();
	await user.save();

	req.flash("success", "Created New Question Successfully.");
	res.redirect(`/`);
};

module.exports.searchQuestion = async (req, res) => {
	const searchTerm = req.query;
	const { search } = searchTerm;
	const userSession = req.session;
	const array = search.split(" ");
	const result = await Question.find({ tags: { $in: array } }).lean()
		.populate("answers")
		.populate("user");
	let count = result.length;
	res.render("tags", { tag:search, tagResult:result, userSession });
};
