const db = require('../db/db');

class StatsController {
  static async getUserStats(req, res) {
    const { name } = req.query;
    const user = await db.query('SELECT id, datetime FROM users WHERE login = $1', [name]);
    const userStats = await db.query('SELECT draw_words_num as dw, guess_words_num as gw, game_count as gc FROM stats WHERE users_id = $1', [user.rows[0].id]);
    const dayInGame = Math.round(
      (new Date() - new Date(user.rows[0].datetime)) / (60 * 60 * 24 * 1000),
    );
    res.json({
      dayInGame,
      drawWordsNum: userStats.rows[0].dw,
      guessWordsNum: userStats.rows[0].gw,
      gameCount: userStats.rows[0].gc,
    });
  }

  static async setUserStats(req, res) {
    const {
      name, drawWordNum, guessWordNum, gameCount,
    } = req.body;
    const user = await db.query('SELECT id FROM users WHERE login = $1', [name]);
    const userStats = await db.query('UPDATE stats SET draw_words_num = $1, guess_words_num = $2, game_count = $3, date_time = now() WHERE users_id = $4 RETURNING *',
      [drawWordNum, guessWordNum, gameCount, user.rows[0].id]);
    if (userStats.rows.length > 0) res.json('success');
    else res.json('error');
  }
}

module.exports = StatsController;
