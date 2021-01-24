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
    return socketId !== 'All' ? this.allUsers.get(socketId) : this.allUsers;
  }

  deleteUser(socketId) {
    this.allUsers.delete(socketId);
  }

  setReadyToGameFlag(socketId, flag) {
    const user = this.getUser(socketId);
    user.isReadyToGame = flag;
  }

  setRoles() {
    let isSetPainter = false;
    this.allUsers.forEach((user) => {
      user.setRole(CONSTANTS.ROLE_GUESSER);
      if (user.isReadyToGame) {
        if (!user.isWasPainter && !isSetPainter) {
          isSetPainter = true;
          user.setRole(CONSTANTS.ROLE_PAINTER);
        }
      }
    });
    // если painter не найден, то делаем всех игроков guesser и устанавливаем роли еще раз
    if (!isSetPainter) {
      this.setDefaultRole();
      this.setRoles();
    }
  }

  setDefaultRole() {
    this.allUsers.forEach((user) => {
      const currentUser = user;
      currentUser.setRole(CONSTANTS.ROLE_GUESSER);
      currentUser.isWasPainter = false;
    });
  }

  setDefaultGameStatus() {
    this.allUsers.forEach((user) => {
      const currentUser = user;
      currentUser.isReadyToGame = false;
    });
  }

  getPainter() {
    let painterName;
    this.allUsers.forEach((user) => {
      painterName = user.role === CONSTANTS.ROLE_PAINTER
        ? user.getUser()
        : undefined;
    });
    return painterName;
  }

  getRoles() {
    let painter;
    const guessers = [];
    this.allUsers.forEach((user) => {
      if (user.isReadyToGame) {
        if (user.role === CONSTANTS.ROLE_PAINTER) painter = user.getUser();
        if (user.role === CONSTANTS.ROLE_GUESSER) guessers.push(user.getUser());
      }
    });
    return {
      painter,
      guessers,
    };
  }

  getCountUsers() {
    return this.allUsers.size;
  }

  getCountReadyUsers() {
    return [...this.allUsers].filter((user) => user[1].isReadyToGame).length;
  }
}

module.exports = Users;
