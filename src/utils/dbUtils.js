const fs = require('fs');
const netUtils = require('./netUtils')
const sqlite3 = require('sqlite3').verbose()
const userConfig = require('../config/userConfig')
const path = require('path')


//数据库名字位置
const dbFile = userConfig.fileListDbPath
console.log(dbFile);

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
            console.log('aaaa');
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
            + 'modifyTime INT(20),'
            + 'createTime INT(20),'
            + 'userId CHAR(20),'
            + 'ip CHAR(15),'
            + 'isDir INT(1),'
            + 'md5 VARCHAR(127));'
         //用户表创建sql语句
         const createUserTable = 'CREATE TABLE user(id CHAR(20) PRIMARY KEY,'
            + 'username VARCHAR(32), '
            + 'password VARCHAR(32),'
            + 'avatar VARCHAR(255),'
            + 'ip CHAR(20),'
            + 'modifyTime INT(20),'
            + 'createTime INT(20));'
         //分享表创建sql语句
         const createShareFileListTable = 'CREATE TABLE file_share(id CHAR(20) PRIMARY KEY,'
            + 'fileId CHAR(20),'
            + 'userId CHAR(20),'
            + 'createTime INT(20),'
            + 'shareNum INT(6),'
            + 'netPath TEXT,'
            + 'isDir INT(1));'

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
                  db.run(createShareFileListTable, err => {
                     if (err) throw err
                     db.run('CREATE UNIQUE INDEX idx_fileId ON file_share(fileId);')
                     callback(db)
                  })
               } else
                  console.log('table existed');

               console.log(row['count(*)']);
            })
         
         })
      })
   }
}


//文件插入
const insertFileObjToDB = (user,fileObjArr,currUrl) => {
   createDB(db => {
      db.serialize(() => {
         const createTime = Date.now()
         const modifyTime = createTime
         const ip = netUtils.getIpAddress().address
         db.run('BEGIN TRANSACTION;', () => { });
         const stmt = db.prepare("INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);")

         fileObjArr.forEach(item => {
            //插入到当前路径
            if(item.parentId == '0')
                  item.parentId = currUrl.key
            const netPath = item.relativePath.replace('.'+path.sep, currUrl.netPath)
            stmt.run(item.id, item.parentId, item.name, item.type, item.extname, item.size, item.absPath,
               item.relativePath, netPath, modifyTime, createTime, user.id, ip, item.isDir, item.md5)
         });
         stmt.finalize()
         db.run('COMMIT')

      })
      db.close()

   })
}


module.exports = {
   createDB,
   insertFileObjToDB
}
