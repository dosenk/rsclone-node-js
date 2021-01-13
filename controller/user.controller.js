const db = require('../db/db');

class UserController {
    async createUser(req, res) {
        const { login, password } = req.body;
        const user = await db.query(`SELECT login, password FROM users WHERE login = $1`, [login]);
        if (user.rows.length === 0) {
            const newUser = await db.query(`INSERT INTO users (login, password, datetime) values ($1, $2, now()) RETURNING *`, [login, password]);
            res.json('success');
        } else {
            res.json('login_exists');
        }
    }

    async getUsers(req, res) {
        const newUser = await db.query(`SELECT * FROM users`);
        res.json(newUser.rows);
    }

    async checkUserPass(req, res) {
        try {
            const { login, password } = req.body;
            const user = await db.query(`SELECT login, password FROM users WHERE login = $1`, [login]);
            if (user.rows.length >= 1 && user.rows[0].password.trim() === password) {
                res.json('good');
            } else {
                res.json('bad');
            }
        } catch (error) {
            console.log(error);
        }
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