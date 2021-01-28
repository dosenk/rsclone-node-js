const db = require('../db/db');

class UserController {
  static async createUser(req, res) {
    const {
      login, password, sex, country,
    } = req.body;
    const user = await db.query('SELECT login, password FROM users WHERE login = $1', [login]);
    if (user.rows.length === 0) {
      await db.query(
        'INSERT INTO users (login, password, sex, country, create_date) values ($1, $2, $3, $4, now()) RETURNING *', [login, password, sex, country],
      );
      res.json('success');
    } else {
      res.json('login_exists');
    }
  }

  static async getUsers(req, res) {
    const newUser = await db.query('SELECT * FROM users');
    res.json(newUser.rows);
  }

  static async checkUserPass(req, res) {
    try {
      const { login, password } = req.body;
      const user = await db.query('SELECT login, password FROM users WHERE login = $1', [login]);
      if (user.rows.length >= 1 && user.rows[0].password.trim() === password) {
        res.json('good');
      } else {
        res.json('bad');
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async getOneUser(req, res) {
    const { name } = req.params;
    const user = await db.query('SELECT * FROM users where login = $1', [name]);
    res.json(user.rows[0]);
  }

  static async updateUserPass(req, res) {
    const { login, password } = req.body;
    const user = await db.query('UPDATE users SET password = $2, datetime = now() WHERE login = $1 RETURNING *', [login, password]);
    res.json(user.rows[0]);
  }

  static async deleteUser(req, res) {
    const { id } = req.params;
    const user = await db.query('DELETE FROM users where id = $1', [id]);
    res.json(user.rows[0]);
  }
}

module.exports = UserController;
