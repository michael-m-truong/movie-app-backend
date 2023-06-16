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
});

RatingsSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model.Ratings || mongoose.model("Ratings", RatingsSchema);
