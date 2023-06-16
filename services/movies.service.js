const User = require('../models/user.model');
const Auth = require('../models/auth.model');
const mongoose = require('mongoose');

exports.read_all = async (reqBody) => {
    return { message: "My favorie movie is: Ford vs Ferrari"}
}

exports.add_favorite = async (req) => {
    try {
        console.log(req.body)
        const { movieId, genre, poster_path, title } = req.body; // Assuming you have the user ID and movie ID from the request body
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
      overview: overview
		};
  
        // Save the new favorite object
        //const savedFavorite = await newFavorite.save();
    
        // Add the reference to the saved favorite object in the user's favorites array
        user.favorites.set(movieIdString, newFavorite)
    
        // Save the updated user object
        await user.save();

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
        const user = await User.findOne({ username: userId })
    
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
            user
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
