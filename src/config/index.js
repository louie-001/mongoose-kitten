require('dotenv').config()

const port = process.env.SERVER_PORT
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dataBase: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
}

module.exports = {
    port,
    dbConfig
}
