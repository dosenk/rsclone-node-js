const server = require('http');
const io = require('socket.io');
const CONSTANTS = require('../constants/constants');

class SocketController {
  constructor(server, url) {
    this.server = server;
    this.url = url;
    this.users = new Map();
    this.painter = {
      id: null,
      name: null,
    };
    this.guessers = [];
    this.gameDrawInfo = {
      drawColor: 'black',
      drawThickness: 1,
    };
    this.appointedPainter = false;
    this.gameStarted = false;
    this.guessWord = 'qwe';
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
      // const ip = socket.conn.remoteAddress;
      // console.log(`client ip: ${ip}`);

      socket.on('broadcast', (word) => {
        const senderName = this.users.get(socket.id);
        this.io.emit('broadcast', senderName, word);
        this.checkAnswer(word, senderName);
      });

      socket.on('usersInfo', (info, actionType) => {
        if (actionType === CONSTANTS.NAME) {
          const name = info;
          const socketId = socket.id;
          this.setUserName(socketId, name);
          if (!this.appointedPainter) this.setPainter(socketId, name);
          else this.setGuesser(socketId, name);
          // отправляет новому клиенту в игре всех пользователей в игре
          this.io.emit('usersInfo', this.getUsers(), CONSTANTS.USERS);
          // отправляет новому клиенту в игре параметры рисования
          this.sendDrawInfo('draw');
          this.startGame();
        }
      });

      socket.on('draw', (info, actionType) => {
        this.setDrawInfo(actionType, info);
        socket.broadcast.emit('draw', info, actionType);
      });

      socket.on('disconnect', () => {
        console.log(socket.id, ' - disconnected');
        this.deleteUser(socket.id);
        this.io.emit('usersInfo', this.getUsers(), CONSTANTS.USERS);
      });
    });
  }

  startGame() {
    // console.log(this.painter + ' painter /n', this.guessers + ' - guessers /n', this.users.size);
    if (this.users.size >= 2) {
      // установить флаг, что игра началась
      this.gameStarted = true;
      // отправить роли игрокам: painter, guesser
      this.io.to(this.painter.id).emit('usersInfo', CONSTANTS.ROLE_PAINTER, CONSTANTS.ROLE);
      this.guessers.forEach((guesser) => {
        this.io.to(guesser.id).emit('usersInfo', CONSTANTS.ROLE_GUESSER, CONSTANTS.ROLE);
      });
      // отправляем в сокет загаданное слово с флагом: START_GAME
      this.io.emit('game', this.guessWord, CONSTANTS.START_GAME);
    } else if (this.gameStarted) {
      // если игра идет, то каждый, кто подключается становиться guesser
      const lastGuessor = this.guessers[this.guessers.length - 1];
      this.io.to(lastGuessor.id).emit('usersInfo', CONSTANTS.ROLE_GUESSER, CONSTANTS.ROLE);
    }
  }

  stopGame() {
    this.gameStarted = false;
    this.deleteUser(this.painter.id);
    this.guessers.forEach((guesser) => {
      this.deleteUser(guesser.id);
    });
  }

  checkAnswer(word, senderName) {
    if (word === this.guessWord) {
      const info = {
        word,
        senderName,
      };
      this.io.emit('game', info, CONSTANTS.STOP_GAME);
      this.stopGame();
    }
  }

  setUserName(socketId, name) {
    this.users.set(socketId, name);
    this.io.to(socketId).emit('usersInfo', name, CONSTANTS.NAME);
  }

  setPainter(socketId, name) {
    this.setDefaultDrawInfo(); // для новых painter устанавить параметры по умолчанию
    this.painter = {
      id: socketId,
      name,
    };
    this.appointedPainter = true;
  }

  setGuesser(socketId, name) {
    const guesser = {
      id: socketId,
      name,
    };
    this.guessers.push(guesser);
  }

  getUsers() {
    return { painter: this.painter, guesser: this.guessers };
  }

  deleteUser(socketId) {
    this.users.delete(socketId);
    if (this.painter.id === socketId) {
      this.painter.id = null;
      this.painter.name = null;
      this.appointedPainter = false;
      this.gameStarted = false;
    }
    this.guessers = this.guessers.filter((guesser) => guesser.id !== socketId);
  }

  setDrawInfo(actionType, info) {
    if (actionType === CONSTANTS.DRAW_THICKNESS) this.gameDrawInfo.drawThickness = info;
    if (actionType === CONSTANTS.DRAW_COLOR) this.gameDrawInfo.drawColor = info;
  }

  setDefaultDrawInfo() {
    this.gameDrawInfo.drawColor = 'black';
    this.gameDrawInfo.drawThickness = 1;
  }

  sendDrawInfo(socketEvent) {
    this.io.emit(socketEvent, this.gameDrawInfo.drawColor, CONSTANTS.DRAW_COLOR);
    this.io.emit(socketEvent, this.gameDrawInfo.drawThickness, CONSTANTS.DRAW_THICKNESS);
  }
}

module.exports = new SocketController(server, CONSTANTS);
