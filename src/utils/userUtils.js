const netUtils = require('./netUtils')
const dbUtils = require('./dbUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const crypto = require('crypto')
const moment = require('moment')

//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress()
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });

//获取用户根路径的文件数据
const getHomeTableData = (user,callback,parentId = '0') => {
   dbUtils.createDB(db => {
      const getHomeTableDataSql = "SELECT local_files.*,user.username FROM local_files " 
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.parentId = "+parentId+" AND user.id = "+user.id+";"
      db.all(getHomeTableDataSql, (err, data) => {
         if (err) throw err
         for (let itme of data) {
            if(itme.fileSize < 1024 && itme.isDir == 0){
               itme.fileSize = parseInt(itme.fileSize) + 'B'
            }else if(parseInt( itme.fileSize/1024/1024)<1 && itme.isDir == 0){
               itme.fileSize = parseInt(itme.fileSize/1024).toFixed(2) + 'KB'
            }else{
               itme.fileSize = (parseInt(itme.fileSize/1024/1024)).toFixed(2)+'MB'
            }
            if(itme.isDir == 1)
               itme.fileSize = ''
            itme.modifyTime = moment(itme.modifyTime).format('YYYY-MM-DD hh:mm')
         }
         callback(data)
      })
   })
}



//判断软件是否已经有用户使用过了
const isExistUser = (callback)=>{
   dbUtils.createDB(db=>{
      const sql = 'SELECT count(*) FROM user;'
      db.get(sql,(err,data)=>{
         if(err) throw err
         callback(data)
      })
   })
}

//md5密码加密
const md5ForPassword = (password)=>{
   return crypto.createHash('md5').update(password).digest('hex')
}


//判断是否已注册
const isRegisterUser = (username,callback)=>{
   dbUtils.createDB(db=>{
         const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
         stmt.get(username,(err,data)=>{
            if(err) throw err
            console.log(data);
            if(data != undefined)
               callback(true)
            else
               callback(false)            
         })
   })
}



//注册用户
const registerUser = (user,callback) => {
   const ip = netUtils.getIpAddress()
   const userId = intformat(flakeIdGen.next(), 'dec')
   const createTime = Date.now()
         const modifyTime = createTime
   dbUtils.createDB(db => {
      const stmt = db.prepare( 'INSERT INTO user VALUES(?,?,?,?,?,?,?);')
      stmt.run(userId,user.username,user.password,'defalut-avatar.png',ip,modifyTime,createTime,err=>{
         if(err) throw err

         user.id = userId
         user.ip = ip
         user.avatar = 'defalut-avatar.png'

         callback(user)
      })

   })
}


//登陆用户
const signInUser = (username,callback)=>{
   dbUtils.createDB(db=>{
      const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
      stmt.get(username,(err,data)=>{
         if(err) throw err
         callback(data)
      })
   })
}
// signInUser('111a',data=>{
//    console.log(data);
// })

//更改用户名
const modifyUsername = (user,callback)=>{
   dbUtils.createDB(db=>{
      // const stmt = db.prepare('UPDATE')
   })
}


module.exports = {
   registerUser,
   isExistUser,
   isRegisterUser,
   md5ForPassword,
   signInUser,
   getHomeTableData
}
