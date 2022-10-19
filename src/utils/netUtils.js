const os = require("os");

//获取本机ip
const getIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (const item of iface) {
        if(item.family == 'IPv4' && item.address != '127.0.0.1' && !item.alias)
          return item
    }
  }
}

//ip包装为本机用户唯一标识，网盘根路径为/user/（‘hex’）ip@用户名
const baseUrl = (username) => {
  const lanIp = getIpAddress().address
  const ipArr = lanIp.split('.')
  const userIpHex = parseInt(ipArr[0]).toString(16) + parseInt(ipArr[1]).toString(16)
    + parseInt(ipArr[2]).toString(16) + parseInt(ipArr[3]).toString(16)

  return `/user/${userIpHex}@${username}`
}


module.exports = {
  getIpAddress,
  baseUrl
} 
