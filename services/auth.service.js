const Auth = require('../models/auth.model');
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

exports.isLoggedIn = async (reqBody) => {
    return {
        message: true
    }
}