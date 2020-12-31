const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'rzzxlumzbkvnyv',
    password: '822f994c6fb9ae5146f9a57714028d3d3b5a0367da15524eaafd486aedac5d06',
    host: process.env.DATABASE_URL,
    port: 5432,
    database: 'd3rt1htds93egi',
    ssl: false
})

module.exports = pool;