const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

module.exports = async (request, response, next) => {
    try {

        const token = await request.cookies['TOKEN']

        console.log(token)

        const decodedToken = await jwt.verify(token, process.env.SECRET_KEY)

        const user = await decodedToken

        request.user = user
        
        next()
    }
    catch (error) {
        response.status(401).json({
            error: "You made an unauthorized request!"
        })
    }
}