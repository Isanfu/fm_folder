const http = require('http')
const url = require('url');
const fs = require('fs')
const path = require('path')
const { db } = require('../dbInstance/fileListInstance')
const LocalFIles = require('../entity/LocalFiles')
const userUtils = require('../utils/userUtils')


const localFiles = new LocalFIles()


console.log('创建http服务器');

//返回文件夹数据
const getFolderData = (userId, fileId, callback) => {

   const getFolderDataSql = "SELECT local_files.*,user.username FROM local_files "
      + "LEFT JOIN user ON local_files.userId = user.id WHERE local_files.parentId = " + fileId
      + " AND user.id = " + userId + " ORDER BY local_files.isDir DESC,local_files.modifyTime DESC;"

   db.all(getFolderDataSql, (err, data) => {
      if (err) throw err
      if (data.length == 0) {
         callback(0)
      } else
         callback(data)
   })
}
//获取文件夹中的文件信息
const getFileListInFolder = (userId, netPath, callback) => {
   const getFileListInFolderSql = `SELECT local_files.*,user.username FROM local_files LEFT JOIN user ON local_files.userId = user.id WHERE user.id = '${userId}' AND local_files.netPath LIKE '${netPath}%' AND local_files.isDir = 0;`
   db.all(getFileListInFolderSql, (err, data) => {
      if (err) throw err
      if (data.length == 0) {
         callback(0)
      } else
         callback(data)
   })
}

//获取文件信息
const getFileObj = (userId, fileId, callback) => {
   const getFileObjSql = "SELECT local_files.absPath,local_files.filename,local_files.fileSize,local_files.md5 FROM local_files "
      + "WHERE local_files.id = " + fileId + " AND local_files.userId = " + userId + ";"

   db.get(getFileObjSql, (err, data) => {
      if (err) throw err

      if (typeof data == 'undefined' || data.length == 0) {
         callback(0)
      } else
         callback(data)
   })
}





http.createServer((req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader('Accept-Ranges', 'bytes');
   const reqUrl = url.parse(req.url)
   console.log(reqUrl);
   try {
      const fileId = (reqUrl.pathname.split('/'))[2]
      // const userId = reqUrl.search.slice(1, reqUrl.search.length)
      const userId = reqUrl.query
      switch (((reqUrl.pathname.split('/'))[1])) {
         case 'getFolderData': {
            getFolderData(userId, fileId, data => {
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getFileListInFolder': {
            let postData = ''
            req.on('data', chunk => {
               postData += chunk
            })
            req.on('end', () => {
               const netPathObj = JSON.parse(postData)
               getFileListInFolder(userId, netPathObj.netPath, data => {
                  res.end(JSON.stringify(data))
               })

            })

         } break;
         case 'extBrowserDownloadFile': {
            //可以分享到外部浏览器下载，断点下载支持，safari仅支持https链接断点下载
            getFileObj(userId, fileId, data => {
               if (data != 0) {
                  res.setHeader('Content-MD5', data.md5)
                  res.setHeader('Content-Type', 'application/octet-stream');
                  // res.setHeader('COntent-Encoding','zip')
                  res.setHeader('Connection', 'keep-alive')
                  res.setHeader("Content-Disposition", `attachment;fileName=${encodeURIComponent(data.filename)}`)
                  if (typeof req.headers.range != 'undefined') {
                     let range = req.headers.range
                     range = range.slice(6, range.length)
                     const start = parseInt(range.split('-')[0])
                     const end = parseInt(range.split('-')[1])
                     //类型1: range：start-
                     if (isNaN(end)) {
                        console.log('类型1：start-');
                        res.setHeader('Content-Range', `bytes ${start}-/${data.fileSize}`)
                        res.setHeader('Content-Length', `${data.fileSize}-${start}`)
                        res.statusCode = 206
                        const fsStream = fs.createReadStream(path.join(data.absPath, data.filename), { start: start })
                        fsStream.pipe(res)
                     } else {
                        //类型2: range：start-end
                        console.log('类型2：start-end');
                        res.setHeader('Content-Length', end - start + 1)
                        res.setHeader('Content-Range', `bytes ${start}-${end}/${data.fileSize}`)
                        res.statusCode = 206
                        console.log(start, end);
                        const fsStream = fs.createReadStream(path.join(data.absPath, data.filename), { start: start, end: end })
                        fsStream.pipe(res)
                     }
                  } else {
                     res.setHeader('Content-Length', data.fileSize)
                     fs.createReadStream(path.join(data.absPath, data.filename)).pipe(res)
                  }
               } else {
                  res.end('not found file')
               }
            })
         } break;
         case 'mobileDeviceRequest': {
           
            const assets = reqUrl.pathname.split('/')[2]
            let filename = ''
            if( typeof reqUrl.pathname.split('/')[3] != 'undefined')
               filename = reqUrl.pathname.split('/')[3]

            if(assets != 'assets'){
               res.setHeader('Content-Type', 'text/html')
               fs.createReadStream('src/mobileDevicePage/dist/index.html').pipe(res)
            }

            switch(path.extname(filename)){
               case '.js':{
                  res.setHeader('Content-Type', 'text/javascript')
                  fs.createReadStream('src/mobileDevicePage/dist/assets/'+filename).pipe(res)
               }break;
               case '.css':{
                  res.setHeader('Content-Type', 'text/css')
                  fs.createReadStream('src/mobileDevicePage/dist/assets/'+filename).pipe(res)
               }break;
            }

         } break;
         case 'assets':{
            // console.log(reqUrl);
            let filename = reqUrl.pathname.split('/')[2]
            res.setHeader('Content-Type','image/svg+xml')
            fs.createReadStream('src/mobileDevicePage/dist/assets/'+filename).pipe(res)
         }break;
         case 'getPageData': {
            const user = { id: userId }
            localFiles.getPageData(user, data => {
               res.end(JSON.stringify(data))
            }, fileId)

         } break;
         case 'getRemoteFile': {
            //查询局域网文件
            userUtils.getRemoteFileListShareData(data=>{
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getClassifyData':{
            const query = reqUrl.query.split('?')
            const userId = query[0]
            const offset = parseInt(query[1]) 
            console.log(fileId,userId,offset);
            userUtils.getClassifyFileData(fileId,userId,offset,data=>{
               console.log(data);
               res.end(JSON.stringify(data))
            })
         }break;
         case 'getDocClassifyData':{
           const query = reqUrl.query.split('?')
           const userId = query[0]
           const offset = parseInt(query[1]) 
            userUtils.getDocClassFileData(userId,offset,data=>{
               res.end(JSON.stringify(data))
            })
         }break;
         case 'getSearchData':{
            console.log(reqUrl);
            const user = {
               id: userId
            }
            userUtils.getSearchData(user,fileId,data=>{
               console.log(data);
               res.end(JSON.stringify(data))
            })
         }break;
      }

   } catch (e) {
      console.log(e);
      res.end('url not correct')
   }
}).listen(9797)

process.on('SIGTERM', () => {
   console.log('httpServer进程退出');
   process.exit()
})