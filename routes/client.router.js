const Router = require('express');
const router = new Router();
const io = require('socket.io');

router.set('view engine', 'pug');

router.get('/', (req, res) => {
    res.render('index', { title: 'Client socket-io', message: 'Hello there!' });
});


module.exports = router;