// const createError = require('http-errors');
// const logger = require('morgan');
// import { SOCKET_SERVER_URL } from './constants/constants';

const cors = require('cors');
const express = require('express');

const userRouter = require('./routes/user.router');
const clientRouter = require('./routes/client.router');
const statsRouter = require('./routes/stats.router');

const socket = require('./controller/socket.controller');

const appExpress = express();

appExpress.use(express.static(`${__dirname}/public`));

appExpress.use(cors());
appExpress.use(express.json());

appExpress.use('/users', userRouter);
appExpress.use('/client', clientRouter);
appExpress.use('/stats', statsRouter);

module.exports = { appExpress, socket };
