const os = require("os");




//获取本机ip
const getIpAddress = () => {
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
