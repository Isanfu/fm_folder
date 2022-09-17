const dgram = require('dgram');
const udpDgram = dgram.createSocket('udp4');
const os = require('os')
const fs = require('fs')
const { StringDecoder } = require('string_decoder');
const sqlite3 = require('sqlite3').verbose()
const FlakeId = require('flake-idgen')
const intformat = require('biguint-format')
const userConfig = require('../config/userConfig')
const EventEmitter = require('events');

class ClearIntervalEmitter extends EventEmitter { }

//数据库名字位置
const dbFile = userConfig.remoteFileListDbPath
const createDB = (callback) => {
   try {
      fs.accessSync(dbFile)
      const d = new sqlite3.Database(dbFile, err => {
         if (err) {
            console.log('数据库错误');
            throw err
         }
         callback(d)
      })
   } catch (error) {
      const db = new sqlite3.Database(dbFile, err => {
         if (err) {
            console.log('数据库错误');
            throw err
         }

         const createRemoteShareFileListTable = 'CREATE TABLE remote_file_share(id CHAR(20) PRIMARY KEY,'
            + 'fileId CHAR(20),'
            + 'filename VARCHAR(255),'
            + 'fileSize VARCHAR(64),'
            + 'filetype VARCHAR(30),'
            + 'userId CHAR(20),'
            + 'username VARCAHR(32),'
            + 'isDir INT(1),'
            + 'absPath TEXT,'
            + 'netPath TEXT,'
            + 'ip CHAR(15),'
            + 'port INT(5),'
            + 'createTime INT(20));'

         db.serialize(() => {

            const isExistTable = 'SELECT count(*) FROM sqlite_master WHERE type="table" AND name = "remote_file_share";'
            db.get(isExistTable, (err, row) => {
               if (err) throw err

               if (row['count(*)'] == 0) {

                  db.run(createRemoteShareFileListTable, err => {
                     if (err) throw err
                     db.run('CREATE UNIQUE INDEX idx_file ON remote_file_share(fileId,userId);')
                     callback(db)
                  })
               } else
                  console.log('table existed');
            })

         })
      })
   }
}




createDB(db => { })
//获取本机ip
const getIpAddress = () => {
   /**os.networkInterfaces() 返回一个对象，该对象包含已分配了网络地址的网络接口 */
   var interfaces = os.networkInterfaces();
   for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
         var alias = iface[i];
         if (
            alias.family === "IPv4" &&
            alias.address !== "127.0.0.1" &&
            !alias.internal
         ) {
            return alias;
         }
      }
   }
}

const realIp = getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });


udpDgram.addListener('connect', () => {
   console.log('链接成功');
})

udpDgram.addListener('listening', () => {
   console.log('监听到数据');
})
const msgQueue = []
//接收分享广播
const receiveShareData = (msgObj) => {
   msgQueue.push(msgObj)
   const queueLen = msgQueue.length

   for (let i = 0; i < queueLen; i++) {
      const queueItem = msgQueue.shift()
      //需要先删除再插入
      createDB(db => {
         db.run('DELETE FROM remote_file_share WHERE userId = ?', queueItem.msg.userInfo.id, err => {

            if (err) throw err
            //全部删除后再插入
            if (i == queueLen - 1) {
               db.parallelize(() => {
                  db.run('BEGIN TRANSACTION;', () => { });
                  const stmt = db.prepare('INSERT OR IGNORE INTO remote_file_share VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
                  const tm = queueItem.msg.fileList

                  tm.forEach(item => {

                     stmt.run(intformat(flakeIdGen.next(), 'dec'), item.fileId,
                        item.filename, item.fileSize, item.filetype, queueItem.msg.userInfo.id,
                        queueItem.msg.userInfo.name, item.isDir, item.absPath, item.netPath, queueItem.rinfo.address,
                        queueItem.rinfo.port, queueItem.msg.createTime)
                  });
                  stmt.finalize()
                  db.run('COMMIT')
               })
            }
         })

      })
   }
}

var recordCreateTimeJson = {}
const clearIntervalEmitter = new ClearIntervalEmitter()
udpDgram.addListener('message', (msg, rinfo) => {
   if (rinfo.address != getIpAddress().address) {
      const decoder = new StringDecoder('utf8');
      const decoderMsgJson = JSON.parse(decoder.write(msg))
      //记住第一次接受消息的时间


      switch (decoderMsgJson.type) {
         case 'broadcast':
            //时间更大时才会接收数据
            if (typeof recordCreateTimeJson[decoderMsgJson.data.userInfo.id] == 'undefined') {
               recordCreateTimeJson[decoderMsgJson.data.userInfo.id] = decoderMsgJson.data.createTime
               receiveShareData({ rinfo: rinfo, msg: decoderMsgJson.data });
            }
            if (recordCreateTimeJson[decoderMsgJson.data.userInfo.id] < decoderMsgJson.data.createTime) {
               receiveShareData({ rinfo: rinfo, msg: decoderMsgJson.data });
               //记录最近一次该用户的分享更新
               recordCreateTimeJson[decoderMsgJson.data.userInfo.id] = decoderMsgJson.data.createTime
            }
            break;
         case 'ding': {
            if(fs.readFileSync('src/file_broadcast/lastFileBroadcastJson.json').toLocaleString() != ''){
               let i = 0
               let t = setInterval(() => {
                  
                  udpDgram.send(JSON.stringify({
                     type: 'broadcast',
                     data: JSON.parse(fs.readFileSync('src/file_broadcast/lastFileBroadcastJson.json').toLocaleString())
                  }),
                     6642,
                     rinfo.address)
                  i++
                  if (i == 5) {
                     clearInterval(t)
                     i = 0
                  }
               }, 2000)
   
               clearIntervalEmitter.on('clearInterval', () => {
   
                  if (typeof t != 'undefined') {
                     clearInterval(t)
                  }
   
               })
            }
         }
            break;
      }
   }

})


udpDgram.bind(6642, () => {
   udpDgram.setBroadcast(true)
   udpDgram.setTTL(255)
})
clearIntervalEmitter.setMaxListeners(0)
// 监听父进程消息
var timer = undefined
process.on('message', (msg) => {
   if(typeof timer == 'undefined'){
      clearIntervalEmitter.emit('clearInterval')
      let i = 0
       timer = setInterval(() => {
         udpDgram.send(JSON.stringify(msg), 6642, '255.255.255.255');
         i++
         console.log(i);
         if (i == 5)
            clearInterval(timer)
      }, 2000)
   }else{
      clearInterval(timer)
      clearIntervalEmitter.emit('clearInterval')
      let i = 0
       timer = setInterval(() => {
         udpDgram.send(JSON.stringify(msg), 6642, '255.255.255.255');
         i++
         console.log(i);
         if (i == 5)
            clearInterval(timer)
      }, 2000)
   }

})

