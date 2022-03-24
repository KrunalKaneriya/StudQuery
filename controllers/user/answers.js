const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const catchAsync = require("../../utils/catchAsync");
const ExpressError = require("../../utils/ExpressError");
const multer = require("multer");
const {storage,cloudinary} = require("../../cloudinary/index");
const upload = multer({storage});


module.exports.createAnswer = async (req, res) => {

     const { questionId } = req.params;
     const userSession = req.session;
     const { isLoggedIn, userid } = userSession;
     if (isLoggedIn) {
          const question = await Question.findById(questionId);
          const user = await User.findById(userid);
          const {answerDescription} = req.body;
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
     // const answer = await Answer.findById(answerId).populate("user", "username").populate("question", "questionTitle questionDescription");
     // const question = answer.question;
     const answer = await Answer.findByIdAndUpdate(answerId, { answerDescription });
     
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
    
      if(req.body.deleteImages) {
          for(let filename of req.body.deleteImages) {
               await cloudinary.uploader.destroy(filename,{invalidate:true,resource_type:"image",type:"upload"});
          }
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

     await User.findByIdAndUpdate(userid, { $pull: { answers: answerId } });
     await Question.findByIdAndUpdate(questionId, { $pull: { answers: answerId } });
     const deletedAnswer = await Answer.findByIdAndDelete(answerId);

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