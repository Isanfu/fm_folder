const http = require('http')
const url = require('url');
const fs = require('fs')
const path = require('path')
const LocalFiles = require('../entity/LocalFiles')
const userUtils = require('../utils/userUtils')
const localFiles = new LocalFiles()
const logger = require('electron-log')

console.log(process.env.NODE_ENV);

logger.info(`httpServer process start; port: 9797`)

http.createServer((req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader('Accept-Ranges', 'bytes');
   const reqUrl = url.parse(req.url)
   try {
      const fileId = (reqUrl.pathname.split('/'))[2]
      const userId = reqUrl.query
      switch ((reqUrl.pathname.split('/'))[1]) {
         case 'getFolderData': {
            const user = {
               id: userId
            }
            localFiles.getPageData(user, data => {
               res.end(JSON.stringify(data))
            }, fileId)
         } break;
         case 'getFileListInFolder': {
            let postData = ''
            req.on('data', chunk => {
               postData += chunk
            })
            req.on('end', () => {
               const netPathObj = JSON.parse(postData)
               localFiles.getFileListInFolder(userId, netPathObj.netPath, data => {
                  res.end(JSON.stringify(data))
               })

            })

         } break;
         case 'extBrowserDownloadFile': {
            //可以分享到外部浏览器下载，断点下载支持，safari仅支持https链接断点下载
            localFiles.getFileObj(userId, fileId, data => {
               if (data != 0) {
                  res.setHeader('Content-MD5', data.md5)
                  res.setHeader('Content-Type', 'application/octet-stream');
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
            logger.info(JSON.stringify(reqUrl))
            const assets = reqUrl.pathname.split('/')[2]
            let filename = ''
            if (typeof reqUrl.pathname.split('/')[3] != 'undefined')
               filename = reqUrl.pathname.split('/')[3]

            if (assets != 'assets') {
               logger.info(assets)
               res.setHeader('Content-Type', 'text/html')
               fs.createReadStream(process.env.NODE_ENV == "development" ? 'src/mobileDevicePage/dist/index.html' : path.join(__dirname, '../mobileDevicePage/dist/index.html')).pipe(res)
            }
            logger.info(filename)
            switch (path.extname(filename)) {
               case '.js': {
                  res.setHeader('Content-Type', 'text/javascript')
                  fs.createReadStream(process.env.NODE_ENV == "development" ? 'src/mobileDevicePage/dist/assets/' + filename : path.join(__dirname, '../mobileDevicePage/dist/assets/' + filename)).pipe(res)
               } break;
               case '.css': {
                  res.setHeader('Content-Type', 'text/css')
                  fs.createReadStream(process.env.NODE_ENV == "development" ? 'src/mobileDevicePage/dist/assets/' + filename : path.join(__dirname, '../mobileDevicePage/dist/assets/' + filename)).pipe(res)
               } break;
            }
         } break;
         case 'assets': {
            logger.info(JSON.stringify(reqUrl))
            let filename = reqUrl.pathname.split('/')[2]
            res.setHeader('Content-Type', 'image/svg+xml')
            fs.createReadStream(process.env.NODE_ENV == "development" ? 'src/mobileDevicePage/dist/assets/' + filename : path.join(__dirname, '../mobileDevicePage/dist/assets/' + filename)).pipe(res)
         } break;
         case 'getPageData': {
            const user = { id: userId }
            localFiles.getPageData(user, data => {
               res.end(JSON.stringify(data))
            }, fileId)

         } break;
         case 'getRemoteFile': {
            //查询局域网文件
            userUtils.getRemoteFileListShareData(data => {
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getClassifyData': {
            const query = reqUrl.query.split('?')
            const userId = query[0]   //覆盖顶部userId
            const offset = parseInt(query[1])
            userUtils.getClassifyFileData(fileId, userId, offset, data => {
               console.log(data);
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getDocClassifyData': {
            const query = reqUrl.query.split('?')
            const userId = query[0]
            const offset = parseInt(query[1])
            userUtils.getDocClassFileData(userId, offset, data => {
               res.end(JSON.stringify(data))
            })
         } break;
         case 'getSearchData': {
            console.log(reqUrl);
            const user = {
               id: userId
            }
            userUtils.getSearchData(user, fileId, data => {
               res.end(JSON.stringify(data))
            })
         } break;
      }
   } catch (e) {
      logger.error(`faild to request; caused by: `, e)
      res.end('url not correct')
   }
}).listen(9797)
process.on('SIGTERM', () => {
   console.log('httpServer进程退出');
   process.exit()
})