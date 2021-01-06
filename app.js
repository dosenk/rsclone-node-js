// const createError = require('http-errors');
// const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const mainRouter = require('./routes/main.router');
const userRouter = require('./routes/user.router');
const clientRouter = require('./routes/client.router');

const app = express();
app.use(express.static(__dirname + '/public'));

app.use(cors());
app.use(express.json());

app.use('/', mainRouter);
app.use('/users', userRouter);
app.use('/client', clientRouter);

const server = require('https').createServer(app);
const options = {
    cors: true,
    methods: ["GET", "POST"],
 origins:["https://rsclone-node-js.herokuapp.com/"],
};
const io = require('socket.io')(server, options);

const users = new Map();

io.on('connection', socket => { 
    socket.on("broadcast", (args) => {
        console.log(args);
        io.emit("broadcast", users.get(socket.client.id), args);
    });

    socket.on("name", (args) => {
        console.log(args);
        users.set(socket.client.id, args);
    });

    socket.on("disconnect", () => {
        console.log('disconnect');
        users.delete(socket.client.id);
    });
});
 
server.listen(3000);

module.exports = app;
