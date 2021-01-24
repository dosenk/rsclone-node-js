const db = require('../../db/db');
const statsController = require('../stats.controller');
const CONSTANTS = require('../../constants/constants');

class Game {
  constructor(gameCount, users) {
    this.users = users;
    this.isGameStarted = false;
    this.drawInfo = {
      drawColor: 'black',
      drawThickness: 1,
    };
    this.gameCount = gameCount;
    this.guessWord = '';
  }

  async start() {
    this.isGameStarted = true;
    this.users.setRoles();
    await this.getWords();
  }

  async stop() {
    this.isGameStarted = false;
    this.users.setDefaultGameStatus();
  }

  setUserInfo(name, socketId) {
    this.users.addUser(name, socketId);
    if (this.users.size >= 2 && !this.gameStarted) {
      this.gameStarted = true;
      this.users.setUsersRole();
    }
  }

  setDefaultDrawInfo() {
    this.drawInfo.drawColor = 'black';
    this.drawInfo.drawThickness = 1;
  }

  setDrawInfo(actionType, info) {
    if (actionType === CONSTANTS.DRAW_THICKNESS) this.drawInfo.drawThickness = info;
    if (actionType === CONSTANTS.DRAW_COLOR) this.drawInfo.drawColor = info;
  }

  getDrawInfo() {
    return this.drawInfo;
  }

  async getWords() {
    this.guessWord = '';
    const idWords = [1, 2, 3].map((id) => id + (this.gameCount * 3));
    this.gameCount += 1;
    const words = await db.query('SELECT word FROM words WHERE id IN ($1, $2, $3)', idWords);
    this.wordsToSelect = words.rows.map((wordObj) => wordObj.word);
  }

  checkGuessWord(word) {
    return this.guessWord.toLowerCase() === word.toLowerCase();
  }

  setGameWord(word) {
    this.guessWord = word;
  }

  getIsGameStarted() {
    return this.isGameStarted;
  }

  getGuessWord() {
    return this.guessWord;
  }
}

module.exports = Game;
