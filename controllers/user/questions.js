const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answers = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const {stripHtml} = require("string-strip-html");
const { cloudinary } = require("../../cloudinary");

module.exports.viewQuestion = async (req, res) => {
	const userSession = req.session;
	req.session.redirectUrl = req.originalUrl;
	const { questionId } = req.params;
	const question = await Question.findById(questionId)
		.populate("user")
		.populate({ path: "answers", populate: { path: "user" } });


	const answers = question.answers;
	res.render("fullQuestion", { question, answers, userSession });
};

module.exports.renderEditQuestionForm = async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const question = await Question.findById(questionId)
		.populate("user")
		.populate({ path: "answers", populate: { path: "user" } });

	//When we are retrieving tags from questions replace , with space from each element and pass to ejs file
	let tagsArray = question.tags.toString().replaceAll(",", " ");
	res.render("editQuestion", { question, userSession, tagsArray });
};

module.exports.updateQuestion = async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const { questionTitle, questionDescription, tags } = req.body;
	const snippet = stripHtml(questionDescription.substring(0,430)).result;
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

module.exports.deleteQuestion = async (req, res) => {
	const {isPersonalQuestion} = req.query;
	const userSession = req.session;
	const redirectUrl = req.session.redirectUrl || '/';
	const { userid } = userSession;
	const { questionId } = req.params;
	const question = await Question.findById(questionId).populate("answers");

	//Remove the Question from database
	await Question.findByIdAndDelete(questionId);

	//Delete Single Question From the User Schema By Using Pull and Questionid
	await User.findByIdAndUpdate(userid, { $pull: { questions: questionId } });

	//Pull the answers from User which id == question.answers.id
	await User.findByIdAndUpdate(userid, { $pull: { answers: { $in: question.answers } } });


	//search For _id of the Answer and remove all the answers of question which has id in question.answers Database
	//*Its like _id is the searching parameter and $in will find the id in question.answers and if a _id is found in question.answers then it is removed
	await Answers.deleteMany({
		_id: {
			$in: [question.answers]
		},
	});

	//Delete Answers in User.answers array

	req.flash("success", "Deleted the question successfully.");

	if(isPersonalQuestion) {
		res.redirect("/user/personal/questions");
	} else {
		res.redirect("/");
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
		const question = await Question.findById(questionId);
		const upVote = await Question.exists({ _id: questionId, upVotes: userid });

		if (!upVote) {
			question.upVotes.push(userid);
			question.votes += 1;
		} else {
			question.upVotes.pull(userid);
			question.votes -= 1;
		}

		const downVote = await Question.exists({ _id: questionId, downVotes: userid });

		if (downVote) {
			await Question.findByIdAndUpdate(questionId, { $pull: { downVotes: userid } });
			question.votes += 1;
		}

		await question.save();

		res.json({ votes: question.votes });

		// if (req.query.fullQuestion) {
		// 	req.flash("success", "You liked the question.");
		// 	res.redirect(`/question/${questionId}`);
		// } else {
		// 	req.flash("success", "You liked the question.");

		// 	if(isPersonalQuestion) {
		// 		res.redirect("/user/personal/questions");
		// 	} else {
		// 		res.redirect("/");
		// 	}
		// }
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

		// if (req.query.fullQuestion) {
		// 	req.flash("success", "You liked the question.");
		// 	res.redirect(`/question/${questionId}`);
		// } else {
		// 	req.flash("success", "You liked the question.");

		// 	if(isPersonalQuestion) {
		// 		res.redirect("/user/personal/questions");
		// 	} else {
		// 		res.redirect("/");
		// 	}
		// }
	}

	// const question = await Question.findByIdAndUpdate(questionId,{$inc: {votes:-1} },{new:true});
	// await question.save();
};

module.exports.renderNewQuestionForm = async (req, res) => {
	//If the User Viewed The Question Page And When Clicks On Login Then redirect to the same page.
	req.session.redirectUrl = req.originalUrl;

	const { id } = req.params;
	const userSession = req.session;
	const user = await User.findById(userSession.userid);
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
	const result = await Question.find({ tags: { $in: array } })
		.populate("answers")
		.populate("user");
	let count = result.length;
	res.render("tags", { tag:search, tagResult:result, userSession });
};
