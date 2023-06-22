const mongoose = require("mongoose");

const RatingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movieId: {
        type: Number,
        required: true,
        // index: true,
        unique: true
    },
    ratingValue: {
        type: Number,
        required: [true, "Please provide a rating"],
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
    },
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
    dateAdded: {
        type: Date,
        default: Date.now(),
        index: true
    },
});

RatingsSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model.Ratings || mongoose.model("Ratings", RatingsSchema);
