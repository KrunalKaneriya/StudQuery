const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/*********************
 * IMPORTING ROUTERS *
 *********************/

const login = require("./routes/login");
const signup = require("./routes/signup");
const home = require("./routes/home");

/*************************************
 * CONNECTING TO DATABASE AND SERVER *
 *************************************/
app.listen(3000, () => {
    console.log('Started Server At Port 3000');
})

mongoose.connect('mongodb://localhost:27017/studquery')
    .then(() => {
        console.log("Mongodb Connected");
    })
    .catch(e => {
        console.log(e);
        console.log("Error Connecting to Mongodb");
    })


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