const userConfig = require('./userConfig')
const sqlite3 = require('sqlite3').verbose()

exports.db = new sqlite3.Database(userConfig.fileListDbPath)