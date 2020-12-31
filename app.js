// const createError = require('http-errors');
// const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const userRouter = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);


module.exports = app;
