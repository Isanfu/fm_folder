const { db } = require('../dbInstance/fileListInstance')
/**
 * 本地文件数据库
 */
class FileList {
   //建表
   init() {
      //文件表创建sql语句
      const createFilesTable = 'CREATE TABLE IF NOT EXISTS local_files(id CHAR(20) PRIMARY KEY,'
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
      const createUserTable = 'CREATE TABLE IF NOT EXISTS user(id CHAR(20) PRIMARY KEY,'
         + 'username VARCHAR(32), '
         + 'password VARCHAR(32),'
         + 'avatar VARCHAR(255),'
         + 'ip CHAR(20),'
         + 'modifyTime INT(20),'
         + 'createTime INT(20));'
      //分享表创建sql语句
      const createShareFileListTable = 'CREATE TABLE IF NOT EXISTS file_share(id CHAR(20) PRIMARY KEY,'
         + 'fileId CHAR(20),'
         + 'userId CHAR(20),'
         + 'createTime INT(20),'
         + 'shareNum INT(8),'
         + 'netPath TEXT,'
         + 'isDir INT(1));'
   

      db.run(createFilesTable)
      db.run(createShareFileListTable)
      db.run(createUserTable)
   }
}

module.exports = FileList