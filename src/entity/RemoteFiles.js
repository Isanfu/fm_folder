const { rdb } = require('../dbInstance/remoteFileListInstance')
const netUtils = require('../utils/netUtils')
const FlakeId = require('flake-idgen')
const intformat = require('biguint-format')
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });
const logger = require('electron-log')
class RemoteFiles {
   /**
    * 广播数据接收解析及并行插入
    * @param  queueItem 
    */
   paraInsertToDb(queueItem) {
      logger.info(`paraInsertToDb: receive broadcast and insert to table(remote_file_share)`)
      rdb.parallelize(() => {
         rdb.run('BEGIN TRANSACTION;', () => { });
         const stmt = rdb.prepare('INSERT OR IGNORE INTO remote_file_share VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
         const tm = queueItem.msg.fileList
         tm.forEach(item => {
            stmt.run(intformat(flakeIdGen.next(), 'dec'), item.fileId,
               item.filename, item.fileSize, item.filetype, queueItem.msg.userInfo.id,
               queueItem.msg.userInfo.name, item.isDir, item.absPath, item.netPath, item.shareNum, queueItem.rinfo.address,
               queueItem.rinfo.port, queueItem.msg.createTime)
         });
         stmt.finalize()
         rdb.run('COMMIT')
      })
   }
   /**
    * 删除相关用户的共享数据
    * @param {*} userId 
    * @param {*} callback 
    */
   deleteColOnUserId(userId,callback = null){
      const stmt = rdb.prepare('DELETE FROM remote_file_share WHERE userId = ? AND shareNum = 0')
      stmt.run(userId,err=>{
         try {
            if(err) throw err
         } catch (error) {
            logger.error('faild to deleteColOnIp; caused by: ',error)
         }
      },callback)
   }
   /**
    * 下线删除相关ip的共享数据
    * @param {*} ip 
    */
   deleteColOnIp(ip){
      const stmt = rdb.prepare('DELETE FROM remote_file_share WHERE ip = ?')
      stmt.run(ip,err=>{
         try {
            if(err) throw err
         } catch (error) {
            logger.error('faild to deleteColOnIp; caused by: ',error)
         }
      })
   }

   /** 
   * 清空remote_file_share表
   */
   clearTable() {
      logger.info('clear table(remote_file_share)')
      rdb.run('DELETE FROM remote_file_share;')
   }

}

module.exports = RemoteFiles