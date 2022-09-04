const express = require('express');
const router = express.Router();
const FreeEndpointController = require('../controllers/free-endpoint.controller')

///{controller}/{action}
router.get('/', FreeEndpointController.free_endpoint)

module.exports = router;