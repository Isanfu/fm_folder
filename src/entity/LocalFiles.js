const { db } = require('../dbInstance/fileListInstance')
const netUtils = require('../utils/netUtils')
const os = require('os')
const logger = require('electron-log')
class LocalFiles {
   /**
    * 文件插入到，localfiles表
    * @param user  登录用户对象
    * @param fileObjArr  文件对象数组
    * @param currUrl  当前顶部导航节点对象
    */
   insertToLocalFiles(user, fileObjArr, currUrl) {
      logger.info(`insertToLocalFiles `)
      db.serialize(() => {
         const createTime = Date.now()
         const modifyTime = createTime
         const ip = netUtils.getIpAddress().address
         console.log(ip);
         db.run('BEGIN TRANSACTION;', () => { });
         const stmt = db.prepare("INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);")
         fileObjArr.forEach(item => {
            //插入到当前路径
            if (item.parentId == '0')
               item.parentId = currUrl.key
            let tmRelativePath = item.relativePath
            os.platform == 'win32' ? tmRelativePath = tmRelativePath.replaceAll('\\', '/') : null
            const netPath = tmRelativePath.replace('./', currUrl.netPath)
            stmt.run(item.id, item.parentId, item.name, item.type, item.extname, item.size, item.absPath,
               item.relativePath, netPath, modifyTime, createTime, user.id, ip, item.isDir, item.md5)
         });
         stmt.finalize()
         db.run('COMMIT')
      })
   }
   /**
    * 获取用户首页显示数据
    * @param  user 登录用户对象
    * @param  callback 回调函数
    * @param  parentId 默认为0，获取首页数据，传入传入文件夹id，获取该文件夹的首页数据
    */
   getPageData(user, callback, parentId = '0') {
      const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files "
         + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.parentId = " + parentId
         + " AND user.id = " + user.id + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"
      db.all(getHomeTableDataSql, (err, data) => {
         try {
            if (err) throw err
            callback(data)
         } catch (error) {
            logger.error('faild to getPageData; caused by: ', error)
         }

      })

   }
   /**
    * 获取该路径下所有的文件信息
    * @param {*} userId   用户id
    * @param {*} netPath 网络路径
    * @param {*} callback 数据回调
    */
   getFileListInFolder(userId, netPath, callback) {
      const getFileListInFolderSql = `SELECT local_files.*,user.username FROM local_files LEFT JOIN user 
      ON local_files.userId = user.id 
      WHERE user.id = '${userId}' AND local_files.netPath LIKE '${netPath}%' AND local_files.isDir = 0;`
      db.all(getFileListInFolderSql, (err, data) => {

         try {
            if (err) throw err
            if (data.length == 0) {
               callback(0)
            } else
               callback(data)
         } catch (error) {
            logger.error('faild to get fileList in table(local_files); caused by: ', error)
         }


      })
   }


   /**
    * 获取文件信息
    * @param {*} userId 用户id
    * @param {*} fileId 文件id
    * @param {*} callback 数据回调
    */
   getFileObj(userId, fileId, callback) {
      const getFileObjSql = "SELECT local_files.absPath,local_files.filename,local_files.fileSize,local_files.md5 FROM local_files "
         + "WHERE local_files.id = " + fileId + " AND local_files.userId = " + userId + ";"
      db.get(getFileObjSql, (err, data) => {
         try {
            if (err) throw err
            if (typeof data == 'undefined' || data.length == 0) {
               callback(0)
            } else
               callback(data)
         } catch (error) {
            logger.error('faild to get fileObj in table(local_files); caused by: ', error)
         }
        
      })
   }
   /**
    * 更新文件属性
    * @param {*} attr 列名
    * @param {*} userId 用户id
    * @param {*} newVal 新值
    */
   updateFileObj(attr,userId,newVal){
      logger.info(`update local_files info; attr: ${attr}, newVal: ${newVal}`)
      db.run(`UPDATE local_files SET ${attr} = ? WHERE id = ?`, newVal, userId)
   }


}

module.exports = LocalFiles