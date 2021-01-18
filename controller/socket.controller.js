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
        // this.checkAnswer(word, senderName);
      });

      socket.on('usersInfo', (data, actionType) => {
        this.game.addUser(data, socketId);
        
          // this.checkUserInfoEvent(actionType, data, socket.id);
      });

      socket.on('game', (data, actionType) => {

          // this.checkGameEvent(actionType, data, socket.id);
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


  async checkUserInfoEvent(actionType, data, socketId) {
    if (actionType === CONSTANTS.NAME) {
        // 1. Добавляет пользователя
        // 2. Проверяет сколько уже в игре. Если > 2:
        //     - this.gameStarted = true;
        //     - устанавливает роли
        //     - получает из БД 3 слова и отправляет их Painter
        // 3. Дальше смотрит, если игра идет (this.gameStarted = true), то отправляет этому пользователю данные по игре (ROLE, USERS, DRAW, WORD_TO_GUESS, START_GAME)
        this.game.addUser(data, socketId);
        let gameState;
        if (this.game.countUser() >= 2) {
          gameState = this.game.
        }
        if (this.game.getGameStatus()) {
          gameState = this.game.getState(socketId);
          gameState.actionTypes.forEach((stateActionType) => {
            this.doAction(stateActionType, gameState);
          });
        }
      }
      if (actionType === CONSTANTS.ROLE) {
        // сюда отправляем роли
        // sendUsersRole(); каждому лично отправляем
      }
       if (actionType ===CONSTANTS.USERS) {
        // сюда отправляем всех пользователей в игре {painter:{}, guessers:[]}
        // sendUsers(); всегда всем отправляем
       } 
    
  }

  checkGameEvent(actionType, data, socketId) {
    switch (actionType) {
      case CONSTANTS.WORDS_TO_SELECT:
        // сюда отправляем три слова для выбора [1, 2, 3];
        break;
      case CONSTANTS.WORD_TO_GUESS:
        // сюда получаем выбранное painter слово и пишем его в this.guessWord
        break;
      case CONSTANTS.START_GAME:
        // сюда шлем флаг начала игры + данные {word: 'word_to_guess'}
        break;
      case CONSTANTS.STOP_GAME:
        // сюда шлем данные об окончании игры = {winner: {objectUser}}
        break;

    //       const state = await this.game.getGameState(actionType, data);
    // if (state !== undefined) {
    //   state.actionTypes.forEach((stateActionType) => {
    //     this.doAction(stateActionType, state);
    //   });
    // }
      default:
        break;
    }
  }

  sendWords(state, actionType) {
    const { socketId } = state.users.painter;
    const { words } = state;
    this.io.to(socketId).emit('game', words, actionType);
  }

  sendWord(state, actionType) {
    const { socketId } = state.user;
    const { word } = state;
    this.io.to(socketId).emit('game', word, actionType);
  }

  sendUsers(state) {
    const { users } = state;
    this.io.emit('usersInfo', users, CONSTANTS.USERS);
  }

   sendRole(state) {
    if (state.broadcast) {
      const { users } = state;
      this.io.to(users.painter.socketId).emit('usersInfo', users.painter.role, CONSTANTS.ROLE);
      users.guessers.forEach((guesser) => {
        this.io.to(guesser.socketId).emit('usersInfo', guesser.role, CONSTANTS.ROLE);
      })
    } else {
      this.io.to(state.user.socketId).emit('usersInfo', state.user.role, CONSTANTS.ROLE);
    }
  }

  sendDrawInfo(state) {
    const { gameDrawInfo } = state;
    this.io.emit('draw', gameDrawInfo.drawColor, CONSTANTS.DRAW_COLOR);
    this.io.emit('draw', gameDrawInfo.drawThickness, CONSTANTS.DRAW_THICKNESS);
  }

  doAction(actionType, state) {
    switch (actionType) {
      case CONSTANTS.WORDS_TO_SELECT:
        this.sendWords(state, actionType);
        break;
      case CONSTANTS.WORD_TO_GUESS:
        this.sendWord(state, actionType);
        break;
      case CONSTANTS.ROLE:
        this.sendRole(state);
        break;
      case CONSTANTS.USERS:
      case CONSTANTS.DELETE_USERS:
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
