const Router = require('express');

const router = new Router();
const statsController = require('../controller/stats.controller');

router.post('/setstat', statsController.setUserStats);
router.get('/stat', statsController.getUserStats);

module.exports = router;
