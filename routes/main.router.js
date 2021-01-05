const Router = require('express');
const router = new Router();
const io = require('socket.io');

router.set('view engine', 'pug');

router.get('/', (req, res) => {
    res.render('login', {
        title: 'login',
        createPlayerText: 'Create player',
        loginPlayerText: 'Login in'
    });
});


module.exports = router;