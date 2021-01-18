const CONSTANTS = require('../../constants/constants');

class User {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.exPainterFlag = false;
    this.role = CONSTANTS.ROLE_GUESSER;
  }

  setRole(role) {
    this.role = role;
    if (role === CONSTANTS.ROLE_PAINTER) {
      this.exPainterFlag = true;
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
