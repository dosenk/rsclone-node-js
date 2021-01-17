const { threadId } = require('worker_threads');
const db = require('../../db/db');
const Users = require('./Users');
const CONSTANTS = require('../../constants/constants');

class Game {
  constructor(gameCount) {
    this.users = new Users();
    this.gameStarted = false;
    this.gameStop = true;
    this.gameDrawInfo = {
      drawColor: 'black',
      drawThickness: 1,
    };
    this.appointedPainter = false;
    this.gameCount = gameCount;
    this.guessWord = '';
  }

  async getGameState(actionType, data) {
    let state;
    // 1. if min 2 user in game - start game
    // 2. send all users: role, users, gameInfo(drawThickness, drawColor)
    // 3. send painter word, send to sockeEvent('game') - CONSTANTS.START_GAME)
    // 4. if new user added - connect to existing game
    switch (actionType) {
      case CONSTANTS.NAME:
        this.users.addUser(data.name, data.socketId);
        if (this.canStartGame()) state = await this.startGame();
        if (this.gameStarted) state = this.updateGame();
        break;
      case CONSTANTS.DELETE_USERS:
        this.users.deleteUser(data);
        if (this.gameStarted) state = this.updateGame();
        break;
      default:
        break;
    }

    return state;
  }

  setGameWord(word) {
    this.guessWord = word;
  }

  setDrawInfo(actionType, info) {
    if (actionType === CONSTANTS.DRAW_THICKNESS) this.gameDrawInfo.drawThickness = info;
    if (actionType === CONSTANTS.DRAW_COLOR) this.gameDrawInfo.drawColor = info;
  }

  async getWords() {
    const idWords = [1, 2, 3].map((id, idx) => idx + (this.gameCount * 3));
    const words = await db.query('SELECT word FROM words WHERE id IN ($1, $2, $3)', idWords);
    this.guessWords = words.rows;
  }

  canStartGame() {
    return this.users.getNumberUsers() >= 2 && !this.gameStarted;
  }

  async startGame() {
    this.gameStarted = true;
    this.setDefaultDrawInfo();
    const words = await this.getWords();
    return {
      actionTypes: [
        CONSTANTS.WORD,
        CONSTANTS.USERS,
        CONSTANTS.DRAW_COLOR,
        CONSTANTS.DRAW_THICKNESS,
      ],

      words,
      users: this.users.getUsersRole(true),
    };
  }

  updateGame() {
    const newGameFlag = false;
    return {
      actionTypes: [
        CONSTANTS.USERS,
        CONSTANTS.DRAW_COLOR,
        CONSTANTS.DRAW_THICKNESS,
      ],
      gameDrawInfo: this.gameDrawInfo,
      users: this.users.getUsersRole(newGameFlag),
    };
  }

  getUserName(socketid) {
    return this.users.getUserName(socketid);
  }

  setDefaultDrawInfo() {
    this.gameDrawInfo.drawColor = 'black';
    this.gameDrawInfo.drawThickness = 1;
  }

  updateUsersRole() {

  }
}

module.exports = Game;
