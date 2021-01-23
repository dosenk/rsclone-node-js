const Router = require('express');

const router = new Router();
const statsController = require('../controller/stats.controller');

router.get('/stats/:name', statsController.getUsers);
router.delete('/user/:name', statsController.deleteUser);

module.exports = router;
