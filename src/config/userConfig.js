const path = require('path')
const os = require('os')
const fs = require('fs')
if (!fs.existsSync(path.join(os.homedir(), './fm_folder')))
   fs.mkdirSync(path.join(os.homedir(), './fm_folder'))

if (!fs.existsSync(path.join(os.homedir(), './Downloads/fm_folder')))
   fs.mkdirSync(path.join(os.homedir(), './Downloads/fm_folder'))
module.exports = {
   fileListDbPath: path.join(os.homedir(), './fm_folder', '/fileList.db'),   //文件列表数据库
   remoteFileListDbPath: path.join(os.homedir(), './fm_folder', '/remoteFileList.db'),  //局域网分享数据库
   downloadFileUrl: path.join(os.homedir(), './Downloads/fm_folder')

}