const netUtils = require('./netUtils')
const dbUtils = require('./dbUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const crypto = require('crypto')
const sqlite3 = require('sqlite3').verbose()
const userConfig = require('../config/userConfig')
const os = require('os')





//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });

//获取用户根路径的文件数据
const getHomeTableData = (user, callback, parentId = '0') => {
   dbUtils.createDB(db => {
      const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files "
         + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.parentId = " + parentId
         + " AND user.id = " + user.id + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"
      db.all(getHomeTableDataSql, (err, data) => {
         if (err) throw err

         callback(data)
      })
   })
}



//判断软件是否已经有用户使用过了
const isExistUser = (callback) => {
   dbUtils.createDB(db => {
      const sql = 'SELECT count(*) FROM user;'
      db.get(sql, (err, data) => {
         if (err) throw err
         callback(data)
      })
   })
}

//md5密码加密
const md5ForPassword = (password) => {
   return crypto.createHash('md5').update(password).digest('hex')
}


//判断是否已注册
const isRegisterUser = (username, callback) => {
   dbUtils.createDB(db => {
      const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
      stmt.get(username, (err, data) => {
         if (err) throw err
         console.log(data);
         if (data != undefined)
            callback(true)
         else
            callback(false)
      })
   })
}



//注册用户
const registerUser = (user, callback) => {
   const ip = netUtils.getIpAddress().address
   const userId = intformat(flakeIdGen.next(), 'dec')
   const createTime = Date.now()
   const modifyTime = createTime
   dbUtils.createDB(db => {
      const stmt = db.prepare('INSERT INTO user VALUES(?,?,?,?,?,?,?);')
      stmt.run(userId, user.username, user.password, 'default_avatar.png', ip, modifyTime, createTime, err => {
         if (err) throw err

         user.id = userId
         user.ip = ip
         user.avatar = 'default_avatar.png'

         callback(user)
      })

   })
}


//登陆用户
const signInUser = (username, callback) => {
   dbUtils.createDB(db => {
      const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
      stmt.get(username, (err, data) => {
         if (err) throw err
         callback(data)
      })
   })
}




//更改用户信息
const updateUser = (attr, userId, newVal) => {
   dbUtils.createDB(db => {
      console.log(attr, userId, newVal);
      db.run(`UPDATE user SET ${attr} = ? WHERE id = ?`, newVal, userId)
   })
}



//创建新文件夹
const createNewFolder = (folderName, currtUrl, user, callback) => {
   dbUtils.createDB(db => {
      const id = intformat(flakeIdGen.next(), 'dec')
      const createTime = Date.now()
      const modifyTime = createTime
      const ip = realIp
      
      const stmt = db.prepare("INSERT INTO local_files VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);")
      let relativePath = ''

      if(os.platform() == 'win32'){
         relativePath = currtUrl.netPath.replace(netUtils.baseUrl(user.username)+'/','.\\')
         relativePath = relativePath.replaceAll('/','\\')
      }else{
         console.log(netUtils.baseUrl()+'/');
         relativePath = currtUrl.netPath.replace(netUtils.baseUrl(user.username)+'/','./')
      }
      stmt.run(id, currtUrl.key, folderName, 'folder', 'folder', '0', `/map/${folderName}`,relativePath, currtUrl.netPath, modifyTime, createTime, user.id, ip, 1, '0')
      stmt.finalize()
      callback(200)
   })
}
//更改文件名,需要更改netPath
const updateFileName = (fileObj, userId, newFileName, currNetPath, callback) => {
   const modifyTime = Date.now()
   // console.log(fileObj);
   dbUtils.createDB(db => {
      // console.log(fileObj);
      if (fileObj.isDir == 1) {
         // console.log('a');

         db.run('UPDATE local_files SET netPath=REPLACE(netPath,?,?),modifyTime = ? WHERE userId = ?', currNetPath + fileObj.filename, currNetPath + newFileName, modifyTime, userId)
      }
      db.run('UPDATE local_files SET filename = ?,modifyTime = ? WHERE id = ? AND userId = ?', newFileName, modifyTime, fileObj.id, userId)



      callback(200)
   })
}
//删除文件
const delFileObjArr = (fileObjArr, user, callback) => {
   dbUtils.createDB(db => {
      let i = 0
      fileObjArr.forEach(item => {
         db.run('DELETE FROM local_files WHERE id = ? AND userId = ?', item.id, user.id)
         db.run('DELETE FROM file_share WHERE userId = ? AND fileId = ?', user.id, item.id, err => {
            if (err) throw err
            i++
            if (i == fileObjArr.length)
               callback(i)
         })
         if (item.isDir == 1) {
            console.log(item.netPath + item.filename + '%');
            db.run('DELETE FROM local_files WHERE userId = ? AND netPath LIKE ?', user.id, item.netPath + item.filename + '%')
            db.run('DELETE FROM file_share WHERE userId = ? AND netPath LIKE ?', user.id, item.netPath + item.filename + '%')
         }
      });
   })
}
//获取所有文件夹
const getAllFolder = (user, callback, parentId = '0') => {
   dbUtils.createDB(db => {
      const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files "
         + "LEFT JOIN user ON local_files.userId = user.id WHERE isDir = 1 AND local_files.parentId = " + parentId + " AND user.id = " + user.id + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"
      db.all(getHomeTableDataSql, (err, data) => {
         if (err) throw err
         callback(data)
      })
   })
}



//移动文件
const moveFileObjArr = (fileObjArr, user, targetObj, callback) => {


   callback(200)

   dbUtils.createDB(db => {
      fileObjArr.forEach(item => {
         let relativePath = ''

         if(os.platform() == 'win32'){
            relativePath = targetObj.netPath.replace(netUtils.baseUrl(user.username)+'/','.\\')
            relativePath = relativePath.replaceAll('/','\\')
         }else{
            console.log(netUtils.baseUrl()+'/');
            relativePath = targetObj.netPath.replace(netUtils.baseUrl(user.username)+'/','./')
         }
         db.run('UPDATE local_files SET parentId = ?,relativePath = ?,netPath = REPLACE(netPath,?,?),modifyTime = ? WHERE id = ? AND userId = ?', targetObj.key,relativePath, item.netPath, targetObj.netPath, Date.now(), item.id, user.id)
         if (item.isDir == 1) {
            
            const stmt = db.prepare('UPDATE local_files SET relativePath = ?,netPath = REPLACE(netPath,?,?),modifyTime = ? WHERE userId = ? AND netPath like ?')
            stmt.run(relativePath, item.netPath, targetObj.netPath, Date.now(), user.id, item.netPath + item.filename + '%', () => {
               callback(200)
            })
         }
      })
   })
}

//数据分类
const getClassifyFileData = (type, userId, offset, callback) => {
   dbUtils.createDB(db => {
      const stmt = db.prepare("SELECT local_files.*,user.username FROM local_files "
         + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.fileType = ?"
         + " AND user.id = ? ORDER BY local_files.modifyTime ASC LIMIT 20 OFFSET ?;")

      stmt.all(type, userId, offset, (err, data) => {
         if (err) throw err
         callback(data)
      })

   })
}
//获取文档类型文件，除了视频，声音，图片的类型=
const getDocClassFileData = (userId, offset, callback) => {
   dbUtils.createDB(db => {
      const stmt = db.prepare("SELECT local_files.*,user.username FROM local_files "
         + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.filetype !='image' AND local_files.filetype !='video' AND local_files.filetype != 'audio' AND local_files.filetype != 'folder'"
         + " AND user.id = ? ORDER BY local_files.modifyTime ASC LIMIT 20 OFFSET ?;")
      stmt.all(userId, offset, (err, data) => {
         if (err) throw err
         callback(data)
      })
   })

}

//文件分享
const fileShare = (fileObjArr, user, callback, method) => {
   let shareNum = 0    //默认公开分享方式

   if (method == 1) {    //提取码分享
      shareNum = Math.ceil(Math.random() * 1000000);
   }
   let i = 0
   dbUtils.createDB(db => {
      const stmt = db.prepare('INSERT OR IGNORE INTO file_share VALUES(?,?,?,?,?,?,?)')
      fileObjArr.forEach(item => {
         stmt.run(intformat(flakeIdGen.next(), 'dec'), item.id, user.id, Date.now(), shareNum, item.netPath, item.isDir, err => {
            if (err) throw err
            i++
            callback({ len: i, shareNum: shareNum })
         })
      })
   })
}

// 获取文件分享表
const getShareTableData = (user, offset, callback) => {
   dbUtils.createDB(db => {
      const getShareTableDataSql = db.prepare('SELECT file_share.*, local_files.filename,local_files.fileSize,local_files.absPath,'
         + 'local_files.netPath,local_files.filetype,user.username '
         + 'FROM file_share LEFT JOIN user ON file_share.userId = ?'
         + ' LEFT JOIN local_files ON file_share.fileId = local_files.id LIMIT 20 OFFSET ?;')

      getShareTableDataSql.all(user.id, offset, (err, data) => {
         if (err) throw err
         callback(data)
      })
   })
}



//从分享表中删除
const delFileObjArrOnFileShareTable = (user, fileObjArr, callback) => {
   dbUtils.createDB(db => {
      let i = 0
      const delFileObjOnShareTableSql = db.prepare('DELETE FROM file_share WHERE userId = ? AND id = ?')
      fileObjArr.forEach(item => {
         delFileObjOnShareTableSql.run(user.id, item.id, err => {
            if (err) throw err
            i++
            callback(i)
         })
      })
   })
}
//获取外部分享表数据
const getRemoteFileListShareData = (callback) => {

   const db = new sqlite3.Database(userConfig.remoteFileListDbPath);

   db.all('SELECT * FROM remote_file_share', (err, data) => {
      if (err) throw err
      callback(data)
   })
}

//获取我的分享表数据
const getMyShareFileListData = (user, callback) => {
   dbUtils.createDB(db => {
      const getShareFileListSql = 'SELECT file_share.*,local_files.absPath,local_files.filetype,local_files.filename,local_files.fileSize,user.id,user.username FROM file_share LEFT JOIN local_files ON file_share.fileId = local_files.id LEFT JOIN user ON file_share.userId = ' + user.id + ';'
      db.all(getShareFileListSql, (err, data) => {
         if (err) throw err
         const broadcastInfo = {
            userInfo: {
               id: user.id,
               name: user.username
            },
            fileList: data,
            createTime: Date.now()
         }
         callback(broadcastInfo)
      })
   })
}

const getSearchData = (user,key,callback)=>{
   dbUtils.createDB(db=>{
      db.all("SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.filename like ?" 
      + " AND user.id = ? ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;",`%${key}%`,user.id,(err,data)=>{
         if(err) throw err
         callback(data)
      })
   })
}




module.exports = {
   registerUser,
   isExistUser,
   isRegisterUser,
   md5ForPassword,
   signInUser,
   getHomeTableData,
   createNewFolder,
   delFileObjArr,
   updateFileName,
   updateUser,
   getAllFolder,
   moveFileObjArr,
   getClassifyFileData,
   getDocClassFileData,
   fileShare,
   getShareTableData,
   delFileObjArrOnFileShareTable,
   getRemoteFileListShareData,
   getMyShareFileListData,
   getSearchData
}
