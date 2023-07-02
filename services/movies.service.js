const User = require('../models/user.model');
const Auth = require('../models/auth.model');
const Ratings = require('../models/ratings.model');
const mongoose = require('mongoose');
const redisConnect = require('../db/redisConnect')
const axios = require('axios')
const dynamodbConnect = require("../db/dynamodbConnect");
const { PutItemCommand, UpdateItemCommand, GetItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { Twilio } = require('twilio');


exports.read_all = async (reqBody) => {
    return { message: "My favorie movie is: Ford vs Ferrari"}
}

exports.add_favorite = async (req) => {
    try {
        //console.log(req.body)
        const { movieId, genre, poster_path, title, backdrop_path, overview, vote_average } = req.body; // Assuming you have the user ID and movie ID from the request body
        // console.log(typeof movieId);
        const userId = req.user.userId
        // console.log(req.user.userId)
        // Find the user by ID
        const user = await User.findOne({ username: userId });
		const movieIdString = movieId.toString();

        if (!user) {
            // Handle case where User document is not found
            console.log("baddd")
            return {
            success: false,
            message: "User not found",
            };
        }

        if (user.favorites.has(movieIdString)) {
          return {
            success: false,
            message: "Movie already favorited",
            };
        }

        // Create a new favorite object
        const newFavorite = {
      title: title,
			movieId: movieId,
			genre: genre,
			poster_path: poster_path,
      backdrop_path: backdrop_path,
      overview: overview,
      vote_average: vote_average
		};
  
        // Save the new favorite object
        //const savedFavorite = await newFavorite.save();
    
        // Add the reference to the saved favorite object in the user's favorites array
        user.favorites.set(movieIdString, newFavorite)
    
        // Save the updated user object
        await user.save();


        const updateRedis = async () => {
          const redis = redisConnect()
          const redisKey_favorite = 'stats:most:favorited'
          let redisValue = await getMostFavorited()
          await redis.set(redisKey_favorite, JSON.stringify(redisValue))
        }
        updateRedis()

        return {
            success: true,
            message: "Favorite added successfully",
        };
    } catch (error) {
        // Handle any errors that occur during the process
        return {
            success: false,
            message: "Error adding favorite",
            error: error.message,
        };
    }
}

exports.remove_favorite = async (req) => {
    try {
        const { movieId } = req.body;
        const userId = req.user.userId;

		const movieIdString = movieId.toString();

		const user = await User.findOne({ username: userId });

        if (user.favorites.has(movieIdString)) {
          	user.favorites.delete(movieIdString);
          	await user.save();
            
            const updateRedis = async () => {
              const redis = redisConnect()
              const redisKey_favorite = 'stats:most:favorited'
              let redisValue = await getMostFavorited()
              await redis.set(redisKey_favorite, JSON.stringify(redisValue))
            }
            updateRedis()


        } else {
          	// Favorite does not exist
			return {
              	success: false,
              	message: "Favorite not found",
            };
        }
    
        // const updateResult = await User.updateOne(
        //     { username: userId },
        //     { $pull: { favorites: { movieId: movieId } } }
        // );
    
        // if (updateResult.nModified === 0) {
        //     return {
        //     success: false,
        //     message: "Favorite not found",
        //     };
        // }

        // const favorite = await Favorite.findOneAndRemove({ userId: userId, movieId: movieId });

        // if (!favorite) {
        //     return {
        //       success: false,
        //       message: "Favorite not found",
        //     };
        //   }
    
        return {
            success: true,
            message: "Favorite removed successfully",
        };

    } catch (error) {
        return {
            success: false,
            message: "Error removing favorite",
            error: error.message,
        };
    }
}

exports.read_user_data = async (req) => {
	try {
        const userId = req.user.userId;
    
        // Find the user by ID
        //const user = await User.findOne({ username: userId }).populate('ratings')

        const user = await User.aggregate([
          { $match: { username: mongoose.Types.ObjectId(userId) } },
          {
            $lookup: {
              from: 'ratings',
              localField: 'username',
              foreignField: 'userId',
              as: 'ratings',
            },
          },
          {
            $addFields: {
              ratings: {
                $arrayToObject: {
                  $map: {
                    input: '$ratings',
                    in: {
                      k: { $toString: '$$this.movieId' }, // Use 'movieId' as the key
                      v: '$$this', // Use the whole rating object as the value
                    },
                  },
                },
              },
            },
          },
        ]);
        
        
        /* Used to find doc memory size*/
        // const userSizePipeline = [
        //   {
        //     $match: { username: mongoose.Types.ObjectId(userId) } // Filter for the desired user
        //   },
        //   {
        //     $project: {
        //       name: 1,
        //       object_size: { $bsonSize: "$$ROOT" }
        //     }
        //   }
        // ];
        
        // const result = await User.aggregate(userSizePipeline);
        
        // if (result.length > 0) {
        //   const { name, object_size } = result[0];
        //   console.log(`User: ${name}`);
        //   console.log(`Size of user document: ${object_size} bytes`);
        // } else {
        //   console.log("User not found");
        // }
    
        if (!user) {
            // Handle case where User document is not found
            return {
            success: false,
            message: "User not found",
            };
        }
    
        const favorites = user.favorites;
        //const ratings = await Ratings.find({ userId: userId })
        //user.ratngs = ratings
        //console.log(user.ratings)
    
        return {
            success: true,
            message: "User data retrieved successfully",
            user: user[0]
        };
    } catch (error) {
        // Handle any errors that occur during the process
        return {
            success: false,
            message: "Error retrieving user data",
            error: error.message,
        };
    }
}

exports.add_rating = async (req) => {
  try {
    const userId = req.user.userId;
    const { movieId, ratingValue, genre, poster_path, title, backdrop_path, overview, vote_average } = req.body;

    // Create a new rating object
    const newRating = new Ratings({
      userId: userId,
      movieId: movieId,
      ratingValue: ratingValue,
      title: title,
      movieId: movieId,
      genre: genre,
      poster_path: poster_path,
      backdrop_path: backdrop_path,
      overview: overview,
      vote_average: vote_average
    });

    // Save the new rating object
    const savedRating = await newRating.save();

    // Find the user by ID
    const user = await User.findOne({ username: userId })

    user.ratings.set(movieId.toString(), savedRating._id)
    await user.save()

    const updateRedis = async () => {
      const redis = redisConnect()
      const redisKey_rating = 'stats:most:rated'
      let redisValue = await getMostRated()
      await redis.set(redisKey_rating, JSON.stringify(redisValue))
    }
    updateRedis()

    return {
      success: true,
      message: "Rating added successfully",
      rating: savedRating,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error adding rating",
      error: error.message,
    };
  }
};

exports.edit_rating = async (req) => {
  try {
    const userId = req.user.userId;
    const { movieId, ratingValue } = req.body;

    // Find the rating by its ID
    const rating = await Ratings.findOne({userId: userId, movieId: movieId});

    if (!rating) {
      return {
        success: false,
        message: "Rating not found",
      };
    }

    // Update the rating value
    rating.ratingValue = ratingValue;

    // Save the modified rating
    const modifiedRating = await rating.save();

    return {
      success: true,
      message: "Rating modified successfully",
      rating: modifiedRating,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error modifying rating",
      error: error.message,
    };
  }
};

exports.remove_rating = async (req) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.body;

    // Find the rating by its ID and delete
    const rating = await Ratings.findOneAndDelete({userId: userId, movieId: movieId});

    if (!rating) {
      return {
        success: false,
        message: "Rating not found",
      };
    }

    // Delete the rating document
    // await rating.delete();

    // Remove the rating ObjectId from the user's ratings map
    // Find the user by ID
    const user = await User.findOne({ username: userId })
    user.ratings.delete(movieId.toString())
    await user.save()

    const updateRedis = async () => {
      const redis = redisConnect()
      const redisKey_rating = 'stats:most:rated'
      let redisValue = await getMostRated()
      await redis.set(redisKey_rating, JSON.stringify(redisValue))
    }
    updateRedis()

    return {
      success: true,
      message: "Rating deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting rating",
      error: error.message,
    };
  }
};

exports.add_watchlist = async (req) => {
  try {
      console.log(req.body)
      const { movieId, genre, poster_path, title, backdrop_path, overview, vote_average, release_date } = req.body; // Assuming you have the user ID and movie ID from the request body
      // console.log(typeof movieId);
      const userId = req.user.userId
      // console.log(req.user.userId)
      // Find the user by ID
      const user = await User.findOne({ username: userId });
  const movieIdString = movieId.toString();

      if (!user) {
          // Handle case where User document is not found
          console.log("baddd")
          return {
          success: false,
          message: "User not found",
          };
      }

      if (user.watchlist.has(movieIdString)) {
        return {
          success: false,
          message: "Movie already favorited",
          };
      }

      // Create a new favorite object
      const newFavorite = {
    title: title,
    movieId: movieId,
    genre: genre,
    poster_path: poster_path,
    backdrop_path: backdrop_path,
    overview: overview,
    vote_average: vote_average,
    release_date: release_date
  };

      // Save the new favorite object
      //const savedFavorite = await newFavorite.save();
  
      // Add the reference to the saved favorite object in the user's watchlist map
      user.watchlist.set(movieIdString, newFavorite)
  
      // Save the updated user object
      await user.save();

      const updateRedis = async () => {
        const redis = redisConnect()
        const redisKey_watchlist = 'stats:most:watchlisted'
        let redisValue = await getMostWatchlisted()
        await redis.set(redisKey_watchlist, JSON.stringify(redisValue))
      }
      updateRedis()

      return {
          success: true,
          message: "Favorite added successfully",
      };
  } catch (error) {
      // Handle any errors that occur during the process
      return {
          success: false,
          message: "Error adding favorite",
          error: error.message,
      };
  }
}

exports.remove_watchlist = async (req) => {
  try {
      const { movieId } = req.body;
      const userId = req.user.userId;

  const movieIdString = movieId.toString();

  const user = await User.findOne({ username: userId });

      if (user.watchlist.has(movieIdString)) {
          user.watchlist.delete(movieIdString);
          await user.save();

          const updateRedis = async () => {
            const redis = redisConnect()
            const redisKey_watchlist = 'stats:most:watchlisted'
            let redisValue = await getMostWatchlisted()
            await redis.set(redisKey_watchlist, JSON.stringify(redisValue))
          }
          updateRedis()
      } else {
          // Favorite does not exist
    return {
              success: false,
              message: "Watchlist movie not found",
          };
      }
  
      // const updateResult = await User.updateOne(
      //     { username: userId },
      //     { $pull: { favorites: { movieId: movieId } } }
      // );
  
      // if (updateResult.nModified === 0) {
      //     return {
      //     success: false,
      //     message: "Favorite not found",
      //     };
      // }

      // const favorite = await Favorite.findOneAndRemove({ userId: userId, movieId: movieId });

      // if (!favorite) {
      //     return {
      //       success: false,
      //       message: "Favorite not found",
      //     };
      //   }
  
      return {
          success: true,
          message: "Watchlist movie removed successfully",
      };

  } catch (error) {
      return {
          success: false,
          message: "Error removing watchlist movie",
          error: error.message,
      };
  }
}

exports.now_playing = async (req) => {

  const loadNowPlaying = async () => {
    try {
      const currentDate = new Date();
        const twoMonthsBefore = new Date();
        twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 3);
    
        const formattedCurrentDate = currentDate.toISOString().split("T")[0];
        const formattedTwoMonthsBefore = twoMonthsBefore.toISOString().split("T")[0];

      let moreMovies = [];
      let page = 1;
      let total_pages = 10
      let requestUrl = "https://api.themoviedb.org/3/discover/movie"
      while (page - total_pages !== 1) {  
        const response = await axios.get(
          requestUrl,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_TOKEN}`, // Replace with your actual bearer token
            },
            params: {
              "primary_release_date.gte": formattedTwoMonthsBefore,
                "primary_release_date.lte": formattedCurrentDate,
                sort_by: "vote_average.desc",
                "vote_average.lte": 9.9,
                "vote_count.gte": 5,
              page: page
            },
          }
        );
    
    
        const filteredMovies = response.data.results.filter((movie) => movie.popularity >= 30);
        moreMovies.push(...filteredMovies);
        page++;
      }
      
      return moreMovies;
    }
    catch (error){
      //console.log(error)
      throw error
    }
  };

  const fetchDataFromTMDb = async (redis, redisKey) => {
    // Fetch data from the TMDB API (code for fetching data goes here)
    console.log("huh")
    const tmdbData = await loadNowPlaying(); // Replace with your actual function to fetch now playing movies
    // Store the fetched data in Redis cache
    
    const now = new Date();

    // Calculate the datetime for midnight of the next day
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to the next day
    tomorrow.setHours(0, 0, 0, 0); // Set the time to midnight of the next day

    // Calculate the time difference between the current datetime and midnight of the next day in seconds
    const expirationTimestamp = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

    await redis.set(redisKey, JSON.stringify(tmdbData), 'EX', expirationTimestamp);
    console.log('Data stored in Redis cache.');
  }
  
  
  try {
    const redisKey = 'movies:nowplaying'
    const redis = redisConnect()
    // Check if data is available in Redis
    //redis.del(redisKey)
    const redisData = await redis.get(redisKey);
    //console.log(redisData)
    if (redisData) {
      return redisData
    }

    fetchDataFromTMDb(redis, redisKey)
    return;

  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
}

exports.discover_stats = async (req) => {
  try {
    //const stats =await getStats()
    let stats = {}
    const redisKey_rating = 'stats:most:rated'
    const redisKey_favorite = 'stats:most:favorited'
    const redisKey_watchlist = 'stats:most:watchlisted'
    const redis = redisConnect()

    console.log(await getMostRated())
    
    const [redisData_rating, redisData_favorite, redisData_watchlist] = await Promise.all([
      redis.get(redisKey_rating),
      redis.get(redisKey_favorite),
      redis.get(redisKey_watchlist),
    ]);

    stats.mostFavoritedMovie = JSON.parse(redisData_favorite)
    stats.mostRatedMovie = JSON.parse(redisData_rating)
    stats.mostWatchlistedMovie = JSON.parse(redisData_watchlist)

    // redis.del(redisKey_watchlist)
    // redis.del(redisData_favorite)
    // redis.del(redisKey_rating)

    if (redisData_favorite && redisData_rating && redisData_watchlist) {
      return {
        success: true,
        message: "Statistics retrieved successfully",
        stats
      }
    }
    else {
      const stats =await getAllStats()
      redis.set(redisKey_rating, JSON.stringify(stats.mostRatedMovie))
      redis.set(redisKey_favorite, JSON.stringify(stats.mostFavoritedMovie))
      redis.set(redisKey_watchlist, JSON.stringify(stats.mostWatchlistedMovie))
      return {
        success: true,
        message: "Statistics retrieved successfully",
        stats
      }
    }

    
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving statistics",
      error: error.message,
    };
  }
};

const getAllStats = async () => {
  const stats = {};

  const [mostRated, mostFavorited, mostWatchlisted] = await Promise.all([
    getMostRated(),
    getMostFavorited(),
    getMostWatchlisted(),
  ]);

  stats.mostFavoritedMovie = mostFavorited
  stats.mostRatedMovie = mostRated
  stats.mostWatchlistedMovie = mostWatchlisted

  return stats
}

const getMostWatchlisted = async () => {
  try {
    // Most Watchlisted Movie
    let mostWatchlistedMovie = await User.aggregate([
      {
        $project: {
          watchlistMovies: { $objectToArray: "$watchlist" },
        },
      },
      {
        $unwind: "$watchlistMovies",
      },
      {
        $group: {
          _id: "$watchlistMovies.v.movieId",
          movie: { $first: "$watchlistMovies.v" },
          watchlistCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$watchlistMovies.v.movieId",
          movies: { $push: { movie: "$movie", watchlistCount: "$watchlistCount" } },
        },
      },
      {
        $unwind: "$movies",
      },
      {
        $sort: {
          "movies.watchlistCount": -1,
          "movies.movie.vote_average": -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    mostWatchlistedMovie = mostWatchlistedMovie[0];

    return mostWatchlistedMovie
  }
  catch (error) {
    return {
      success: false,
      message: "Error retrieving statistics",
      error: error.message,
    };
  }
}


const getMostRated = async () => {
  try {
    // Most Rated Movies
    let mostRatedMovie = await Ratings.aggregate([
      {
        $group: {
          _id: "$movieId",
          ratingCount: { $sum: 1 },
          movieDetails: { $first: "$$ROOT" },
        },
      },
      {
        $sort: {
          ratingCount: -1,
          "movieDetails.vote_average": -1,
        },
      },
      {
        $limit: 1,
      },
    ])
    mostRatedMovie = mostRatedMovie[0];

    return mostRatedMovie
  }
  catch (error) {
    return {
      success: false,
      message: "Error retrieving statistics",
      error: error.message,
    };
  }
}


const getMostFavorited = async () => {
  try {
    // Most Favorited Movie
    let mostFavoritedMovie = await User.aggregate([
      {
        $project: {
          favoriteMovies: { $objectToArray: "$favorites" },
        },
      },
      {
        $unwind: "$favoriteMovies",
      },
      {
        $group: {
          _id: "$favoriteMovies.v.movieId",
          movie: { $first: "$favoriteMovies.v" },
          favoriteCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$favoriteMovies.v.movieId",
          movies: { $push: { movie: "$movie", favoriteCount: "$favoriteCount" } },
        },
      },
      {
        $unwind: "$movies",
      },
      {
        $sort: {
          "movies.favoriteCount": -1,
          "movies.movie.vote_average": -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    //console.log(mostFavoritedMovie[0])
    mostFavoritedMovie = mostFavoritedMovie[0];
    //console.log(mostFavoritedMovie)
    return mostFavoritedMovie
  }
  catch (error) {
    return {
      success: false,
      message: "Error retrieving statistics",
      error: error.message,
    };
  }
}

exports.add_reminder = async (req) => {
  const { phoneNumber, movieId, release_date, title } = req.body
  const primaryKey = "movieId"; // Replace with your actual primary key attribute name

  const client = dynamodbConnect()

  // Get the current epoch Unix timestamp in milliseconds
  const currentTimestamp = new Date(release_date).getTime();

  // Convert the timestamp to seconds (remove milliseconds)
  const currentEpoch = Math.floor(currentTimestamp / 1000);

  const movieIdString = movieId.toString();


  try {
    // Check if the item with the primary key exists
    const getItemParams = {
      TableName: "reminders", // Replace with your actual table name
      Key: {
        [primaryKey]: { N: movieIdString },
      },
    };

    const getItemCommand = new GetItemCommand(getItemParams);
    const getItemResult = await client.send(getItemCommand);

    if (getItemResult.Item) {
      // If the item exists, update the NS attribute by adding the value
      const updateItemParams = {
        TableName: "reminders", // Replace with your actual table name
        Key: {
          [primaryKey]: { N: movieIdString },
        },
        UpdateExpression: "ADD phoneNumbers :val",
        ExpressionAttributeValues: {
          ":val": { NS: [phoneNumber] }, // Replace 'attribute1' and 'Value2' with your actual attribute name and value
        },
      };

      const updateItemCommand = new UpdateItemCommand(updateItemParams);
      const updateItemResult = await client.send(updateItemCommand);

      console.log("Item updated successfully:", updateItemResult);
    } else {
      // If the item doesn't exist, add a new item with the primary key and NS attribute
      const putItemParams = {
        TableName: "reminders", // Replace with your actual table name
        Item: {
          [primaryKey]: { N: movieIdString },
          phoneNumbers: { NS: [phoneNumber] }, // Replace 'attribute1' and 'Value2' with your actual attribute name and value
          releaseDate: { N: String(currentEpoch)},
          movieName: { S: title},

        },
      };

      const putItemCommand = new PutItemCommand(putItemParams);
      const putItemResult = await client.send(putItemCommand);

      console.log("Item added successfully:", putItemResult);
    }

    //TODO:add to mongodb
    await mongo_add_reminder(req)
    //sendSMS_AddNumber(phoneNumber, title, release_date)
    return


  } catch (err) {
    console.error("Error adding/updating item in DynamoDB:", err);
  }
}

async function mongo_add_reminder(req) {

    try {
        //console.log(req.body)
        const { movieId, genre, poster_path, title, backdrop_path, overview, vote_average, release_date } = req.body; // Assuming you have the user ID and movie ID from the request body
        // console.log(typeof movieId);
        const userId = req.user.userId
        // console.log(req.user.userId)
        // Find the user by ID
        const user = await User.findOne({ username: userId });
		const movieIdString = movieId.toString();

        if (!user) {
            // Handle case where User document is not found
            console.log("baddd")
            return {
            success: false,
            message: "User not found",
            };
        }

        if (user.reminders.has(movieIdString)) {
          return {
            success: false,
            message: "Movie already reminded",
            };
        }

        // Create a new favorite object
        const newReminder = {
      title: title,
			movieId: movieId,
			genre: genre,
			poster_path: poster_path,
      backdrop_path: backdrop_path,
      overview: overview,
      vote_average: vote_average,
      release_date: release_date
		};
  
        // Save the new favorite object
        //const savedFavorite = await newFavorite.save();
    
        // Add the reference to the saved favorite object in the user's favorites array
        user.reminders.set(movieIdString, newReminder)
    
        // Save the updated user object
        await user.save();


        /*const updateRedis = async () => {
          const redis = redisConnect()
          const redisKey_favorite = 'stats:most:favorited'
          let redisValue = await getMostFavorited()
          await redis.set(redisKey_favorite, JSON.stringify(redisValue))
        }
        updateRedis() */

        return {
            success: true,
            message: "Reminder added successfully",
        };
    } catch (error) {
        // Handle any errors that occur during the process
        console.log(error)
        return {
            success: false,
            message: "Error adding reminder",
            error: error.message,
        };
    }
}

exports.remove_reminder = async (req) => {
  const { movieId, title } = req.body;
  const phoneNumber = req.user.phoneNumber
  const primaryKey = "movieId"; // Replace with your actual primary key attribute name

  const client = dynamodbConnect();

  const movieIdString = movieId.toString();

  try {
    const getItemParams = {
      TableName: "reminders", // Replace with your actual table name
      Key: {
        [primaryKey]: { N: movieIdString },
      },
    };

    const getItemCommand = new GetItemCommand(getItemParams);
    const getItemResult = await client.send(getItemCommand);

    //const phoneNumbers = getItemResult.Item.phoneNumbers ? getItemResult.Item.phoneNumbers.values : [];
    if (getItemResult.Item.phoneNumbers.NS.length === 1) {
      // Delete the whole document
      const deleteItemParams = {
        TableName: "reminders", // Replace with your actual table name
        Key: {
          [primaryKey]: { N: movieIdString },
        },
      };

      const deleteItemCommand = new DeleteItemCommand(deleteItemParams);
      await client.send(deleteItemCommand);
    } else {
      // Delete the phone number from the set
      const updateItemParams = {
        TableName: "reminders", // Replace with your actual table name
        Key: {
          [primaryKey]: { N: movieIdString },
        },
        UpdateExpression: "DELETE phoneNumbers :val",
        ExpressionAttributeValues: {
          ":val": { NS: [phoneNumber] },
        },
      };

      const updateItemCommand = new UpdateItemCommand(updateItemParams);
      await client.send(updateItemCommand);
    }

    // TODO: remove from MongoDB
    await mongo_remove_reminder(req);

    sendSMS_RemoveNumber(phoneNumber, title);
    return;
  } catch (err) {
    console.log(err.message);
    // console.error("Error deleting value from DynamoDB:", err);
  }
};


const sendSMS_AddNumber = async (phoneNumber, movieName, releaseDate) => {
  // Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNTSID
  const authToken = process.env.TWILIO_AUTHTOKEN

  // Create a Twilio client
  const client = new Twilio(accountSid, authToken);

  // Convert Unix time to correct format
  //const date = new Date(releaseDate * 1000);
  //const formattedDate = date.toISOString().split('T')[0];

  // Compose the SMS message
  const message = `Created reminder for ${movieName}, which releases ${releaseDate}!\n\nYou'll be notified when the movie comes out!`;

  // Format phone number
  const formattedPhoneNumber = '+' + phoneNumber;

  try {
    // Send the SMS
    await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER, // Replace with your Twilio phone number
      to: phoneNumber, // The phone number to send the SMS to
      body: message,
    });

    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

async function mongo_remove_reminder(req) {

  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

const movieIdString = movieId.toString();

const user = await User.findOne({ username: userId });

    if (user.reminders.has(movieIdString)) {
        user.reminders.delete(movieIdString);
        await user.save();
        
        /*const updateRedis = async () => {
          const redis = redisConnect()
          const redisKey_favorite = 'stats:most:favorited'
          let redisValue = await getMostFavorited()
          await redis.set(redisKey_favorite, JSON.stringify(redisValue))
        }
        updateRedis() */


    } else {
        // Favorite does not exist
    return {
              success: false,
              message: "Favorite not found",
          };
      }

      return {
          success: true,
          message: "Reminder removed successfully",
      };

  } catch (error) {
    console.log(error)
      return {
          success: false,
          message: "Error removing reminder",
          error: error.message,
      };
  }
}

const sendSMS_RemoveNumber = async (phoneNumber, movieName) => {
  // Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNTSID
  const authToken = process.env.TWILIO_AUTHTOKEN

  // Create a Twilio client
  const client = new Twilio(accountSid, authToken);

  // Convert Unix time to correct format
  //const date = new Date(releaseDate * 1000);
  //const formattedDate = date.toISOString().split('T')[0];

  // Compose the SMS message
  const message = `Deleted reminder for ${movieName}`;

  // Format phone number
  const formattedPhoneNumber = '+' + phoneNumber;
  console.log(phoneNumber)

  try {
    // Send the SMS
    await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER, // Replace with your Twilio phone number
      to: formattedPhoneNumber, // The phone number to send the SMS to
      body: message,
    });

    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};


/*
exports.read_user_data1 = async (req) => {
    try {
        const userId = req.user.userId;
    
        // Find the user by ID
        const user = await User.findOne({ username: userId })
            .populate('favorites')
            .exec();
    
        if (!user) {
            // Handle case where User document is not found
            return {
            success: false,
            message: "User not found",
            };
        }
    
        const favorites = user.favorites;
        const ratings = user.ratings;
    
        return {
            success: true,
            message: "User data retrieved successfully",
            data: {
            favorites,
            ratings,
            },
        };
    } catch (error) {
        // Handle any errors that occur during the process
        return {
            success: false,
            message: "Error retrieving user data",
            error: error.message,
        };
    }
};

exports.read_user_data2 = async (req) => {
    try {
      const userId = req.user.userId;
  
      // Find the user by ID
      //const user = await User.findOne({ username: userId }).exec();
  
      // if (!user) {
      //   // Handle case where User document is not found
      //   return {
      //     success: false,
      //     message: "User not found",
      //   };
      // }
  
      // Find all favorites of the user
      const favorites = await Favorite.find({ userId: userId })
      //const test = await favorites.explain();

      //console.log(test);
  
      // Prepare an array to store the ratings
      const ratings = [];
  
      // Iterate through each favorite and retrieve the corresponding rating
    //   for (const favorite of favorites) {
    //     const rating = user.ratings.get(favorite._id.toString());
    //     ratings.push({ favorite, rating });
    //   }
  
      return {
        success: true,
        message: "User data retrieved successfully",
        data: {
          favorites,
          ratings,
        },
      };
    } catch (error) {
      // Handle any errors that occur during the process
      return {
        success: false,
        message: "Error retrieving user data",
        error: error.message,
      };
    }
  };
  
  exports.read_user_data3 = async (req) => {
    try {
        const userId = req.user.userId;
        console.log(`this id: ${userId}`)
        const userData = await User.aggregate([
            { $match: { username: mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'ratings', // Assuming 'favorites' is the collection name
                    let: { userId: '$username' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
                    ],
                    as: 'ratings',
                },
            },
        ]);
        //console.log(userData)
        console.log(userData)
        if (!userData || userData.length === 0) {
            return {
            success: false,
            message: "User not found"
            };
        }
    
        const favorites = userData[0].favorites;
        const ratings = [];
    
        // Retrieve ratings for favorites using additional logic if needed
    
        return {
            success: true,
            message: "User data retrieved successfully",
            data: {
            favorites,
            ratings
            }
        };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving user data",
        error: error.message
      };
    }
  };

  exports.read_user_data4 = async (req) => {
    try {
        const userId = req.user.userId;
        console.log(`this id: ${userId}`)
        const userData = await User.aggregate([
            // { $match: { username: mongoose.Types.ObjectId("6488dbc8628dcd80e771192a") } },
            {
                $lookup: {
                    from: 'favorites', // Assuming 'favorites' is the collection name
                    localField: "null",
                    foreignField: "null",
                    as: 'favoritess',
                },
            },
        ]);
        // const userData = await Auth.aggregate([
        //   // { $match: { _id: mongoose.Types.ObjectId("6488dbc8628dcd80e771192a") } },
        //   {
        //     $lookup: {
        //       from: 'users',
        //       localField: "_id",
        //       foreignField: "username",
        //       as: 'favorites',
        //     },
        //   },
        // ]);
        
        //console.log(userData)
        if (!userData || userData.length === 0) {
            return {
            success: false,
            message: "User not found"
            };
        }
        console.log(userData)
        console.log("userdata: "+ userData[0].favoritess)
        const favorites = userData[0].favoritess;
        const ratings = [];
    
        // Retrieve ratings for favorites using additional logic if needed
    
        return {
            success: true,
            message: "User data retrieved successfully",
            data: {
            favorites,
            ratings
            }
        };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving user data",
        error: error.message
      };
    }
  };

  exports.read_user_data5 = async (req) => {
    try {
      const userId = req.user.userId;
  
      // Find the user by ID using aggregation pipeline
      const user = await User.aggregate([
        // { $match: { username: mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'favorites',
            localField: 'favorites',
            foreignField: '_id',
            as: 'favorites'
          }
        }
      ]);
  
      if (user.length === 0) {
        // Handle case where User document is not found
        return {
          success: false,
          message: "User not found",
        };
      }
      console.log(user[0].favorites.length)
      const favorites = user[0].favorites;
      const ratings = user[0].ratings;
  
      return {
        success: true,
        message: "User data retrieved successfully",
        data: {
          favorites,
          ratings,
        },
      };
    } catch (error) {
      // Handle any errors that occur during the process
      return {
        success: false,
        message: "Error retrieving user data",
        error: error.message,
      };
    }
  };
  
  

  exports.add_favorite_benchmark = async (req) => {
    try {
        const { movieId, genre } = req.body;
        const userId = req.user.userId;

        const user = await User.findOne({ username: userId });

        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }

        // Create an array to hold all the saved favorites
        const savedFavorites = [];

        // Add 1000 favorites
        for (let i = 8000; i < 12000; i++) {
            const newFavorite = new Favorite({
                userId: "648a212b414fd54a9f020b2f",
                movieId: i,
                genre: [],
            });

            const savedFavorite = await newFavorite.save();
            savedFavorites.push(savedFavorite);

            // Add the reference to the saved favorite object in the user's favorites array
            user.favorites.push(savedFavorite);
        }

        // Save the updated user object
        await user.save();

        return {
            success: true,
            message: "Favorites added successfully",
            favorites: savedFavorites,
        };
    } catch (error) {
        return {
            success: false,
            message: "Error adding favorites",
            error: error.message,
        };
    }
};
*/