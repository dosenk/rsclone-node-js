const db = require('../db/db');

class UserController {
    async createUser(req, res) {
        const { login, password } = req.body;
        const newUser = await db.query(`INSERT INTO users (login, password, datetime) values ($1, $2, now()) RETURNING *`, [login, password]);

        res.json(newUser.rows[0]);
    }

    async getUsers(req, res) {
        const newUser = await db.query(`SELECT * FROM users`);
        console.log(newUser);
        res.json(newUser.rows);
    }

    async getOneUser(req, res) {
        const id = req.params.id;
        const user = await db.query('SELECT * FROM users where id = $1', [id]);
        res.json(user.rows[0]);
    }

    async updateUser(req, res) {
        const { id, login, password } = req.body;
        const user = await db.query('UPDATE users SET login = $1, password = $2, datetime = now() WHERE id = $3 RETURNING *', [login, password, id]);
        res.json(user.rows[0]);
    }

    async deleteUser(req, res) {
        const id = req.params.id;
        const user = await db.query('DELETE FROM users where id = $1', [id]);
        res.json(user.rows[0]);
    }
}

module.exports = new UserController()