const bcrypt = require("bcrypt");

const hashPassword = async (pw) => {
    const hash = await crypt.hash(pw,10);
    return hash;
}

const comparePassword = async (pw,hash) => {
    const result = await crypt.compare(pw,hash);
    return result;
}

module.exports =  {hashPassword,comparePassword};