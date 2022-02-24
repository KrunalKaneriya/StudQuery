const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answers = require("../models/answer");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {stripHtml} = require("string-strip-html");

/*******************
 * VALIDATION SCHEMA *
 *******************/
const { questionValidator } = require("../models/validationSchema");

//TODO Adding a section of tags which will allow the user to add tags

router.get("/user/:id/question", catchAsync(async (req, res) => {
	//If the User Viewed The Question Page And When Clicks On Login Then redirect to the same page.
	req.session.redirectUrl = req.originalUrl;

	const { id } = req.params;
	const userSession = req.session;
	const user = await User.findById(id);
	res.render("question", { user, userSession });
})
);

router.post("/user/:id/question", catchAsync(async (req, res) => {
	const { id } = req.params;
	const user = await User.findById(id);

	if (!user) {
		throw new ExpressError(400, "User is not Found");
	}

	const { questionTitle, questionDescription, tags } = req.body;
	const tagsArray = tags.split(" ");

	const question = new Question({
		questionTitle,
		questionDescription,
		tags: tagsArray,
	});

	user.questions.push(question);
	question.user = user;

	await question.save();
	await user.save();

	req.flash("success", "Created New Question Successfully.");
	res.redirect(`/`);
})
);

// router.get("/questions", catchAsync(async (req, res) => {
// 	const questions = await Question.find().populate("answers");
// 	res.json(questions);
// })
// );

router.get("/question/:questionId", catchAsync(async (req, res) => {
	const userSession = req.session;
	req.session.redirectUrl = req.originalUrl;
	const { questionId } = req.params;
	const question = await Question.findById(questionId)
		.populate("user")
		.populate({ path: "answers", populate: { path: "user" } });


	const answers = question.answers;
	res.render("fullQuestion", { question, answers, userSession });
})
);

router.get("/search", catchAsync(async (req, res) => {
	const searchTerm = req.query;
	const { search } = searchTerm;
	const userSession = req.session;
	const array = search.split(" ");
	const result = await Question.find({ tags: { $in: array } })
		.populate("answers")
		.populate("user");
	let count = result.length;
	res.render("searchResults", { result, userSession, count });
}));

//*Update Route of Question
router.get("/question/:questionId/edit", catchAsync(async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const question = await Question.findById(questionId)
		.populate("user")
		.populate({ path: "answers", populate: { path: "user" } });

	//When we are retrieving tags from questions replace , with space from each element and pass to ejs file
	let tagsArray = question.tags.toString().replaceAll(",", " ");
	res.render("editQuestion", { question, userSession, tagsArray });
})
);

router.put("/question/:questionId/edit", questionValidator, catchAsync(async (req, res) => {
	const userSession = req.session;
	const { questionId } = req.params;
	const { questionTitle, questionDescription, tags } = req.body;
	const snippet = stripHtml(questionDescription.substr(0,430)).result;
	const tagsArray = tags.split(" "); //This Function takes string of words separated by space and returns array
	const question = await Question.findByIdAndUpdate(questionId, {
		questionTitle,
		questionDescription,
		tags: tagsArray,
		snippet
	});
	req.flash("edit", "Updated Your Question.");
	res.redirect(`/question/${questionId}`);
})
);

//*Delete Route of Question
router.delete("/question/:questionId", catchAsync(async (req, res) => {
	const {isPersonalQuestion} = req.query;
	const userSession = req.session;
	const redirectUrl = req.session.redirectUrl || '/';
	const { userid } = userSession;
	const { questionId } = req.params;
	const question = await Question.findById(questionId).populate("answers");

	await Question.findByIdAndDelete(questionId);

	//Delete Single Question From the User Schema By Using Pull and Questionid
	await User.findByIdAndUpdate(userid, { $pull: { questions: questionId } });

	//search For _id of the Answer and remove all the answers of question which has id in question.answers Database
	//*Its like _id is the searching parameter and $in will find the id in question.answers and if a _id is found in question.answers then it is removed
	await Answers.deleteMany({
		_id: {
			$in: question.answers
		},
	});

	//Delete Answers in User.answers array
	//Pull the answers from User which id == question.answers.id
	await User.findByIdAndUpdate(userid, { $pull: { answers: { $in: question.answers } } });
	req.flash("success", "Deleted the question successfully.");

	if(isPersonalQuestion) {
		res.redirect("/user/personal/questions");
	} else {
		res.redirect("/");
	}
})
);

router.put("/question/:questionId/vote/inc", catchAsync(async (req, res) => {
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
		const upVote = await Question.exists({ _id: questionId, upVotes: { $in: userid } });

		if (!upVote) {
			question.upVotes.push(userid);
			question.votes += 1;
		} else {
			//Do Nothing
		}

		const downVote = await Question.exists({ _id: questionId, downVotes: { $in: userid } });

		if (downVote) {
			await Question.findByIdAndUpdate(questionId, { $pull: { downVotes: userid } });
			question.votes += 1;
		}

		await question.save();

		// res.json({ votes: question.votes });

		if (req.query.fullQuestion) {
			req.flash("success", "You liked the question.");
			res.redirect(`/question/${questionId}`);
		} else {
			req.flash("success", "You liked the question.");

			if(isPersonalQuestion) {
				res.redirect("/user/personal/questions");
			} else {
				res.redirect("/");
			}
		}
	}
})
);

//*Firstly we are going to check that the question id is founded in downVotes.
//*If Founded pull the userid from the downVotes and increase the vote count by 1.
//*Otherwise we will push the userid in the downVotes and decrease the vote count by 1.

router.put("/question/:questionId/vote/dec", catchAsync(async (req, res) => {
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
		const downVote = await Question.exists({ _id: questionId, downVotes: { $in: userid } });

		if (!downVote) {
			question.downVotes.push(userid);
			question.votes -= 1;
		} else {
			// await Question.findByIdAndUpdate(questionId,{$pull:{downVotes : userid}});
			// question.votes +=1;
		}

		const upVote = await Question.exists({ _id: questionId, upVotes: { $in: userid } });

		if (upVote) {
			await Question.findByIdAndUpdate(questionId, { $pull: { upVotes: userid } });
			question.votes -= 1;
		}

		await question.save();
		// res.json({ votes: question.votes });

		if (req.query.fullQuestion) {
			req.flash("success", "You liked the question.");
			res.redirect(`/question/${questionId}`);
		} else {
			req.flash("success", "You liked the question.");

			if(isPersonalQuestion) {
				res.redirect("/user/personal/questions");
			} else {
				res.redirect("/");
			}
		}
	}

	// const question = await Question.findByIdAndUpdate(questionId,{$inc: {votes:-1} },{new:true});
	// await question.save();
}));

// function checkLogin (req,res,next) {
//     const userSession = req.session;
//     if((!userSession.isLoggedIn) || (!userSession.userid)) {
//         res.send("You Are not logged in. Login First");
//     } else {
//         next();
//     }
// }

module.exports = router;
