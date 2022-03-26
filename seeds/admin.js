const mongoose = require("mongoose");
const crypt = require("bcrypt");
const Admin = require("../models/admin");
mongoose.connect("mongodb+srv://Admin-Krunal:qwertyuiop0000@studquery.k45me.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;

db.on("error",console.error.bind(console,"Connection Error"));
db.once("open",() => {
    console.log("Database Connected");
})


async function saveAdmin() {
    const userhash = await crypt.hash("admin",12);
    console.log(userhash);

    const admin = new Admin({
        username:"admin",
        userHash:userhash
    })
    await admin.save();

}

saveAdmin().then(() => {
    mongoose.connection.close();
});