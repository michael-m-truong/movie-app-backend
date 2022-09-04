const free_endpoint = require('../services/free-endpoint.service')

exports.free_endpoint = async (request, response) => {
    try {
        const result = await free_endpoint.free_endpoint(request.body)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
} 