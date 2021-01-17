const User = require('./User');

class Users {
  constructor() {
    this.exPainters = new Map();
    this.guessers = new Map();
    this.allUsers = new Map(); // ключ socketId
  }

  getUserName(socketId) {
    return this.allUsers.get(socketId);
  }

  addUser(name, socketId) {
    const user = new User(name, socketId);
    this.allUsers.set(socketId, user);
  }

  deleteUser(name) {
    this.allUsers.delete(name);
    this.exPainters.delete(name);
    this.guessers.delete(name);
  }

  getNumberUsers() {
    return this.allUsers.size;
  }

  getPainter() {
    let findPainterFlag = false;
    this.allUsers.forEach((objUser, key) => {
      if (!this.exPainters.has(key) && !findPainterFlag) {
        this.painter = objUser;
        this.exPainters.set(objUser);
        findPainterFlag = true;
      }
    });
    if (!findPainterFlag) {
      this.removeExPainters();
      this.getPainter();
    }
    return this.painter;
  }

  removeExPainters() {
    this.exPainters.clear();
  }

  getGuessers() {
    const guessers = Users.getDifferenceUsers(this.allUsers, this.painter);
    return Array.from(guessers, (guesser) => Object.fromEntries([guesser]));
  }

  static getDifferenceUsers(allUsers, users) {
    const difference = new Map(allUsers);
    difference.delete(users.socketId);
    return difference;
  }

  getUsersRole(newGameFlag) {
    const usersRole = {
      painter: newGameFlag ? this.getPainter() : this.painter,
      guessers: this.getGuessers(),
    };
    return usersRole;
  }
}

module.exports = Users;
