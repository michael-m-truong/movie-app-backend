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
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        return response.status(200).cookie('TOKEN', result.token, {
            //sameSite: 'strict',
            sameSite: 'none',
            secure: true,     // for prod
            path: '/',
            expires: expirationDate,
            httpOnly: true,
        }).send(result)
        // response.status(202).cookie('idekkkkk', 'chaoddd', {
        //     sameSite: 'strict',
        //     path: '/',
        //     expires: expirationDate,
        //     //httpOnly: true
        // })
        // response.send('cookie being intialized')
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