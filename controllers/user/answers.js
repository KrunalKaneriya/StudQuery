const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const AnswerComment = require("../../models/answerComment");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const multer = require("multer");
const {storage,cloudinary} = require("../../cloudinary/index");
const upload = multer({storage});

//Function to create a answer

module.exports.createAnswer = async (req, res) => {

     const { questionId } = req.params;
     const userSession = req.session;
     const { isLoggedIn, userid } = userSession;
     if (isLoggedIn) {
          const question = await Question.findById(questionId);
          const user = await User.findById(userid);
          const {answerDescription} = req.body;

          //If there are images also sent then loop over all the images and create a new array in which filename and 
          //url of images will be stored
          if(req.files) {
               var answerImages = req.files.map(image => {
                    return {
                         url:image.path,
                         filename:image.filename
                    }
               })
          }
          const answer = new Answer({
               answerDescription,
               images:answerImages
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

};

module.exports.renderEditAnswerForm = async (req, res) => {
     const { answerid } = req.params;
     const userSession = req.session;
     const answer = await Answer.findById(answerid).populate("question").populate("user");
     const question = answer.question;
     res.render("editAnswer", { answer, question, userSession });
};

module.exports.editAnswer = async (req, res) => {
     const { questionId,answerId } = req.params;
     const {answerDescription} = req.body;

     //Firstly update the answerDescription of the founded Answer
     const answer = await Answer.findByIdAndUpdate(answerId, { answerDescription });
     
     //Now check if there are images also sent then loop over all the images and create a new array of url and filename of 
     //images and add it to the answer => images database.
     if(req.files.length>0) {
          const uploadImagesArray = req.files.map(img => {
               return {
                         url:img.path,
                         filename:img.filename
               }
          })
          
          //Before Pushing Images to the Answer we need to spread the url and filename otherwise the uploadImagesArray will be an array not a object and it will create error.
          answer.images.push(...uploadImagesArray);
     }
     await answer.save();
    
     //If there is checkbox checked of images to delete then loop over all the filenames of images checked and delete
     //from cloud and remove the images from database.
      if(req.body.deleteImages) {
          for(let filename of req.body.deleteImages) {
               await cloudinary.uploader.destroy(filename,{invalidate:true,resource_type:"image",type:"upload"});
          }
          //Remove the images object from answer where the filename is equal to the images checked.
          await answer.updateOne({$pull : { images : {filename : {$in:req.body.deleteImages}} }});
     }

     req.flash("edit", "Answer is Edited...");
     return res.redirect(`/question/${questionId}`);   
};

module.exports.deleteAnswer = async (req, res) => {
     const userSession = req.session;
     const { userid } = userSession;
     const { answerId, questionId } = req.params;

     const answer = await Answer.findById(answerId).populate("question");

     //If there are any images found in answers then delete the images from cloud
     if(answer.images.length > 0) {
          for(let image of answer.images){
			await cloudinary.uploader.destroy(image.filename,{invalidate:true,resource_type:"image",type:"upload"})
          }
     }

     //Remove the Comments From AnswerComments Database
     await AnswerComment.deleteMany({
          _id:{
               $in:answer.answerComments
          }
     });
    
     //Remove the answer from the user where answers == answerId
     await User.findByIdAndUpdate(userid, { $pull: { answers: answerId } });

     //Remove the answer from question where answers == answerId
     await Question.findByIdAndUpdate(questionId, { $pull: { answers: answerId } });

     //Now delete the answer itself from database
     await Answer.findByIdAndDelete(answerId);

     req.flash("success", "Deleted Answer Successfully...");
     return res.back();
};

module.exports.answerVoteInc = async (req, res) => {
     const { questionId, answerId } = req.params;
     const userSession = req.session;
     const { userid, isLoggedIn } = userSession;

     if (!isLoggedIn) {

          req.flash("error", "To vote you need to login first.");
          const redirectUrl = req.session.redirectUrl || '/';
          res.redirect(redirectUrl);

     } else {

          const answer = await Answer.findById(answerId);
          const upVote = await Answer.exists({ _id: answerId, upVotes:userid });

          if (!upVote) {
               answer.upVotes.push(userid);
               answer.votes += 1;
          } else {
               answer.upVotes.pull(userid);
               answer.votes -=1;
          }

          const downVote = await Answer.exists({ _id: answerId, downVotes:userid });

          if (downVote) {
               await Answer.findByIdAndUpdate(answerId, { $pull: { downVotes: userid } });
               answer.votes += 1;
          }

          await answer.save();
          res.json({ votes:answer.votes });

     }
};

/*********************************************************************************
 *              FIRST CHECK IF THE USER IS LOGGED IN USING SESSION               *
 *                 IF NOT LOGGED IN THEN REDIRECT TO OTHER PAGE.                 *
 *                                   OTHERWISE                                   *
 *  FIRST CHECK THE ANSWERID WHICH IS PASSED AND CHECK IF THE DOWNVOTE CONTAINS  *
 *                                USERID OR NOT.                                 *
 * IF USERID IS NOT PRESENT THEN ADD USERID TO DOWNVOTE AND DECREMENT VOTE BY 1. *
 *             AFTER THAT CHECK IF THE USERID IS PRESENT IN UPVOTE.              *
 *       IF USERID IS PRESENT IN UPVOTE THEN REMOVE THE USERID FROM UPVOTE       *
 *                      AFTER THAT DECREMENT THE VOTES BY 1
 *
 *                                  VOTE LOGIC:                                  *
 *   IF DOWNVOTE IS NOT PRESENT THEN ADD THE USERID TO DOWNVOTE AND DECREMENT    *
 *                                THE VOTE BY 1.                                 *
 *   AND IF THE USERID IS THERE IN UPVOTE ALSO THEN ALSO WE NEED TO DECREMENT    *
 *                                THE VOTE BY 1.
 *
 *               IF THE UPVOTE IS THERE IN VOTE THEN THE VOTE IS 3               *
 *       NOW WE DECREMENT THE VOTE BY 1 SO THE VOTE IS NEITHER UP OR DOWN        *
 *         NOW WE ALSO NEED TO DECREMENT BY 1 TO MAKE THE VOTE DOWNVOTE          *
 *********************************************************************************/
module.exports.answerVoteDec = async (req, res) => {
     const { questionId, answerId } = req.params;
     const userSession = req.session;
     const { userid, isLoggedIn } = userSession;

     if (!isLoggedIn) {
          req.flash("error", "To vote you need to login first.");
          return res.back();
     } else {
          const answer = await Answer.findById(answerId);
          const downVote = await Answer.exists({ _id: answerId, downVotes:userid });

          if (!downVote) {
               answer.downVotes.push(userid);
               answer.votes -= 1;
          } else {
               answer.downVotes.pull(userid);
               answer.votes +=1;
          }

          const upVote = await Answer.exists({ _id: answerId, upVotes:userid});

          if (upVote) {
               await Answer.findByIdAndUpdate(answerId, { $pull: { upVotes: userid } });
               answer.votes -= 1;
          }

          await answer.save();
          res.json({ votes:answer.votes });
         
     }

};

module.exports.addComment = async(req,res) => {
     const userSession = req.session;
	const {userid,isLoggedIn} = userSession;
	const {questionId,answerId} = req.params
     const {answerCommentDescription} = req.body;
     if(isLoggedIn) {
		const user = await User.findById(userid);
		
		const answer = await Answer.findById(answerId);
		const comment = new AnswerComment({
			answerCommentDescription,
			user,
			answer
		});
		answer.answerComments.push(comment);
		await answer.save();
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
	const {questionId,commentId,answerid} = req.params;
	const {editAnswerCommentDescription} = req.body;

	if(isLoggedIn) {
		const existingComment = await AnswerComment.findById(commentId);
		existingComment.answerCommentDescription = editAnswerCommentDescription;
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
	const {questionId,commentId,answerId} = req.params;
	
	if(isLoggedIn) {
		//Remove the Comment from the Question
		await Answer.findByIdAndUpdate(answerId,{ $pull : {answerComments : commentId } });

		//Remove the Comment from Comment Schema
		await AnswerComment.findByIdAndDelete(commentId);

		req.flash("success","Comment Deleted!");
		res.redirect(`/question/${questionId}`);

	} else {

		req.flash("error","Error Deleting Comment!!");
		res.redirect(`/question/${questionId}`);
	}
}