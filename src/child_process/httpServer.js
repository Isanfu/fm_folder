const http = require('http')
const url = require('url');
const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')
const userConfig = require('../config/userConfig')


const dbFile = userConfig.fileListDbPath


//返回文件夹数据
const getFolderData = (userId, fileId, callback) => {
   const db = new sqlite3.Database(dbFile, err => {
      if (err) throw err
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
   })
}
//获取文件夹中的文件信息
const getFileListInFolder = (userId,netPath,callback)=>{
   const db = new sqlite3.Database(dbFile,err=>{
      if (err) throw err
     const getFileListInFolderSql = `SELECT local_files.*,user.username FROM local_files LEFT JOIN user ON local_files.userId = user.id WHERE user.id = ${userId} AND local_files.netPath LIKE ${netPath}%;`
     db.all(getFileListInFolderSql,(err,data)=>{
      if (err) throw err
      if (data.length == 0) {
         callback(0)
      } else
         callback(data)
     } )

   })
}


console.log('创建http服务器');
//获取文件信息
const getFileObj = (userId, fileId, callback) => {
   const db = new sqlite3.Database(dbFile, err => {
      if (err) throw err
      const getFileObjSql = "SELECT local_files.absPath,local_files.filename,local_files.fileSize,local_files.md5 FROM local_files "
         + "WHERE local_files.id = " + fileId + " AND local_files.userId = " + userId + ";"

      db.get(getFileObjSql, (err, data) => {
         if (err) throw err

         if (typeof data == 'undefined' || data.length == 0) {
            callback(0)
         } else
            callback(data)
      })
   })
}



http.createServer((req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader('Accept-Ranges', 'bytes');
   const reqUrl = url.parse(req.url)
   try {
      console.log(reqUrl);
      const fileId = (reqUrl.pathname.split('/'))[2]
      const userId = reqUrl.search.slice(1, reqUrl.search.length)
      switch (((reqUrl.pathname.split('/'))[1])) {
         case 'getFolderData': {
           
            getFolderData(userId, fileId, data => {
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getFileListInFolder':{
            let postData = ''
            req.on('data',chunk=>{
               postData += chunk
            })

            req.on('end',()=>{
               const netPathObj = JSON.parse(postData)
               getFileListInFolder(userId,netPathObj.netPath,data=>{
                  res.end(data)
               })

            })
            
         }break;
         case 'extBrowserDownloadFile': {
            //可以分享到外部浏览器下载，断点下载支持，safari仅支持https链接断点下载
            getFileObj(userId, fileId, data => {
               if (data != 0) {
                  res.setHeader('Content-MD5', data.md5)
                  res.setHeader('Content-Type', 'application/octet-stream');
                  res.setHeader('Connection', 'keep-alive')
                  res.setHeader("Content-Disposition", `attachment;fileName=${data.filename}`)
                  if (typeof req.headers.range != 'undefined') {
                     let range = req.headers.range
                     range = range.slice(6, range.length)
                     const start = parseInt(range.split('-')[0])
                     const end = parseInt(range.split('-')[1])
                     //类型1: range：start-
                     if(isNaN(end)){ 
                        res.setHeader('Content-Range', `bytes ${start}-/${data.fileSize}`)
                        res.setHeader('Content-Length',`${data.fileSize}-${start}`)
                        res.statusCode = 206
                        fs.createReadStream(path.join(data.absPath, data.filename), {start: start}).pipe(res)
                     }else{
                        //类型2: range：start-end
                        res.setHeader('Content-Length', end - start + 1)
                        res.setHeader('Content-Range', `bytes ${start}-${end}/${data.fileSize}`)
                        res.statusCode = 206
                        fs.createReadStream(path.join(data.absPath, data.filename), { start: start, end: end }).pipe(res)
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
      }

   } catch (e) {
      console.log(e);
      res.end('url not correct')
   }



}).listen(9797)