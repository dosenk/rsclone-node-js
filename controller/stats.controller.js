const db = require('../db/db');

class StatsController {
  static async getUserStats(req, res) {
    const { name } = req.query;
    const userStats = await db.query('SELECT create_date, draw_words_num as dw, guess_words_num as gw, game_count as gc, rating as rt FROM users WHERE login = $1', [name]);
    const dayInGame = Math.round(
      (new Date() - new Date(userStats.rows[0].create_date)) / (60 * 60 * 24 * 1000),
    );
    res.json({
      dayInGame,
      drawWordsNum: userStats.rows[0].dw,
      guessWordsNum: userStats.rows[0].gw,
      gameCount: userStats.rows[0].gc,
      raiting: userStats.rows[0].rt,
    });
  }

  static async setUserStats(req, res) {
    const {
      name, drawWordNum, guessWordNum, gameCount,
    } = req.body;
    const rating = Math.round((drawWordNum * 10 + guessWordNum * 20) / gameCount);
    const userStats = await db.query('UPDATE users SET draw_words_num = $1, guess_words_num = $2, game_count = $3, rating = $4 WHERE login = $5 RETURNING *',
      [drawWordNum, guessWordNum, gameCount, rating, name]);
    if (userStats.rows.length > 0) res.json('success');
    else res.json('error');
  }

  static async getUsersRating(req, res) {
    const rating = await db.query('SELECT login, sex, country, rating FROM users ORDER BY rating DESC');
    // console.log(rating.rows);
    res.json(rating.rows);
  }
}

module.exports = StatsController;
