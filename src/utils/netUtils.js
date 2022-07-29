const os = require("os");
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
        return alias.address;
      }
    }
  }
}

//ip包装为本机用户唯一标识，网盘根路径为/user/（‘hex’）ip@用户名
const baseUrl = (username)=>{
  const lanIp = getIpAddress()
  const ipArr = lanIp.split('.')
  const userIpHex = parseInt(ipArr[0]).toString(16) + parseInt(ipArr[1]).toString(16) 
  + parseInt(ipArr[2]).toString(16) + parseInt(ipArr[3]).toString(16)

  return `/user/${userIpHex}@${username}`
}


const name = baseUrl('sanfu')
console.log(name);

module.exports = {
   getIpAddress,
   baseUrl
} 
