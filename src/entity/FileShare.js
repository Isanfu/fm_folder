const { db } = require('../dbInstance/fileListInstance')
const netUtils = require('../utils/netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });
const logger = require('electron-log')

class FileShare {
   /**
    * 插入文件对象数组到文件分享表
    * @param fileObjArr 文件对象数组
    * @param user  登录用户对象
    * @param callback 回调数据
    * @param method 分享方式
    */
   insertToFileShare(fileObjArr, user, callback, method) {
      let shareNum = 0    //默认公开分享方式
      if (method == 1) {    //提取码分享
         shareNum = Math.ceil(Math.random() * 100000);
         shareNum = shareNum + ipArr[3]
      }

      let i = 0
      const stmt = db.prepare('INSERT OR IGNORE INTO file_share VALUES(?,?,?,?,?,?,?)')
      logger.info('insert to table(file_share)')
      fileObjArr.forEach(item => {
         stmt.run(intformat(flakeIdGen.next(), 'dec'), item.id, user.id, Date.now(), parseInt(shareNum), item.netPath, item.isDir, err => {
            try {
               if (err) throw err
               i++
               callback({ len: i, shareNum: shareNum })
            } catch (error) {
               logger.error('faild to insert table(file_share); caused by: ', error)
            }
         })
      })
   }
   /**
    * 获取分享码的数据
    * @param {*} shareNum 分享码
    * @param {*} callback 
    */
   getDataOfShareNum(shareNum, callback) {
      const stmt = db.prepare('SELECT file_share.*,local_files.absPath,local_files.filetype,local_files.filename,local_files.fileSize,user.id,user.username FROM file_share LEFT JOIN local_files ON file_share.fileId = local_files.id LEFT JOIN user WHERE file_share.shareNum = ?;')
      stmt.all(shareNum, (err, data) => {
         try {
            if (err) throw err
            callback(data)
         } catch (error) {
            logger.error('faild to getDataOfShareNum; caused by: ', error)
         }
      })
   }
}

module.exports = FileShare