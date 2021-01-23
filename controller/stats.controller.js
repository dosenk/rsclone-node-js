const db = require('../db/db');

class StatsController {
  static async getUserStats(req, res) {
    const { name } = req.query;
    const userId = await db.query('SELECT id FROM users WHERE login = $1', [name]);
    const userStats = await db.query('SELECT draw_words_num, guess_words_num, game_count FROM stats WHERE users_id = $1', [userId.rows[0].id]);
    res.json(userStats.rows[0]);
  }

  static async setUserStats(req, res) {
    const {
      name, drawWordNum, guessWordNum, gameCount,
    } = req.body;
    const userId = await db.query('SELECT id FROM users WHERE login = $1', [name]);
    const userStats = await db.query('UPDATE stats SET draw_words_num = $1, guess_words_num = $2, game_count = $3, date_time = now() WHERE users_id = $4 RETURNING *',
      [drawWordNum, guessWordNum, gameCount, userId.rows[0].id]);
    if (userStats.rows.length > 0) res.json('success');
    else res.json('error');
  }
}

module.exports = StatsController;
