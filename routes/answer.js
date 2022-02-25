const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Question = require("../models/question");
const Answer = require("../models/answer");
const catchAsync = require("../utils/catchAsync");


/************************************************
 * ROUTE WHICH WILL ADD ANSWER TO A QUESTION. *
 ************************************************/
router.post("/question/:questionId/answer",catchAsync(async (req, res) => {
		const { questionId } = req.params;
		const userSession = req.session;
		const { isLoggedIn, userid } = userSession;
		if (isLoggedIn) {
			const question = await Question.findById(questionId);
			const user = await User.findById(userid);
			const {answerDescription} = req.body;
			const answer = new Answer({
				answerDescription
			});
			answer.question = question;
			answer.user = user;
			question.answers.push(answer);
			user.answers.push(answer);

			answer.save();
			question.save();
			user.save();

			req.flash("success", "Your Answer is Added Successfully...");
			res.redirect(`/question/${questionId}`);
		} else {
			req.flash("error", "You are Not Logged In. Cannot Post Answer");
			res.redirect(`/question/${questionId}`);
		}
	})
);

/*************************************************
 * ROUTE WHICH WILL REDIRECT TO ANSWER EDIT PAGE *
 *************************************************/
router.get("/question/:questionId/answer/:answerid",catchAsync(async (req, res) => {
		const { answerid } = req.params;
		const userSession = req.session;
		const answer = await Answer.findById(answerid).populate("question").populate("user");
		const question = answer.question;
		res.render("editAnswer", { answer, question, userSession });
	})
);

router.put("/question/:questionId/answer/:answerId/edit",catchAsync(async (req, res) => {
		const { answerId } = req.params;
		const answer = await Answer.findById(answerId).populate("user", "username").populate("question", "questionTitle questionDescription");
		const question = answer.question;
		await Answer.findByIdAndUpdate(answerId, { ...req.body });
		req.flash("edit", "Answer is Edited...");
		res.redirect(`/question/${answer.question._id}`);
	})
);

router.put("/question/:questionId/answer/:answerId/voteinc",catchAsync(async (req, res) => {
		const { questionId, answerId } = req.params;
		const userSession = req.session;
		const { userid, isLoggedIn } = userSession;
		
		if (!userSession.isLoggedIn) {
			req.flash("error", "To vote you need to login first.");
			const redirectUrl = req.session.redirectUrl || '/';
			res.redirect(redirectUrl);
		} else {
			const answer = await Answer.findById(answerId);

			const upVote = await Answer.exists({ _id: answerId, upVotes: { $in: userid } });

			if (!upVote) {
				answer.upVotes.push(userid);
				answer.votes += 1;
			} else {
				//Do Nothing
			}

			const downVote = await Answer.exists({ _id: answerId, downVotes: { $in: userid } });

			if (downVote) {
				await Answer.findByIdAndUpdate(answerId, { $pull: { downVotes: userid } });
				answer.votes += 1;
			}

			await answer.save();

			// res.json({ votes: answer.votes });

			// if(req.query.fullQuestion) {

			    req.flash("success","You liked the question.");
			    res.redirect(`/question/${questionId}`);
			// } else {
			//     req.flash("success","You liked the question.");
			//     res.redirect("/");
			// }
		}
	})
);

router.put("/question/:questionId/answer/:answerId/votedec",catchAsync(async (req, res) => {
		const { questionId, answerId } = req.params;
		const userSession = req.session;
		const { userid, isLoggedIn } = userSession;

		if (!userSession.isLoggedIn) {
			req.flash("error", "To vote you need to login first.");
			const redirectUrl = req.session.redirectUrl || '/';
			res.redirect(redirectUrl);
		} else {
			const answer = await Answer.findById(answerId);
			const downVote = await Answer.exists({ _id: answerId, downVotes: { $in: userid } });

			if (!downVote) {
				answer.downVotes.push(userid);
				answer.votes -= 1;
			} else {
				// await Question.findByIdAndUpdate(questionId,{$pull:{downVotes : userid}});
				// question.votes +=1;
			}

			const upVote = await Answer.exists({ _id: questionId, upVotes: { $in: userid } });

			if (upVote) {
				await Answer.findByIdAndUpdate(questionId, { $pull: { upVotes: userid } });
				answer.votes -= 1;
			}

			await answer.save();
			res.json({ votes: answer.votes });

			// if(req.query.fullQuestion) {
			    req.flash("success","You disliked the question.");
			    res.redirect(`/question/${questionId}`);
			// } else {
			//     req.flash("success","You disliked the question.");
			//     res.redirect("/");
			// }
		}

		// const question = await Question.findByIdAndUpdate(questionId,{$inc: {votes:-1} },{new:true});
		// await question.save();
	})
);

router.delete("/question/:questionId/answer/:answerId",catchAsync(async (req, res) => {
		const userSession = req.session;
		const { userid } = userSession;
		const { answerId, questionId } = req.params;

		const answer = await Answer.findById(answerId).populate("question");

		await User.findByIdAndUpdate(userid, { $pull: { answers: answerId } });
		await Question.findByIdAndUpdate(questionId, { $pull: { answers: answerId } });
		const deletedAnswer = await Answer.findByIdAndDelete(answerId);

		req.flash("success", "Deleted Answer Successfully...");
		res.redirect(`/question/${questionId}`);
	})
);

module.exports = router;
