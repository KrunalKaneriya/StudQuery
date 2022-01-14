const express = require("express");
const router = express.Router();
const User = require("../models/user");
const session = require("express-session");
const crypt = require("bcrypt");



router.get("/login",(req,res) => {
    res.render("login");
})

router.post("/login",async (req,res) => {
    const {username,password} = req.body; //Fetching Username And Password From Browser

    const user = await User.findOne({username}); //Finding The Username in DB

    if(user) {
        const result = await crypt.compare(password,user.userHash);

        const {_id : id} = user;

        //Find The Logged in User and run Update Query to Update the lastLoggedIn To Latest Time
        await User.findByIdAndUpdate(id , {$set: {"lastLoggedIn" : new Date() }});

        req.session.username = user.username;
        req.session.userid = user._id;
        req.session.isLoggedIn =  true;
        
        if(result) {
            res.redirect("/");
        } else {
            res.send("Username Or Password is Incorrect");
        }
    } else {
        res.send("User is not Registered");
    }
    
    
    
})

module.exports = router;


/*
1.To Login Using Username and Password
2.To check that the user is there 
3.and if the user is there then get the userhash and check the password and if it is valid then allow the user to login
4.Otherwise send that the user is not found


*/