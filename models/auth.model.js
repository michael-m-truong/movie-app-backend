const mongoose = require("mongoose");
const AuthSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: [true, "Username already exists"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        unique: false
    },
    phoneNumber: {
        type: String,
        default: ""
    }
})

//create user table or collection if there is no table w/ that name already
module.exports = mongoose.model.Auth || mongoose.model("Auth", AuthSchema)
