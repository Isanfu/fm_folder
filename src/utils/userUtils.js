const netUtils = require('./netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const crypto = require('crypto')
const os = require('os')
const { db } = require('../dbInstance/fileListInstance')
const { rdb } = require('../dbInstance/remoteFileListInstance')
const logger = require('electron-log')


//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });


//md5密码加密
const md5ForPassword = (password) => {
   return crypto.createHash('md5').update(password).digest('hex')
}


//创建新文件夹
const createNewFolder = (folderName, currUrl, user, callback) => {
   const id = intformat(flakeIdGen.next(), 'dec')
   const createTime = Date.now()
   const modifyTime = createTime
   const ip = realIp
   logger.info('create new Folder; new folderName = ', folderName)

   const stmt = db.prepare("INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);")
   let relativePath = ''

   if (os.platform() == 'win32') {
      relativePath = currUrl.netPath.replace(netUtils.baseUrl(user.username) + '/', '.\\')
      relativePath = relativePath.replaceAll('/', '\\')
   } else {
      relativePath = currUrl.netPath.replace(netUtils.baseUrl(user.username) + '/', './')
   }
   stmt.run(id, currUrl.key, folderName, 'folder', 'folder', '0', `/map/${folderName}`, relativePath, currUrl.netPath, modifyTime, createTime, user.id, ip, 1, '0')
   stmt.finalize()
   callback(200)
}
//更改文件名,需要更改netPath
const updateFileName = (fileObj, userId, newFileName, currNetPath, callback) => {
   logger.info(`modify filename; new fileName = `, fileObj.filename)
   const modifyTime = Date.now()
   if (fileObj.isDir == 1) {
      db.run('UPDATE local_files SET netPath=REPLACE(netPath,?,?),modifyTime = ? WHERE userId = ?', currNetPath + fileObj.filename, currNetPath + newFileName, modifyTime, userId)
   }
   db.run('UPDATE local_files SET filename = ?,modifyTime = ? WHERE id = ? AND userId = ?', newFileName, modifyTime, fileObj.id, userId)
   callback(200)
}
//删除文件
const delFileObjArr = (fileObjArr, user, callback) => {
   logger.info(`delFileObjArr where userId = `, user.id)
   let i = 0
   fileObjArr.forEach(item => {
      db.run('DELETE FROM local_files WHERE id = ? AND userId = ?', item.id, user.id)
      db.run('DELETE FROM file_share WHERE userId = ? AND fileId = ?', user.id, item.id, err => {
         try {
            if (err) throw err
            i++
            if (i == fileObjArr.length)
               callback(i)
         } catch (error) {
            logger.error('faild to delFileObjArr; caused by: ', error)
         }

      })
      if (item.isDir == 1) {
         db.run('DELETE FROM local_files WHERE userId = ? AND netPath LIKE ?', user.id, item.netPath + item.filename + '%')
         db.run('DELETE FROM file_share WHERE userId = ? AND netPath LIKE ?', user.id, item.netPath + item.filename + '%')
      }
   });
}
//获取所有文件夹
const getAllFolder = (user, callback, parentId = '0') => {
   const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE isDir = 1 AND local_files.parentId = " + parentId + " AND user.id = " + user.id + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"
   db.all(getHomeTableDataSql, (err, data) => {
      try {
         if (err) throw err
         callback(data)
      } catch (error) {
         logger.error('faild to getAllFolder; caused by: ', error)
      }

   })
}



//移动文件
const moveFileObjArr = (fileObjArr, user, targetObj, callback) => {

   fileObjArr.forEach(item => {
      let relativePath = ''
      logger(`move file; from ${item.netPath} to ${targetObj.netPath}`)
      if (os.platform() == 'win32') {
         relativePath = targetObj.netPath.replace(netUtils.baseUrl(user.username) + '/', '.\\')
         relativePath = relativePath.replaceAll('/', '\\')
      } else {
         relativePath = targetObj.netPath.replace(netUtils.baseUrl(user.username) + '/', './')
      }
      db.run('UPDATE local_files SET parentId = ?,relativePath = ?,netPath = REPLACE(netPath,?,?),modifyTime = ? WHERE id = ? AND userId = ?', targetObj.key, relativePath, item.netPath, targetObj.netPath, Date.now(), item.id, user.id)
      if (item.isDir == 1) {
         if (item.netPath.length > targetObj.netPath.length) {
            relativePath = relativePath.replace('./', './' + item.filename)
            const stmt = db.prepare('UPDATE local_files SET relativePath = ?,netPath = REPLACE(netPath,?,?),modifyTime = ? WHERE userId = ? AND netPath like ?')
            stmt.run(relativePath, item.netPath + '/', targetObj.netPath, Date.now(), user.id, item.netPath + '/' + item.filename + '%', () => {
               callback(200)
            })
         } else {
            const stmt = db.prepare('UPDATE local_files SET relativePath = ?,netPath = REPLACE(netPath,?,?),modifyTime = ? WHERE userId = ? AND netPath like ?')
            stmt.run(relativePath, item.netPath, targetObj.netPath, Date.now(), user.id, item.netPath + item.filename + '%', () => {
               callback(200)
            })
         }

      }
   })
}

//数据分类
const getClassifyFileData = (type, userId, offset, callback) => {
   const stmt = db.prepare("SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.fileType = ?"
      + " AND user.id = ? ORDER BY local_files.modifyTime ASC LIMIT 20 OFFSET ?;")

   stmt.all(type, userId, offset, (err, data) => {
      try {
         if (err) throw err
         callback(data)
      } catch (error) {
         logger.error('faild to getClassifyFileData; caused by: ', error)
      }

   })

}
//获取文档类型文件，除了视频，声音，图片的类型
const getDocClassFileData = (userId, offset, callback) => {
   const stmt = db.prepare("SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.filetype !='image' AND local_files.filetype !='video' AND local_files.filetype != 'audio' AND local_files.filetype != 'folder'"
      + " AND user.id = ? ORDER BY local_files.modifyTime ASC LIMIT 20 OFFSET ?;")
   stmt.all(userId, offset, (err, data) => {
      try {
         if (err) throw err
         callback(data)
      } catch (error) {
         logger.error('faild to getDocClassFileData; caused by: ', error)
      }
   })
}

// 获取文件分享表
const getShareTableData = (user, offset, callback) => {
   const getShareTableDataSql = db.prepare('SELECT file_share.*, local_files.filename,local_files.fileSize,local_files.absPath,'
      + 'local_files.netPath,local_files.filetype,user.username '
      + 'FROM file_share LEFT JOIN user ON file_share.userId = ?'
      + ' LEFT JOIN local_files ON file_share.fileId = local_files.id LIMIT 20 OFFSET ?;')

   getShareTableDataSql.all(user.id, offset, (err, data) => {
      try {
         if (err) throw err
         callback(data)
      } catch (error) {
         logger.error('faild to getShareTableData; caused by: ', error)
      }

   })
}

//从分享表中删除
const delFileObjArrOnFileShareTable = (user, fileObjArr, callback) => {
   let i = 0
   logger.info('delFileObjArrOnFileShareTable')
   const delFileObjOnShareTableSql = db.prepare('DELETE FROM file_share WHERE userId = ? AND id = ?')
   fileObjArr.forEach(item => {
      delFileObjOnShareTableSql.run(user.id, item.id, err => {
         try {
            if (err) throw err
            i++
            callback(i)
         } catch (error) {
            logger.error(`faild to delFileObjArrOnFileShareTable; caused by: ${error}`)
         }

      })
   })
}
//获取外部分享表数据
const getRemoteFileListShareData = (callback) => {
   rdb.all('SELECT * FROM remote_file_share', (err, data) => {
      try {
         if (err) throw err
         callback(data)
      } catch (error) {
         logger.error(`faild to getRemoteFileListShareData; caused by: `, error)
      }

   })
}

//获取分享表数据中公开分享的文件列表
const getMyShareFileListData = (user, callback) => {
   const stmt = db.prepare('SELECT file_share.*,local_files.absPath,local_files.filetype,local_files.filename,local_files.fileSize,user.id,user.username FROM file_share LEFT JOIN local_files ON file_share.fileId = local_files.id LEFT JOIN user ON file_share.userId = ? WHERE file_share.shareNum = ?;')
   stmt.all(user.id, 0, (err, data) => {
      try {
         if (err) throw err
         const broadcastInfo = {
            userInfo: {
               id: user.id,
               name: user.username
            },
            fileList: data,
            createTime: Date.now(),
            shareNum: 0
         }
         callback(broadcastInfo)
      } catch (error) {
         logger.error(`faild to getMyShareFileListData; caused by: `, error)
      }

   })
}
//搜索数据
const getSearchData = (user, key, callback) => {
   db.all("SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.filename like ?"
      + " AND user.id = ? ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;", `%${key}%`, user.id, (err, data) => {
         try {
            if (err) throw err
            callback(data)
         } catch (error) {
            logger.error(`faild to getSearchData; caused by: `, error)
         }

      })
}


module.exports = {
   md5ForPassword,
   createNewFolder,
   delFileObjArr,
   updateFileName,
   getAllFolder,
   moveFileObjArr,
   getClassifyFileData,
   getDocClassFileData,
   getShareTableData,
   delFileObjArrOnFileShareTable,
   getRemoteFileListShareData,
   getMyShareFileListData,
   getSearchData
}
