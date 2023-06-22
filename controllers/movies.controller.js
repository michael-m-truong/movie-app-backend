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

exports.Add_Favorite = async (request, response) => {
    try {
        const result = await movies.add_favorite(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Remove_Favorite = async (request, response) => {
    try {
        const result = await movies.remove_favorite(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Read_User_Data = async (request, response) => {
    try {
        const result = await movies.read_user_data(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Add_Rating = async (request, response) => {
    try {
        const result = await movies.add_rating(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Edit_Rating = async (request, response) => {
    try {
        const result = await movies.edit_rating(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Remove_Rating = async (request, response) => {
    try {
        const result = await movies.remove_rating(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Add_Watchlist = async (request, response) => {
    try {
        const result = await movies.add_watchlist(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}

exports.Remove_Watchlist = async (request, response) => {
    try {
        const result = await movies.remove_watchlist(request)
        //const result = await movies.add_favorite_benchmark(request)
        return response.status(200).send(result)
    }
    catch (e) {
        //console.log(e)
        return response.status(500).send(e)
    }
}