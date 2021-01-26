const Router = require('express');

const router = new Router();
const statsController = require('../controller/stats.controller');

router.put('/setstat', statsController.setUserStats);
router.get('/stat', statsController.getUserStats);
router.get('/rating', statsController.getUsersRating);

module.exports = router;
