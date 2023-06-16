const mongoose = require("mongoose");
const MovieSchema = require("./movie.model")
// const WatchlistSchema = require("./watchlist.model")

const UserSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: [true, "Please provide your username"],
        unique: [true, "Username already exists"]
    },
    watchlist: {
        type: Map,
        of: MovieSchema,  //key movie, value ratingsschema
        default: new Map(),
    },
    // ratings: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Favorites",
    //     unique: [true, "Already added to favorite"]   //we provide stats about ratings but not favorites
    // }],
    favorites: {
        type: Map,
        of: MovieSchema,  //key movie, value ratingsschema
        default: new Map(),
    },
});

module.exports = mongoose.model.User || mongoose.model("User", UserSchema);
