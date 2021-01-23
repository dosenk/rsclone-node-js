const Router = require('express');

const router = new Router();
const userController = require('../controller/user.controller');

router.post('/user', userController.createUser);
router.post('/userPass', userController.checkUserPass);
router.get('/user', userController.getUsers);
router.get('/user/:id', userController.getOneUser);
router.put('/user', userController.updateUserPass);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;
