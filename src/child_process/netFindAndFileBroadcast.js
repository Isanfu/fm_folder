const dgram = require('dgram');
const udpDgram = dgram.createSocket('udp4');
const fs = require('fs')
const { StringDecoder } = require('string_decoder');
const EventEmitter = require('events');
const netUtils = require('../utils/netUtils')
const RemoteFiles = require('../entity/RemoteFiles');
const FileShare = require('../entity/FileShare')
class ClearIntervalEmitter extends EventEmitter { }
const logger = require('electron-log')
const path = require('path')

logger.info(`netFindAndFileBroadcast process start; port: 16642`)

const realIp = netUtils.getIpAddress().address

const remoteFiles = new RemoteFiles()
const fileShare = new FileShare()

udpDgram.addListener('connect', () => {
   console.log('链接成功');
})
udpDgram.addListener('listening', () => {
   console.log('监听到数据');
})
//接收分享广播: 清除后再添加
const receiveShareData = (msgObj) => {
   console.log(msgObj.msg.shareNum, msgObj.msg.fileList.length);
   //对于公开分享的数据，需要先清除再插入
   if (msgObj.msg.shareNum == 0) {
      remoteFiles.deleteColOnUserId(msgObj.msg.userInfo.id, () => {
         if (msgObj.msg.fileList.length > 0)
            remoteFiles.paraInsertToDb(msgObj)
      })
   } else
      remoteFiles.paraInsertToDb(msgObj)
}


var recordCreateTimeJson = {}
const clearIntervalEmitter = new ClearIntervalEmitter()
udpDgram.addListener('message', (msg, rinfo) => {
   if (rinfo.address != realIp) {
      const decoder = new StringDecoder('utf8');
      const decoderMsgJson = JSON.parse(decoder.write(msg))
      //记住第一次接受消息的时间
      switch (decoderMsgJson.type) {
         case 'broadcast':
            logger.info(rinfo.address + ', recevice data: '+decoderMsgJson.data)
            //创建时间更大时才会接收数据
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
         //接收局域网内用户登录发送的广播，以及返回
         case 'ding': {
            logger.info('sign in: ' + rinfo.address)
            if (fs.readFileSync(process.env.NODE_ENV == "development" ?'src/file_broadcast/lastFileBroadcastJson.json': path.join(__dirname,'../file_broadcast/lastFileBroadcastJson.json')).toLocaleString() != '') {
               let i = 0
               let t = setInterval(() => {
                  udpDgram.send(JSON.stringify({
                     type: 'broadcast',
                     data: JSON.parse(fs.readFileSync(process.env.NODE_ENV == "development" ?'src/file_broadcast/lastFileBroadcastJson.json': path.join(__dirname,'../file_broadcast/lastFileBroadcastJson.json')).toLocaleString())
                  }),
                     16642,
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
         case 'offline': {
            remoteFiles.deleteColOnIp( rinfo.address)
         } break;
         case 'shareNum': {
            console.log(decoderMsgJson.data);
            const hostNum = decoderMsgJson.data.toString().substring(5)
            if (hostNum == realIp.split('.')[3]) {
               fileShare.getDataOfShareNum(decoderMsgJson.data, data => {
                  console.log(data);
                  udpDgram.send(JSON.stringify({ type: 'broadcast', data: { userInfo: { id: data[0].userId, name: data[0].username }, fileList: data, createTime: Date.now(), shareNum: data[0].shareNum } }), 16642, rinfo.address)
               })
               console.log(hostNum);
            }

         } break;
      }
   }

})



udpDgram.bind(16642, () => {
   udpDgram.setBroadcast(true)
   udpDgram.setTTL(255)
})
clearIntervalEmitter.setMaxListeners(0)
// 监听父进程消息
var timer = undefined
process.on('message', (msg) => {
   logger.info('send data: '+JSON.stringify(msg.data))
   if (typeof timer == 'undefined') {
      clearIntervalEmitter.emit('clearInterval')
      let i = 0
      timer = setInterval(() => {
         udpDgram.send(JSON.stringify(msg), 16642, '255.255.255.255');
         i++
         if (i == 5)
            clearInterval(timer)
      }, 2000)
   } else {
      clearInterval(timer)
      clearIntervalEmitter.emit('clearInterval')
      let i = 0
      timer = setInterval(() => {
         udpDgram.send(JSON.stringify(msg), 16642, '255.255.255.255');
         i++
         if (i == 5)
            clearInterval(timer)
      }, 2000)
   }

})



process.on('SIGTERM', () => {
   
   logger.info('netFindAndFileBroadcast process exit')
   console.log('netFindAndFileBroadcast进程退出');
   process.exit()
})
