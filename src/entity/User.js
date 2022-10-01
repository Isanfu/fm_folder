const { db } = require('../dbInstance/fileListInstance')
const netUtils = require('../utils/netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });
class User {
   /**
    * 判断app是否被使用
    * @param  callback 回调返回用户数，大于0即该app已被使用过
    */
   isExistUser(callback) {
      const sql = 'SELECT count(*) FROM user;'
      db.get(sql, (err, data) => {
         if (err) throw err
         callback(data)
      })
   }
   /**
    * 判断用户名是否已注册
    * @param username 用户名
    * @param callback 已注册返回true，否则返回false
    */
   isRegistered(username, callback) {
      const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
      stmt.get(username, (err, data) => {
         if (err) throw err
         console.log(data);
         if (data != undefined)
            callback(true)
         else
            callback(false)
      })
   }

   /**
    * 用户注册
    * @param  user 用户对象
    * @param  callback 回调返回已注册的用户对象
    */
   registerUser(user, callback) {
      const ip = netUtils.getIpAddress().address
      const userId = intformat(flakeIdGen.next(), 'dec')
      const createTime = Date.now()
      const modifyTime = createTime
      const stmt = db.prepare('INSERT INTO user VALUES(?,?,?,?,?,?,?);')
      stmt.run(userId, user.username, user.password, 'default_avatar.png', ip, modifyTime, createTime, err => {
         if (err) throw err

         user.id = userId
         user.ip = ip
         user.avatar = 'default_avatar.png'

         callback(user)
      })
   }

   /**
    * 用户登录
    * @param  username 用户名
    * @param  callback 返回等路用户对象
    */
   signInUser(username, callback) {
      const stmt = db.prepare('SELECT * FROM user WHERE username = ?')
      stmt.get(username, (err, data) => {
         if (err) throw err
         callback(data)
      })
   }

   /**
    * 更改用户属性
    * @param attr 用户属性参数
    * @param userId 用户id
    * @param newVal 新值
    */
   updateUser(attr, userId, newVal) {
      db.run(`UPDATE user SET ${attr} = ? WHERE id = ?`, newVal, userId)
   }


}

// const u = {
//    username: 'aaa',
//    password: '123'
// }

// new User().registerUser(u,data=>{
//    console.log(data);
// })


module.exports = User