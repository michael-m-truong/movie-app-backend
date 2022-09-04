const movies = require('../services/movies.service')

exports.Read_All = async (request, response) => {
    try {
        const result = await movies.read_all(request.body)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
} 