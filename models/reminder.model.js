const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  // userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  // },
  movieId: Number,
  overview: {
    type: String,
  },
  backdrop_path: {
    type: String,
  },
  title: {
    type: String,
  },
  genre: {
    type: [String],
  },
  poster_path: {
    type: String,
  },
  vote_average: {
    type: Number,
  },
  dateAdded: {
    type: Date,
    default: Date.now(),
    index: true,
  },
  release_date: {
    type: String, // Change the type to Date for easier comparison
  },
  expireAt: {
    type: Date,
    default: function () {
      // Calculate the TTL based on the difference between dateAdded and release_date
      const diffMilliseconds = new Date(this.release_date) - this.dateAdded;
      const ttlMilliseconds = Math.max(diffMilliseconds, 0); // Ensure TTL is at least 0
      return new Date(Date.now() + ttlMilliseconds);
    },
    index: { expires: 0 }, // Set the index to expire documents after the specified date
  },
  // reference to ratings
  // maybe you add personalized notes here
});

module.exports = ReminderSchema;
