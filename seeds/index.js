const mongoose = require("mongoose");
const question = require("./question");
const Question = require("../models/question");
const User  = require("../models/user");
mongoose.connect("mongodb://127.0.0.1:27017/studquery",{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on("error",console.error.bind(console,"Connection Error"));
db.once("open",() => {
    console.log("Database Connected");
})

const randomObject = array => array[Math.floor(Math.random() * array.length)];

const seedQuestions = async (userid) => {
    const user = await User.findById(userid);
    for(let i=0;i<5;i++) {
        const createdQuestion = new Question(randomObject(question));
        user.questions.push(createdQuestion);
        createdQuestion.user = user;

        await user.save();
        await createdQuestion.save();
    }
}

seedQuestions('62152b7ef8f7a5474d5b6be8').then(() => {
    mongoose.connection.close();
});