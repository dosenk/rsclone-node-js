const CONSTANTS = require('../../constants/constants');

class User {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.isWasPainter = false;
    this.isReadyToGame = false;
    this.role = CONSTANTS.ROLE_GUESSER;
  }

  setRole(role) {
    this.role = role;
    if (role === CONSTANTS.ROLE_PAINTER) {
      this.isWasPainter = true;
    }
  }

  getUser() {
    return {
      name: this.name,
      socketId: this.socketId,
      role: this.role,
    };
  }
}

module.exports = User;
