const {db} =require('../dbInstance/fileListInstance')
const netUtils = require('../utils/netUtils')
const path = require('path')


class LocalFiles{
   /**
    * 文件插入到，localfiles表
    * @param user  登录用户对象
    * @param fileObjArr  文件对象数组
    * @param currUrl  当前顶部导航节点对象
    */
   insertToLocalFiles(user,fileObjArr,currUrl){
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
   }
   /**
    * 获取用户首页显示数据
    * @param  user 登录用户对象
    * @param  callback 回调函数
    * @param  parentId 默认为0，获取首页数据，传入传入文件夹id，获取该文件夹的首页数据
    */
   getPageData(user, callback, parentId = '0'){
         const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files "
            + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.parentId = " + parentId
            + " AND user.id = " + user.id + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"
         db.all(getHomeTableDataSql, (err, data) => {
            if (err) throw err
            callback(data)
         })

   }
}

module.exports = LocalFiles