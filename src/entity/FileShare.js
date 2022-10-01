const { db } = require('../dbInstance/fileListInstance')
const netUtils = require('../utils/netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });

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
         shareNum = Math.ceil(Math.random() * 1000000);
      }
      let i = 0
      const stmt = db.prepare('INSERT OR IGNORE INTO file_share VALUES(?,?,?,?,?,?,?)')
      fileObjArr.forEach(item => {
         stmt.run(intformat(flakeIdGen.next(), 'dec'), item.id, user.id, Date.now(), shareNum, item.netPath, item.isDir, err => {
            if (err) throw err
            i++
            callback({ len: i, shareNum: shareNum })
         })
      })
   }

}

module.exports = FileShare