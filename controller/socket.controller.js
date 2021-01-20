/* eslint-disable max-len */
// const server = require('http');
const io = require('socket.io');
const CONSTANTS = require('../constants/constants');
const Game = require('./components/Game');
const Users = require('./components/Users');

class SocketController {
  constructor() {
    this.gameCount = 0;
    this.users = new Users();
    this.game = new Game(this.gameCount, this.users);
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
      socket.on('broadcast', (message) => {
        this.checkBroadcastEvent(message, socket.id);
      });

      socket.on('usersInfo', (data, actionType) => {
        this.checkUserInfoEvent(actionType, data, socket.id);
      });

      socket.on('game', (data, actionType) => {
        this.checkGameEvent(actionType, data, socket.id);
      });

      socket.on('draw', (data, actionType) => {
        this.checkDrawEvent(actionType, data, socket);
      });

      socket.on('disconnect', () => {
        this.checkDisconnectEvent(socket.id);
      });
    });
  }

  checkBroadcastEvent(message, socketId) {
    this.sendMessage(message, socketId, 'broadcast');
    if (this.game.checkGuessWord(message)) {
      this.game.stop();
      this.sendStopGame(socketId, message.toLowerCase());
    }
  }

  checkDisconnectEvent(socketId) {
    this.users.deleteUser(socketId);
    if (this.users.getCountUsers() < 2) {
      this.game.stop();
      this.sendStopGame(null, null, true);
    }
    this.sendUsers();
  }

  checkDrawEvent(actionType, data, socket) {
    switch (actionType) {
      case CONSTANTS.DRAW_COLOR:
      case CONSTANTS.DRAW_THICKNESS:
        this.game.setDrawInfo(actionType, data);
        break;
      default:
        break;
    }
    socket.broadcast.emit('draw', data, actionType);
  }

  async checkUserInfoEvent(actionType, data, socketId) {
    if (actionType === CONSTANTS.NAME) {
      this.users.addUser(data, socketId);
      if (this.users.getCountUsers() >= 2) {
        if (!this.game.getIsGameStarted()) {
          await this.game.start();
          this.users.allUsers.forEach((user) => {
            this.sendRole(user.role, user.socketId);
            if (user.role === CONSTANTS.ROLE_PAINTER) this.sendWordToSelect(user.socketId);
          });
        } else {
          const lastUser = this.users.allUsers.get(socketId);
          this.io.to(lastUser.socketId).emit('usersInfo', lastUser.role, CONSTANTS.ROLE);
          this.sendDrawInfo(lastUser.socketId);
          if (this.game.getGuessWord() !== '') this.sendStartGame(lastUser.socketId);
        }
        this.sendUsers();
      }
    }
  }

  checkGameEvent(actionType, data) {
    if (actionType === CONSTANTS.WORD_TO_GUESS) {
      this.game.setGameWord(data);
      this.sendStartGame();
    }
  }

  sendMessage(message, socketId, socketEvent) {
    const { name } = this.users.getUser(socketId);
    this.io.emit(socketEvent, name, message);
  }

  sendRole(role, socketId) {
    this.io.to(socketId).emit('usersInfo', role, CONSTANTS.ROLE);
  }

  sendWordToSelect(socketId) {
    this.io.to(socketId).emit('game', this.game.wordsToSelect, CONSTANTS.WORDS_TO_SELECT);
  }

  sendStartGame(socketId = null) {
    if (!socketId) this.io.emit('game', this.game.guessWord, CONSTANTS.START_GAME);
    else this.io.to(socketId).emit('game', this.game.guessWord, CONSTANTS.START_GAME);
  }

  sendStopGame(winnerSocketId, guessWord, waitUsersFlag = false) {
    const data = waitUsersFlag
      ? {
        loading: waitUsersFlag,
      }
      : {
        winnerName: this.users.getUser(winnerSocketId).name,
        guessWord,
      };
    this.io.emit('game', data, CONSTANTS.STOP_GAME);
  }

  sendDrawInfo(socketId) {
    const gameDrawInfo = this.game.getDrawInfo();
    this.io.to(socketId).emit('draw', gameDrawInfo.drawColor, CONSTANTS.DRAW_COLOR);
    this.io.to(socketId).emit('draw', gameDrawInfo.drawThickness, CONSTANTS.DRAW_THICKNESS);
  }

  sendUsers() {
    const users = this.users.getRoles();
    this.io.emit('usersInfo', users, CONSTANTS.USERS);
  }
}

module.exports = new SocketController();
