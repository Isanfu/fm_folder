const dgram = require('dgram');
const udpDgram = dgram.createSocket('udp4');
const RemoteFiles = require('../entity/RemoteFiles')

/**
 * 应用退出后，清空远程共享表，通知局域网内的其它机器，
 * 并且其它机器删除该ip的共享文件数据
 */

udpDgram.bind(16643, () => {
   udpDgram.setBroadcast(true)
   udpDgram.setTTL(255)
})

//清空表
new RemoteFiles().clearTable()


let i = 0
const t = setInterval(()=>{
   udpDgram.send(JSON.stringify({type: 'offline',data: '',createTime: Date.now(),shareNum: 4}), 16642, '255.255.255.255');
   i++
   if(i==3){
      clearInterval(t)
      process.exit()
   }
},1000)





