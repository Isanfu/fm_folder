const fileUtils = require('../utils/fileUtils')
const LocalFiles = require('../entity/LocalFiles')

function insertToLocalFiles(user, dirAbsPath, curUrl){
   fileUtils.getDirObj(dirAbsPath,dirObjArr=>{
      new LocalFiles().insertToLocalFiles(user,dirObjArr,curUrl)
   })
}

process.on('message',msg=>{
   insertToLocalFiles(msg.user,msg.dirAbsPath,msg.curUrl)
})

process.on('SIGTERM',()=>{
   console.log('readDirAndInsertToDB进程退出');
   process.exit()
})