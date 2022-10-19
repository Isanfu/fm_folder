const { rdb } = require('../dbInstance/remoteFileListInstance')

class RemoteFileList{
   init(){
      const createRemoteShareFileListTable = 'CREATE TABLE IF NOT EXISTS remote_file_share(id CHAR(20) PRIMARY KEY,'
      + 'fileId CHAR(20),'
      + 'filename VARCHAR(255),'
      + 'fileSize VARCHAR(64),'
      + 'filetype VARCHAR(30),'
      + 'userId CHAR(20),'
      + 'username VARCAHR(32),'
      + 'isDir INT(1),'
      + 'absPath TEXT,'
      + 'netPath TEXT,'
      + 'shareNum INT(8),'
      + 'ip CHAR(15),'
      + 'port INT(5),'
      + 'createTime INT(20));'
      rdb.run(createRemoteShareFileListTable,(err)=>{
         if(err) throw err
         rdb.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_rm ON remote_file_share(fileId, userId,shareNum)')
      })

   }
   
}

module.exports = RemoteFileList