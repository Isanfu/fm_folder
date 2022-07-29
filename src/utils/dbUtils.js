const fs = require('fs');
const crypto = require('crypto');
const moment = require('moment')
const netUtils = require('./netUtils')
const path = require('path')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const sqlite3 = require('sqlite3').verbose()


//数据库名字位置
const dbFile = './fileList.db'

const createDB = (callback) => {
   try {
      fs.accessSync(dbFile)
      const d = new sqlite3.Database(dbFile, err => {
         if (err) {
            console.log('数据库错误');
            throw err
         }
         callback(d)
      })
   } catch (error) {
      const db = new sqlite3.Database(dbFile, err => {
         if (err) {
            console.log('数据库错误');
            throw err
         }
         //文件表创建sql语句
         const createFilesTable = 'CREATE TABLE local_files(id CHAR(20) PRIMARY KEY,'
            + 'parentId CHAR(20),'
            + 'filename VARCHAR(255),'
            + 'filetype VARCHAR(30),'
            + 'fileExtname CHAR(10),'
            + 'fileSize VARCHAR(64),'
            + 'absPath TEXT,'
            + 'relativePath TEXT,'
            + 'netPath TEXT,'
            + 'modifyTime VARCHAR(100),'
            + 'createTime VARCHAR(100),'
            + 'userId CHAR(20),'
            + 'ip CHAR(15),'
            + 'isDir INT(1),'
            + 'md5 VARCHAR(127));'
         //用户表创建sql语句
         const createUserTable = 'CREATE TABLE user(id CHAR(20) PRIMARY KEY, username VARCHAR(32), password VARCHAR(32),ip CHAR(20));'

         db.serialize(() => {

            const isExistTable = 'SELECT count(*) FROM sqlite_master WHERE type="table" AND name = "local_files" OR name = "user";'
            db.get(isExistTable, (err, row) => {
               if (err) throw err

               if (row['count(*)'] == 0) {
                  db.run(createUserTable, err => {
                     if (err) throw err
                     callback(db)
                  })
                  db.run(createFilesTable, err => {
                     if (err) throw err
                     callback(db)
                  })

               } else
                  console.log('table existed');

               console.log(row['count(*)']);
            })
            // const isExistUserTable = 'SELECT * FROM sqlite_master WHERE type="table" AND name = "user";'
            // db.get(isExistUserTable, (err, row) => {
            //    if (err) throw err
            //    if (typeof (row) == 'undefined') {
            //       db.run(createUserTable)
            //    }
            // })
         })
      })
   }
}



// createDB(db => {
//    const sql = "INSERT INTO user VALUES('22','das','asd','asdd')"
//    db.run(sql)
// })
//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress()
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });


//文件插入，手动开启事务优化插入速度
const insertFileObjToDB=(fileObjArr)=>{
   createDB(db=>{
      db.serialize(()=>{
         const userId = intformat(flakeIdGen.next(), 'dec')
         const createTime =  Date.now()
         const modifyTime = createTime
         const ip = realIp
         const baseUrl = netUtils.baseUrl('sanfu')  // 返回/user/c0a8299@sanfu/
         

         db.run('BEGIN TRANSACTION;',()=>{});
         //id, parentId, filename, filetype, fileExtname, fileSize, absPath, 
         //relativePath, netPath, modifyTime, createTime, userId, ip, isDir, md5
         const stmt = db.prepare("INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      
         fileObjArr.forEach(item => {
            const netPath = item.relativePath.replace('./',baseUrl)
            stmt.run(item.id,item.parentId,item.name,'doc',item.extname,item.size,item.absPath,
                     item.relativePath,netPath,modifyTime,createTime,userId,ip,item.isDir,item.md5)
         });
         stmt.finalize()
         db.run('COMMIT')
         
      })
   })
}
// const fileA = [{
//    id: '6958590011109388288',
//    name: 'a0 3.txt',
//    extname: '.txt',
//    absPath: '/Users/sanfu/Downloads/d1',
//    relativePath: './d1',
//    isDir: 0,
//    parentId: '6958590011105193984',
//    md5: 'c469e705e31a5cc67d2204fdc5634a2f',
//    size: 15
//  }]

//  insertFileObjToDB(fileA)



module.exports = {
   insertFileObjToDB
}
