const express = require('express');
const router = express.Router();
const MoviesController = require('../controllers/movies.controller')
const Authorization = require('../middlewares/authorization.middleware')

///{controller}/{action}
router.get('/now-playing', MoviesController.Now_Playing)
router.get('/discover-stats', MoviesController.Discover_Stats)
router.get('/discover-stats-updates', MoviesController.Discover_Stats_Updates)

router.use(Authorization)
//router.get('/read-all', MoviesController.Read_All)

router.post('/add-favorite', MoviesController.Add_Favorite)
router.post('/remove-favorite', MoviesController.Remove_Favorite)
router.get('/read-all', MoviesController.Read_User_Data)
router.post('/add-rating', MoviesController.Add_Rating)
router.post('/edit-rating', MoviesController.Edit_Rating)
router.post('/remove-rating', MoviesController.Remove_Rating)
router.post('/add-watchlist', MoviesController.Add_Watchlist)
router.post('/remove-watchlist', MoviesController.Remove_Watchlist)
router.post('/add-reminder', MoviesController.Add_Reminder)
router.post('/remove-reminder', MoviesController.Remove_Reminder)


module.exports = router;