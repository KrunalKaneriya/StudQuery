const crypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Question = require('../models/question');
const session = require('express-session');
const Answer = require('../models/answer');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const answer = require('../models/answer');
const userController = require('../controllers/user/users');
const multer = require("multer");
const {storage,cloudinary} = require("../cloudinary/user");
const upload = multer({storage});

//Get Route to Display A Popup of User Not Logged In
router.get('/user/notLoggedIn', catchAsync(userController.renderUserError));

//Get Route to Follow A User and Save it in Database
router.get('/user/:id/follow', catchAsync(userController.followUser));

//Get Route to Unfollow A User and Save it in Database
router.get('/user/:id/unfollow', catchAsync(userController.unfollowUser));

//Get Route to Display List of Followed Users
router.get('/user/:id/getFollowedUsers', catchAsync(userController.getFollowedUsers)); //TODO

//Get Route to Display List of Followed Users Questions
router.get('/user/:id/getFollowedUsersQuestions', catchAsync(userController.getFollowedUsersQuestions)); //TODO

//Get Route to Render User Profile Page
router.get('/user/:id', catchAsync(userController.renderUserProfilePage));

//Put or Update Route to Edit the User And Save it in Database
router.put('/user/:id',upload.single("profile-picture"),catchAsync(userController.editUser));

//Delete Route to Delete A User from Database
router.delete('/user/:id', catchAsync(userController.deleteUser));

//Get Route to Get the Saved Questions of User
router.get('/user/:id/question/savedQuestions', catchAsync(userController.getSavedQuestions));

//Post Route to Add A Question to User Saved Questions
router.post('/user/:id/question/:questionId/savedQuestions', catchAsync(userController.saveQuestion));

//Get Route to Display User Created Questions
router.get('/user/:userid/question/createdQuestions', catchAsync(userController.createdQuestions));

//Post Route to Display User Created Questions with Filter Applied
router.post('/user/:userid/question/createdQuestions', catchAsync(userController.filterQuestions));

//Get Route to Display all the list of users created.
router.get("/users",catchAsync(userController.getUsers));

module.exports = router;