require('dotenv').config();
const mongosse = require('mongoose')
const connect_string = process.env.connect_string

const connectDb = async() => {
    await mongosse.connect(connect_string)
    return console.log("DB connected")
}

module.exports = connectDb