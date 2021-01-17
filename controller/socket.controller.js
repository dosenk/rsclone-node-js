const server = require('http');
const io = require('socket.io');
const CONSTANTS = require('../constants/constants');
const Game = require('./components/Game');

class SocketController {
  constructor(server, url) {
    this.server = server;
    this.url = url;
    this.gameCount = 0;
    this.game = new Game(this.gameCount);
  }

  start(httpServer) {
    const options = {
      cors: true,
      methods: ['GET', 'POST'],
      origins: [CONSTANTS.SOCKET_SERVER_URL],
    };
    this.io = io(httpServer, options);
    this.addEventListeners();
  }

  addEventListeners() {
    this.io.on('connection', (socket) => {
      socket.on('broadcast', (word) => {
        const senderName = this.game.getUserName(socket.id);
        this.io.emit('broadcast', senderName, word);
        this.checkAnswer(word, senderName);
      });

      socket.on('usersInfo', (info, actionType) => {
        if (actionType === CONSTANTS.NAME) {
          const data = {
            name: info,
            socketId: socket.id,
          };
          this.checkGame(actionType, data);
        }
      });

      socket.on('game', (info, actionType) => {
        if (actionType === CONSTANTS.WORD) {
          this.game.setGameWord(info);
        }
        // this.checkGame(actionType, info); // что-то чтобы игра началась
      });

      socket.on('draw', (info, actionType) => {
        this.game.setDrawInfo(actionType, info);
        socket.broadcast.emit('draw', info, actionType);
      });

      socket.on('disconnect', () => {
        this.checkGame(CONSTANTS.DELETE_USERS, socket.id);
      });
    });
  }

  async checkGame(actionType, data) {
    console.log(actionType, data);
    const state = await this.game.getGameState(actionType, data);
    // console.log(state.guessers);
    if (state !== undefined) {
      state.actionTypes.forEach((stateActionType) => {
        this.doAction(stateActionType, state);
      });
    }
  }

  sendWord(state) {
    const { socketId } = state.users.painter;
    const { words } = state;
    this.io.to(socketId).emit('game', words, CONSTANTS.WORD);
  }

  sendUsers(state) {
    const { users } = state;
    console.log(users);
    this.io.emit('usersInfo', users, CONSTANTS.USERS);
  }

  sendDrawInfo(state) {
    const { gameDrawInfo } = state;
    this.io.emit('draw', gameDrawInfo.drawColor, CONSTANTS.DRAW_COLOR);
    this.io.emit('draw', gameDrawInfo.drawThickness, CONSTANTS.DRAW_THICKNESS);
  }

  doAction(actionType, state) {
    switch (actionType) {
      case CONSTANTS.WORD:
        this.sendWord(state);
        break;
      case CONSTANTS.USERS:
        this.sendUsers(state);
        break;
      case CONSTANTS.DRAW_COLOR:
      case CONSTANTS.DRAW_THICKNESS:
        this.sendDrawInfo(state);
        break;
      default:
        break;
    }
  }
}

module.exports = new SocketController(server, CONSTANTS);
