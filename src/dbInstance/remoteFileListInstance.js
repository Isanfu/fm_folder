const userConfig = require('../config/userConfig')
const sqlite3 = require('sqlite3').verbose()

exports.rdb = new sqlite3.Database(userConfig.remoteFileListDbPath)