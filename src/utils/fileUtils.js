const fs = require('fs');
const crypto = require('crypto');
const path = require('path')
const netUtils = require('./netUtils')
const moment = require('moment');
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')
const md5File = require('md5-file')

//获取文件的md5值
const getFileMd5 = (filePath, callback) => {
   const stream = fs.createReadStream(filePath);
   const hash = crypto.createHash('md5');
   stream.on('data', chunk => {
      hash.update(chunk, 'utf8');
   });
   stream.on('end', () => {
      const md5 = hash.digest('hex');
      stream.destroy()
      callback(md5)
   });
}
//判断路径是否为文件夹
const isDir = (p) => {
   return fs.statSync(p).isDirectory()
}


//使用ip后两段网址作为雪花id的workdId
const realIp = netUtils.getIpAddress()
const ipArr = realIp.split('.')
const flakeIdGen = new FlakeId({ worker: parseInt(ipArr[2]) + parseInt(ipArr[3]) });

//获取文件对象
const getFileObj = (filePathArr, callback) => {
   const fileObjArr = []
   let count = 0
   filePathArr.forEach(filePath => {
      const filename = path.basename(filePath)
      const fileUri = filePath.slice(0, filePath.length - filename.length - 1)
      getFileMd5(filePath, md5 => {
         count++
         const fstat = fs.statSync(filePath)
         fileObjArr.push ({
            id: intformat(flakeIdGen.next(), 'dec'),
            name: filename,
            extname: path.extname(filePath),
            absPath: fileUri,
            relativePath: './',
            parentId: '0',
            isDir: 0,
            md5: md5,
            size: fstat.size
         })
         if(count == filePathArr.length)
            callback(fileObjArr)
      })
   });
  
}

//BFS遍历目录
const getDirObj = (p, callback) => {
   const fileArr = []   //文件对象数组
   const dirQueue = []  //路径队列
   var fileNum = 0  //文件计数
   

   //路径放入队列
   dirQueue.push(p)
   const baseUrlNames = p.split(path.sep)
   
   const parentPath = p.slice(0,p.length - baseUrlNames[baseUrlNames.length - 1].length)

   //parentId == '0'，表示新上传文件夹，若存放在根路径则不变，根据路径id进行修改，
   fileArr.push({
      id: intformat(flakeIdGen.next(), 'dec'),
      name: baseUrlNames[baseUrlNames.length - 1],
      extname: 0,
      absPath: p,
      relativePath: '/',   //插入数据库时，相对路径将会被替换为网络路径 即‘./’将会被替换为网盘根路径为/user/（‘hex’）ip@用户名
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
               extname: 0,
               absPath: currPath,
               relativePath: currPath.replace(parentPath, './'),
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
               absPath: currPath,
               relativePath: currPath.replace(parentPath, './'),
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

   console.log('parentPAth：'+parentPath);
   //文件数量
   // console.log(fileNum);
   // const t1 = Date.now()
   // const fdArr = []
   //给数组中的文件对象添加md5属性，文件夹的md5值为0
   var count = 0
   for (const item of fileArr) {

      if (item.isDir == 0) {
         getFileMd5(`${item.absPath}/${item.name}`, md5 => {
            item.md5 = md5
            count++
            //异步处理
            // fs.open(`${item.absPath}/${item.name}`, (err, fd) => {
            //    if (err) throw err
            //    count++
            //    fs.fstat(fd, (err, fstat) => {
            //       if (err) throw err
            //       item.size = fstat.size

            //       fs.close(fd,()=>{})

            //       //TODO 性能优化
            //       // fdArr.push(fd)
            //       // if(fdArr.length>200){
            //       //    fdArr.forEach(fdItem=>{
            //       //       fs.close(fdItem)
            //       //    })
            //       //    fdArr.splice(0,fdArr.length)
            //       // }
            //    })
            //     //当回调执行次数等于文件数量时回调文件数组
            //    if (count == fileNum) {
            //       console.log(Date.now()-t1);
            //       callback(fileArr)
            //    }
            // })
            fstat = fs.statSync(`${item.absPath}/${item.name}`)
            item.size = fstat.size
            if (count == fileNum) {
               // console.log(Date.now()-t1);
               callback(fileArr)
            }

         })

      } else {
         item.md5 = '0'
      }

   }

}


// const p = '/Users/sanfu/Downloads/d1'
// getDirObj(p,fileArr=>{
//    console.log(fileArr);
// })



// getFileObj(p,obj=>{
//    console.log(obj);
// })
// const t1 = Date.now()
// getFileMd5(p,(md5)=>{
//    console.log(md5);
//    console.log(Date.now()-t1);
// })

// md5File(p).then(hash=>{
//    console.log(hash);
//    console.log(Date.now()-t1);
// })

// const hash = md5File.sync(p)
// console.log(hash);
// console.log(Date.now()-t1);




module.exports = {
   getDirObj,
   getFileMd5,
   getFileObj,
   isDir
}



// const insertDB = (filename,filePath,fileSize) => {


//          //文件路径
//          const fileUri = filePath.slice(0, filePath.length - filename.length)
//          //文件扩展名
//          const fileExtname = path.extname(filePath)

//          //文件md5值
//          const fileStream = fs.createReadStream(filePath)

//          const fileMd5 = crypto.createHash('md5')

//          fileStream.on('data', (data) => {
//             fileMd5.update(data)
//          })


//          fileStream.on('end', () => {
//             let md5 = fileMd5.digest('hex')
//             const createTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
//             const modifyTime = createTime
//             const ip = netUtils.getIpAddress()

//             console.log(md5,filename,fileExtname,fileUri,createTime,modifyTime,'local',ip,fileSize);

//          })   

// }

// const filepath = '/Users/sanfu/Downloads/demo'
// const arr = []


// //递归遍历目录
// const getAllFileFromDir = (p) => {
//    const tp = p
//    //读取目录下所有文件
//    const files = fs.readdirSync(tp, { encoding: 'utf8', withFileTypes: true })

//    files.forEach(item => {
//       if (item.name == '.DS_Store')
//          return

//       if (item.isDirectory()) {
//          p = tp + '/' + item.name
//          console.log(p);
//          getAllFileFromDir(p)
//       } else {

//          let arrItem = {
//             name: item.name,
//             path: p + '/',
//             type: 'file'
//          }
//          arr.push(arrItem)

//       }
//    })
// }
