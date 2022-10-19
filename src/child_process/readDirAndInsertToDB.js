const fileUtils = require('../utils/fileUtils')
const LocalFiles = require('../entity/LocalFiles')
const logger = require('electron-log')

logger.info(`readDirAndInsert process start`)

/**
 * 插入文件夹到FileList数据库的local_files表
 * @param  user 用户对象
 * @param  dirAbsPath 文件夹的绝对路径
 * @param  curUrl //topBar当前的网络路径
 */
function insertToLocalFiles(user, dirAbsPath, curUrl){
   fileUtils.getDirObj(dirAbsPath,dirObjArr=>{
      new LocalFiles().insertToLocalFiles(user,dirObjArr,curUrl)
   })
}
process.on('message',msg=>{
   insertToLocalFiles(msg.user,msg.dirAbsPath,msg.curUrl)
})

process.on('SIGTERM',()=>{
   logger.info('readDirAndInsertToDB process exit');
   process.exit()
})