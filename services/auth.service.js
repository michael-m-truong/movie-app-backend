const Auth = require('../models/auth.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (reqBody) => {
    try {
        hashedPassword = await bcrypt.hash(reqBody.password, 10) //hash the password recieved from request body 10 times (10 salt rounds)
        const user = new Auth({
            username: reqBody.username,
            password: hashedPassword
        })
        try {
            const result = await user.save() 
            console.log(result)
            const user_obj = new User({
                username: result._id, // Use the _id of the saved auth object as the username reference
                //watchlist: [], // Initialize with an empty watchlist
                //favorites: [], // Initialize with an empty favorites list
                //ratings: new Map(), // Initialize with an empty ratings list
            });
            
            // Save the user object to the database
            const savedUser = await user_obj.save();
            console.log(savedUser)
            console.log("wtf")
            return {
                message: "User Created Successfully",
                result,
            }
        }
        catch (error) {
            throw {
                message: "Username already exists",
                error,
            }
        }
    }
    catch(error) {
        if (error?.message !== undefined) {
            throw error
        }
        else 
            throw {
                message: "Password not hashed successfully",
                error,
            }
    }
}

exports.login = async (reqBody) => {
    try {
        const user = await Auth.findOne({ username: reqBody.username })
        if (user === null) {
            throw {}
        }
        try {
            const passwordCheck = await bcrypt.compare(reqBody.password, user.password)
            console.log(passwordCheck)
            if (!passwordCheck) {
                console.log(passwordCheck)
                throw {
                    message: "Password does not match",
                    passwordCheck,
                }
            }
            const token = jwt.sign(
                {
                    userId: user._id,
                    username: user.username 
                },
                process.env.SECRET_KEY,
                { expiresIn: "24h" }
            )
            return {
                message: "Login Successful",
                username: user.username,
                token,
            }
        }
        catch(error) {
            console.log(error)
            if (error?.message !== undefined) {
                throw error
            }
            else {
                throw {
                    message: "Error logging in",
                    error
                };
            }
        };
    }
    catch (error) {
        if (error?.message !== undefined) {
            throw error
        }
        else {
            throw {
                message: "Username not found",
            }
        }
    }
}

exports.logout = async (reqBody) => {
    return {
        message: 'Logged out'
    }
}

exports.isLoggedIn = async (req) => {

    const username = req.user.username

    return {
        message: true,
        username: username 
    }
}