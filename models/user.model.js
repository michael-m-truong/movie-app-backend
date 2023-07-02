const mongoose = require("mongoose");
const MovieSchema = require("./movie.model");
const ReminderSchema = require("./reminder.model");
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
    ratings: {
        type: Map,
        of: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ratings'
        },
        default: new Map(),
    },
    favorites: {
        type: Map,
        of: MovieSchema,  //key movie, value ratingsschema
        default: new Map(),
    },
    // reminders: {
    //     type: Map,
    //     of: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Reminders'
    //     },
    //     default: new Map(),
    // },
});

module.exports = mongoose.model.User || mongoose.model("User", UserSchema);
