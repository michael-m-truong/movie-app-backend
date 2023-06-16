const express = require('express');
const router = express.Router();
const MoviesController = require('../controllers/movies.controller')
const Authorization = require('../middlewares/authorization.middleware')

///{controller}/{action}

router.use(Authorization)
//router.get('/read-all', MoviesController.Read_All)

router.post('/add-favorite', MoviesController.Add_Favorite)
router.post('/remove-favorite', MoviesController.Remove_Favorite)
router.get('/read-all', MoviesController.Read_User_Data)

module.exports = router;