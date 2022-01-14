const express = require("express");
const router = express.Router();
const User = require("../models/user");
const crypt = require('bcrypt');

router.get("/signup",(req,res) => {
        res.render("signup");
}) 

router.post("/signup",async (req,res) => {
        const {username,alias,email,age,password,studyingIn,description,city} = req.body;
        const userHash = await crypt.hash(password,12);
        const user = new User({
            username,alias,email,age,userHash,description,studyingIn,city
        });

        
        await user.save();
        res.redirect("/signup");
})

module.exports = router;

/*
1. Take all the data of the user from the browser
2. To hash the given password and create a userHash
3. Store all the data of the user in the DB except password
4. Create a session with following Details
        [isLoggedin,user_id,username,email,age,alias]
*/