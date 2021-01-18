const db = require('../../db/db');
const Users = require('./Users');
const CONSTANTS = require('../../constants/constants');

class Game {
  constructor(gameCount) {
    this.users = new Users();
    this.gameStarted = false;
    this.gameDrawInfo = {
      drawColor: 'black',
      drawThickness: 1,
    };
    this.gameCount = gameCount;
    this.guessWord = '';
  }

  addUser(name, socketId) {
    this.users.addUser(name, socketId);
  }

  getGameStatus() {
    return this.gameStarted;
  }

  getCountUsers() {
    return this.users.getCountUsers();
  }

  getState(socketId) {
    const user = this.user.getUser(socketId);
    return {
      actionTypes: [CONSTANTS.ROLE,
        CONSTANTS.USERS,
        CONSTANTS.WORD_TO_GUESS,
        CONSTANTS.DRAW_COLOR,
        CONSTANTS.DRAW_THICKNESS],
      broadcast: false,
      user,
      users: this.users.getUsersRole(),
      word: this.guessWord,
      gameDrawInfo: this.gameDrawInfo,
    };
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
        if (this.users.getCountUsers() >= 2) {
          if (!this.gameStarted) {
            this.gameStarted = true;
            this.users.setUsersRole();
            state = await this.sendWordsToSelect();
          } else {
            state = this.updateGameUsers();
          }
        }
        break;
      case CONSTANTS.START_GAME:
        state = this.updateGame();
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

  async sendWordsToSelect() {
    this.gameStarted = true;
    this.setDefaultDrawInfo();
    const words = await this.getWords();
    return {
      actionTypes: [CONSTANTS.WORDS_TO_SELECT],
      words,
    };
  }

  updateGameUsers() {
    return {
      actionTypes: [
        CONSTANTS.USERS,
      ],
      gameDrawInfo: this.gameDrawInfo,
      users: this.users.getUsersRole(),
    };
  }

  sendGameInfoLastUser(user) {
    return {
      actionTypes: [
        CONSTANTS.DRAW_COLOR,
        CONSTANTS.DRAW_THICKNESS,
        CONSTANTS.ROLE,
      ],
      gameDrawInfo: this.gameDrawInfo,
      user,
    };
  }

  setDrawInfo(actionType, info) {
    if (actionType === CONSTANTS.DRAW_THICKNESS) this.gameDrawInfo.drawThickness = info;
    if (actionType === CONSTANTS.DRAW_COLOR) this.gameDrawInfo.drawColor = info;
  }

  async getWords() {
    const idWords = [1, 2, 3].map((id) => id + (this.gameCount * 3));
    this.gameCount += 1;
    const words = await db.query('SELECT word FROM words WHERE id IN ($1, $2, $3)', idWords);
    return words.rows.map((wordObj) => wordObj.word);
  }

  getUserName(socketid) {
    return this.users.getUser(socketid).name;
  }

  getUserRole(socketid) {
    return this.users.getUser(socketid).role;
  }

  setDefaultDrawInfo() {
    this.gameDrawInfo.drawColor = 'black';
    this.gameDrawInfo.drawThickness = 1;
  }

  setGameWord(word) {
    this.guessWord = word;
  }

  updateUsersRole() {

  }
}

module.exports = Game;
