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

// app.use('/', mainRouter);
app.use('/users', userRouter);
app.use('/client', clientRouter);


// const PORT = process.env.PORT || 3000;
// console.log(PORT, ' - port HEROKU');
// server.listen(39287, () => { console.log(PORT, ' - listen') });

module.exports = app;
