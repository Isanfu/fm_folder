const netUtils = require('../utils/netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')


const getId = ()=>{

   const ip = netUtils.getIpAddress()
   const ipArr = ip.split('.')
   const flakeGen = new FlakeId({worker: parseInt(ipArr[2])+parseInt(ipArr[3])})
   return intformat(flakeGen.next(),'dec')
}



module.exports = {
   getId
}