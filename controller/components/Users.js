const User = require('./User');
const CONSTANTS = require('../../constants/constants');

class Users {
  constructor() {
    this.allUsers = new Map(); // ключ socketId
  }

  addUser(name, socketId) {
    const user = new User(name, socketId);
    this.allUsers.set(socketId, user);
  }

  getUser(socketId) {
    return this.allUsers.get(socketId);
  }

  deleteUser(socketId) {
    this.allUsers.delete(socketId);
  }

  setUsersRole() {
    let isSetPainter = false;
    this.allUsers.forEach((user) => {
      // если был painter, то становится guesser
      if (user.role === CONSTANTS.ROLE_PAINTER) user.setRole(CONSTANTS.ROLE_GUESSER);
      // если не был painter и пока painter не найден
      if (!user.exPainterFlag && !isSetPainter) {
        isSetPainter = true;
        user.setRole(CONSTANTS.ROLE_PAINTER);
      }
    });
    // если painter не найден, то делаем всех игроков guesser и устанавливаем роли еще раз
    if (!isSetPainter) {
      this.setUsersDefaultRole();
      this.setUsersRole();
    }
  }

  setUsersDefaultRole() {
    this.allUsers.forEach((user) => {
      const nUser = user;
      nUser.setRole(CONSTANTS.ROLE_GUESSER);
      nUser.exPainterFlag = false;
    });
  }

  getCountUsers() {
    return this.allUsers.size;
  }

  getUsersRole() {
    let painter;
    const guessers = [];
    this.allUsers.forEach((user) => {
      if (user.role === CONSTANTS.ROLE_PAINTER) painter = user.getUser();
      if (user.role === CONSTANTS.ROLE_GUESSER) guessers.push(user.getUser());
    });
    return {
      painter,
      guessers,
    };
  }
}

module.exports = Users;
