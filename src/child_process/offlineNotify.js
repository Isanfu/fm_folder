const dgram = require('dgram');
const udpDgram = dgram.createSocket('udp4');
const netUtils = require('../utils/netUtils')
const {rdb} = require('../dbInstance/remoteFileListInstance')


udpDgram.bind(16643, () => {
   udpDgram.setBroadcast(true)
   udpDgram.setTTL(255)
})

//清空remote_file_share表
rdb.run('DELETE FROM remote_file_share;')

let i = 0
const t = setInterval(()=>{
   udpDgram.send(JSON.stringify({type: 'offline',data: netUtils.getIpAddress().address}), 16642, '255.255.255.255');
   i++
   if(i==3){
      clearInterval(t)
      process.exit()
   }
},1000)






