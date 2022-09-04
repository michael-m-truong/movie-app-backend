const express = require('express');
const router = express.Router();
const MoviesController = require('../controllers/movies.controller')
const Authorization = require('../middlewares/authorization.middleware')

///{controller}/{action}

router.use(Authorization)
router.get('/read-all', MoviesController.Read_All)

module.exports = router;