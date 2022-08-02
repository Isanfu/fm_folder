// const note = require('./noteUtils')


// // note.saveNote('ab','## a \n' + 
// // 'as')

// d.fileTable
const moment = require('moment')

const curr_time = moment(Date.now()).format('YYYY-MM-DD hh:mm')

console.log(curr_time);



// const DBInstance = require('../global/dbInstance')

// const db = DBInstance.getDB()


// // const d1 = db.getDB()

// const dbItem = db.prepare('INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?)')

// dbItem.run('md4','filename','fileExtname','fileSize','filePath','modifyTime','createTime','sanfu','userIp')

