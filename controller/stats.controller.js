const db = require('../db/db');

class StatsController {
  static async getUserStats(req, res) {
    const { name } = req.params;
  }
}

module.exports = StatsController;
