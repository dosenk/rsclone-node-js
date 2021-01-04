// const createError = require('http-errors');
// const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const userRouter = require('./routes/user.router');
const clientRouter = require('./routes/client.router');

const app = express();
app.use(express.static(__dirname + '/public'));

app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use('/client', clientRouter);

const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

const users = [];

io.on('connection', socket => { 
    users.push(socket.client.id);
    console.log(users);
    socket.on("broadcast", (args) => {
        io.emit("broadcast", socket.client.id, args);
    });
});
 
server.listen(3000);

module.exports = app;
