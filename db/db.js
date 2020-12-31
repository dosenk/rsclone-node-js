const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'rzzxlumzbkvnyv',
    password: '822f994c6fb9ae5146f9a57714028d3d3b5a0367da15524eaafd486aedac5d06',
    host: 'postgres://rzzxlumzbkvnyv:822f994c6fb9ae5146f9a57714028d3d3b5a0367da15524eaafd486aedac5d06@ec2-176-34-114-78.eu-west-1.compute.amazonaws.com:5432/d3rt1htds93egi',
    port: 5432,
    database: 'd3rt1htds93egi',
    ssl: false
})

module.exports = pool;