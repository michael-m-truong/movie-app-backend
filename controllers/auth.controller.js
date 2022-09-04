const auth = require('../services/auth.service')

exports.register = async (request, response) => {
    try {
        const result = await auth.register(request.body)
        return response.status(201).json(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).json(e)
    }
} 

exports.login = async (request, response) => {
    try {
        const result = await auth.login(request.body)
        return response.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        //console.log("ee")
        switch (e.message) {
            case "Password does not match":
                return response.status(401).json(e)

            case "Username not found":
                return response.status(404).json(e)
            
            case "Error logging in":
                return response.status(500).json(e)
            
            default:
                console.log(e)
                return response.status(500).json(e)

        }
        
    }
} 