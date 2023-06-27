const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true,
    // },
    movieId: Number,
    overview: {
        type: String
    },
    backdrop_path: {
        type: String
    },
    title: {
        type: String
    },
    genre: {
        type: [String]
    },
    poster_path: {
        type: String
    },
    vote_average: {
        type: Number
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
        index: true
    },
    // reference to ratings
    // maybe you add personalized notes here
});

module.exports = MovieSchema