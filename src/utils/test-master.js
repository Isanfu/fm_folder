const { FixedThreadPool  } = require('poolifier')

const pool = new FixedThreadPool(50,'/Users/sanfu/Desktop/file_share/src/utils/test-slaves.js',{
   errorHandler: err=>{if(err) throw err},
   onlineHandler: ()=>{}
})

const fs = require('fs');
const path = require('path')
const netUtils = require('./netUtils')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')


//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress().address
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });
const fileType = (extname) => {
   extname = extname.replace('.', '').toLowerCase()

   const video = ['avi', 'wmv', 'mpeg', 'mp4', 'm4v', 'mov', 'asf', 'flv', 'f4v', 'rmvb', 'rm', '3gp', 'vob']
   const audio = ['mp3', 'wav', 'wma', 'mp2', 'flac', 'midi', 'ra', 'ape', 'aac', 'cda', 'mov']
   const fileExtname = [
      'apk', 'as', 'c', 'class', 'cmake', 'cpp', 'cs', 'css', 'dart', 'db', 'dmg', 'exe', 'fig',
      'file', 'flash', 'folder', 'git', 'go', 'gradle', 'groovy', 'h', 'hpp', 'sh', 'rpm',
      'html', 'jar', 'java', 'js', 'json', 'kt', 'less', 'log', 'm', 'mat', 'md', 'pas',
      'pdf', 'php', 'pl', 'plx', 'pp', 'proto', 'ps1', 'py', 'r', 'rs', 'ruby', 'sass',
      'scpt', 'ts', 'uml', 'vue', 'xml', 'yaml', 'zip'
   ]
   const image = ['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pcx', 'tga', 'exif', 'fpx', 'svg', 'psd', 'cdr', 'pcd', 'dxf', 'ufo', 'eps', 'ai', 'raw', 'wmf', 'webp', 'avif', 'apng']
   const word = ['doc', 'docx']
   const excel = ['xls', 'xlsx']
   const ppt = ['ppt', 'pptx']

   for (const item of image) {
      if (item == extname)
         return 'image'
   }

   for (const item of video) {
      if (item == extname)
         return 'video'
   }
   for (const item of audio) {
      if (item == extname)
         return 'audio'
   }

   for (const item of word) {
      if (item == extname)
         return 'word'
   }
   for (const item of excel) {
      if (item == extname)
         return 'excel'
   }

   for (const item of ppt) {
      if (item == extname)
         return 'ppt'
   }

   for (const item of fileExtname) {
      if (item === extname) {
         return item
      }
   }

   return 'document'
}

const getDirObj = (p, callback) => {
   const fileArr = []   //文件对象数组
   const dirQueue = []  //路径队列
   var fileNum = 0  //文件计数


   //路径放入队列
   dirQueue.push(p)
   const baseUrlNames = p.split(path.sep)
   //路径文件夹名
   const parentPath = p.slice(0, p.length - baseUrlNames[baseUrlNames.length - 1].length)

   //parentId == '0',表示新上传文件夹,若存放在根路径则不变,根据路径id进行修改,
   fileArr.push({
      id: intformat(flakeIdGen.next(), 'dec'),
      name: baseUrlNames[baseUrlNames.length - 1],
      extname: 'folder',
      type: 'folder',
      absPath: p,            //'./'代表根目录
      relativePath: '.' + path.sep,   //插入数据库时,相对路径将会被替换为网络路径 即‘./’将会被替换为网盘根路径为/user/（‘hex’）ip@用户名
      size: 0,
      isDir: 1,
      parentId: '0',
   })
   while (dirQueue.length > 0) {
      const currPath = dirQueue.shift()
      // console.log(`当前目录: ${currPath}`);

      const fileList = fs.readdirSync(currPath, { encoding: 'utf8', withFileTypes: true })

      for (const item of fileList) {

         if (item.name == '.DS_Store')
            continue
         if (item.isDirectory()) {
            let dirAbsPath = path.join(currPath, item.name)
            dirQueue.push(dirAbsPath)
            fileArr.push({
               id: intformat(flakeIdGen.next(), 'dec'),
               name: item.name,
               extname: 'folder',
               type: 'folder',
               absPath: currPath,
               relativePath: currPath.replace(parentPath, '.' + path.sep),
               size: 0,
               isDir: 1,
            })
         } else {
            fileNum++
            //当前目录下的文件
            fileArr.push({
               id: intformat(flakeIdGen.next(), 'dec'),
               name: item.name,
               extname: path.extname(item.name),
               type: fileType(path.extname(item.name)),
               absPath: currPath,
               relativePath: currPath.replace(parentPath, '.' + path.sep),
               isDir: 0,
            })

         }
      }

   }
   //给文件夹内的路径添加parentId
   for (const i in fileArr) {
      for (const j in fileArr) {
         if (fileArr[i].absPath == fileArr[j].absPath + '/' + fileArr[j].name && fileArr[j].isDir == 1) {
            fileArr[i].parentId = fileArr[j].id
         }
      }
   }
   //第一层路径添加parentId
   for (const item of fileArr) {
      if (item.absPath == p)
         item.parentId = fileArr[0].id
   }
   fileArr[0].parentId = '0'

   for (const item of fileArr) {

      if (item.isDir == 0) {
        
         item.size = fs.statSync(`${item.absPath}/${item.name}`).size
        
      } else if (fileNum == 0) {
         item.md5 = '0'
         callback(fileArr)
      } else {
         item.md5 = '0'
      }

   }

   return fileArr

}


console.log(getDirObj('/Users/sanfu/Documents/file_share').length);


// const t1 = Date.now()
// pool.execute(getDirObj('/Users/sanfu/Documents/file_share')).then(res=>{
//    // console.log(res);
//    console.log(res.length);
//    console.log(Date.now()-t1);
// })