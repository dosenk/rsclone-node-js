const io = require('socket.io');
const CONSTANTS = require('../constants/constants');
const Game = require('./components/Game');
const Users = require('./components/Users');

class SocketController {
  constructor() {
    this.gameCount = 0;
    this.msgCount = 0;
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
      socket.on('broadcast', (message, actionType) => {
        this.checkBroadcastEvent(message, actionType, socket);
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

  checkBroadcastEvent(message, actionType, socket) {
    this.sendMessage(message, actionType, socket, 'broadcast');
    if (this.game.checkGuessWord(message, actionType)) {
      const answer = message.toLowerCase();
      this.sendStopGame(socket.id, answer);
      this.game.stop();
    }
  }

  checkDisconnectEvent(socketId) {
    this.users.deleteUser(socketId);
    if (this.users.getCountUsers() < 2 || !this.users.getPainter()) {
      this.sendStopGame(null, null, true);
      this.game.stop();
    } else {
      this.sendUsers();
    }
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
    }
  }

  chooseGameOption(socketId) {
    if (!this.game.getIsGameStarted()) this.startGame();
    else this.connectGame(socketId);
    this.sendUsers();
  }

  async startGame() {
    await this.game.start();
    this.users.allUsers.forEach((user) => {
      this.sendRole(user);
      if (user.role === CONSTANTS.ROLE_PAINTER) { this.sendWordToSelect(user.socketId); }
    });
  }

  connectGame(socketId) {
    this.sendGameEvent(socketId, CONSTANTS.LOADING_GAME);
    const lastUser = this.users.allUsers.get(socketId);
    this.sendRole(lastUser);
    this.sendDrawInfo(lastUser.socketId);
    if (this.game.getGuessWord() !== '') this.sendGameEvent(lastUser.socketId, CONSTANTS.START_GAME);
  }

  checkGameEvent(actionType, data, socketId) {
    if (actionType === CONSTANTS.WORD_TO_GUESS) {
      this.game.setGameWord(data);
      this.sendGameEvent(null, CONSTANTS.START_GAME);
    }
    if (actionType === CONSTANTS.NEW_GAME) {
      if (this.users.getCountReadyUsers() >= 2) {
        this.chooseGameOption(socketId);
      }
    }
    if (actionType === CONSTANTS.READY_TO_GAME) {
      this.users.setReadyToGameFlag(socketId, data);
      if (this.users.getCountReadyUsers() >= 2) {
        this.chooseGameOption(socketId);
      }
    }
    if (actionType === CONSTANTS.STOP_GAME) {
      this.sendStopGame(null, data, true);
      this.game.stop();
    }
  }

  sendMessage(message, actionType, socket, socketEvent) {
    let data = message;
    const { name } = this.users.getUser(socket.id);
    if (actionType === CONSTANTS.BROADCAST_MSG) {
      data = [message, this.msgCount += 1];
      this.io.emit(socketEvent, name, data, actionType);
    } else if (
      actionType === CONSTANTS.BROADCAST_LIKE
      || actionType === CONSTANTS.BROADCAST_DISLIKE
    ) {
      socket.broadcast.emit(socketEvent, name, data, actionType);
    }
  }

  sendRole(user) {
    if (user.isReadyToGame) { this.io.to(user.socketId).emit('usersInfo', user.role, CONSTANTS.ROLE); }
  }

  sendWordToSelect(socketId) {
    this.io.to(socketId).emit('game', this.game.wordsToSelect, CONSTANTS.WORDS_TO_SELECT);
  }

  sendGameEvent(socketId = null, gameEvent) {
    if (!socketId) {
      this.sendDataInGameUsers('game', this.game.guessWord, gameEvent);
    } else this.io.to(socketId).emit('game', this.game.guessWord, gameEvent);
  }

  sendStopGame(winnerSocketId, guessWord, waitUsersFlag = false) {
    this.msgCount = 0;
    const data = waitUsersFlag
      ? {
        loading: waitUsersFlag,
      }
      : {
        winnerName: winnerSocketId ? this.users.getUser(winnerSocketId).name : undefined,
        guessWord,
      };
    this.sendDataInGameUsers('game', data, CONSTANTS.STOP_GAME);
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

  sendDataInGameUsers(socketEvent, data, actionType) {
    this.users.getUser('All').forEach((user) => {
      if (user.isReadyToGame) this.io.to(user.socketId).emit(socketEvent, data, actionType);
    });
  }
}

module.exports = new SocketController();
