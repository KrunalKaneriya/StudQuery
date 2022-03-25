if (process.env.NODE_ENV !== 'production') {
	//We are checking if the value of NODE_ENV is not production
	//Then we need to include the dotenv package and call config function and the config function will bring
	//all the enviroment variables set in .env file in the project
	require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const joi = require('joi');
const back = require('express-back');
const mongoSanitize = require('express-mongo-sanitize'); //Package that removes special characters when getting input
const MongoStore = require('connect-mongo');

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate); //Setting The Engine To EjsMate So we can use Partials And Layouts
app.set('views', path.join(__dirname, 'views/studquery'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());

const store = MongoStore.create({
	mongoUrl: process.env.DB_URL || 'mongodb://127.0.0.1:27017/studquery',
	touchAfter: 24 * 60 * 60,
});
// app.set('trust proxy',true);
app.use(
	session({
		store,
		secret: process.env.secret ||'thisissecret',
		resave: false,
		saveUninitialized: false,
	})
);
app.use(back());
app.use(flash());

/*******************************************************************
 * USING FLASH MESSAGES TO BE DISPLAYED WHEN SOME EVENT IS OCCURED *
 *******************************************************************/

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.voteinc = req.flash('voteinc');
	res.locals.votedec = req.flash('votedec');
	res.locals.edit = req.flash('edit');
	res.locals.welcome = req.flash('welcome');
	next();
});

/*********************
 * IMPORTING ROUTERS *
 *********************/

const login = require('./routes/login');
const signup = require('./routes/signup');
const home = require('./routes/home');
const user = require('./routes/user');
const question = require('./routes/question');
const answer = require('./routes/answer');
const explore = require('./routes/explore');
const ExpressError = require('./utils/ExpressError');

/******************************
 * ADMIN ROUTES CONFIGURATION *
 ******************************/
const adminLogin = require('./routes/admin/home');
const adminUsers = require('./routes/admin/user');
const adminQuestions = require('./routes/admin/question');
const adminAnswers = require('./routes/admin/answer');
const adminSearch = require('./routes/admin/search');
const report = require('./routes/admin/report');

/*************************************
 * CONNECTING TO DATABASE AND SERVER *
 *************************************/

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Started Server At Port ${port}`);
});

mongoose
	.connect(process.env.DB_URL)
	.then(() => {
		console.log('Mongodb Connected');
	})
	.catch((e) => {
		console.log(e);
		console.log('Error Connecting to Mongodb');
	});
/**********************
 * USING LOGIN ROUTER *
 **********************/
app.use(login);

/***********************
 * USING SIGNUP ROUTER *
 ***********************/
app.use(signup);

/*********************
 * USING HOME ROUTER *
 *********************/
app.use(home);

/*********************
 * USING USER ROUTER *
 *********************/
app.use(user);

/*************************
 * USING QUESTION ROUTER *
 *************************/
app.use(question);

/**********************************
 * USING ANSWER OR COMMENT ROUTER *
 **********************************/
app.use(answer);

/************************
 * USING EXPLORE ROUTER *
 ************************/
app.use(explore);

/**********************
 ** USING ADMIN ROUTES *
 **********************/

/***************************
 * USING ADMIN LOGIN ROUTE *
 ***************************/
app.use(adminLogin);

/****************************
 * USING ADMIN SEARCH ROUTE *
 ****************************/
app.use(adminSearch);

/***************************
 * USING ADMIN USERS ROUTE *
 ***************************/
app.use(adminUsers);

/*******************************
 * USING ADMIN QUESTIONS ROUTE *
 *******************************/
app.use(adminQuestions);

/*****************************
 * USING ADMIN ANSWERS ROUTE *
 *****************************/
app.use(adminAnswers);

/**********************
 * USING REPORT ROUTE *
 **********************/
app.use(report);

/****************************************************
 * CREATING ERROR CATCHING MIDDLEWARES OR FUNCTIONS *
 ****************************************************/

//Now When The Route or URL is Not Found then this Error will be Called
//and it will create a new expressError object and pass to below function
app.all('*', (req, res, next) => {
	next(new ExpressError(404, 'Page Not Found'));
});

//Now if any error occurs then this function will be called compulsory.
app.use((err, req, res, next) => {
	const userSession = req.session;
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = 'Oh Nooo.. Something Went Wrong!!!';
	}
	res.status(statusCode).render('error', { userSession, err });
});
