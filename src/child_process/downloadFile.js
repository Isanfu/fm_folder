const fs = require('fs')
const path = require('path')
const http = require('http')
const userConfig = require('../config/userConfig')
const os = require('os')
const logger = require('electron-log')
const EventEmitter = require('events');

class DownloadEmitter extends EventEmitter { }
const downloadEmitter = new DownloadEmitter()

process.setMaxListeners(0)

logger.info(`download process start...`)

var awaitDownloadQueue = []  //等待下载队列
var downloadingQueue = []  //下载中队列
var recordDownloadingQueue = []  //记录下载中队列
var recordRequestingQueue = []  //记录下载中的请求对象
var pauseDownloadQueue = [] //暂停队列
var downloadedQueue = [] //下载完成队列
var recordDownloadedQueue = []  //记录下载完成队列

//记录pauseDownloadQueue
downloadEmitter.on('updatePauseDownloadQueue', () => {
   fs.writeFileSync(process.env.NODE_ENV == "development" ?'src/file_broadcast/recordPauseDownloadQueue.json':path.join(__dirname,'../file_broadcast/recordPauseDownloadQueue.json'), JSON.stringify(pauseDownloadQueue))
})
//记录downloadedQueue
downloadEmitter.on('updateDownloadedQueue', () => {
   fs.writeFileSync(process.env.NODE_ENV == "development" ?'src/file_broadcast/recordDownloadedFile.json':path.join(__dirname,'../file_broadcast/recordDownloadedFile.json'), JSON.stringify(recordDownloadedQueue))
})


/**
 * 递归创建文件夹
 * @param {*} dirpath 文件夹路径
 */
function mkdirs(dirpath) {
   if (!fs.existsSync(dirpath)) {
      if (!fs.existsSync(path.dirname(dirpath))) {
         mkdirs(path.dirname(dirpath));
      }
      fs.mkdirSync(dirpath);
   }
}
//获取文件对象在队列中的下标
function getIndexOfQueue(queue, val) {
   return queue.findIndex(item => {
      return val.userId == item.userId && val.fileId == item.fileId
   })

}


/**
 * 文件下载，支持断点续传
 */
function downloadFile() {
   while (downloadingQueue.length > 0 && recordDownloadingQueue.length < 2) {
      const downloadItem = downloadingQueue.shift()
      downloadItem.downloadStatus = 'downloading'
      recordDownloadingQueue.push(downloadItem)   //加入记录下载队列
      console.log('文件大小' + downloadItem.fileSize);
         let options = {
            timeout: 100000,
            headers: {
               'Range': `bytes=${downloadItem.start}-${parseInt(downloadItem.fileSize) - 1}`
            }
         }
         const req = http.get(`http://${downloadItem.ip}:9797/extBrowserDownloadFile/${downloadItem.fileId}?${downloadItem.userId}`, options, res => {
            console.log('开启下载：', downloadItem.filename);
            //记录请求对象
            recordRequestingQueue.push(req)
            let basePath = userConfig.downloadFileUrl

            if (downloadItem.downloadType == 'folder') {
               let relativePath = downloadItem.relativePath
               os.platform != 'win32' ? relativePath = relativePath.replaceAll('\\', '/') : relativePath = relativePath.replaceAll('/', '\\')
               mkdirs(path.join(basePath, relativePath))
               basePath = path.join(basePath, relativePath)
            }
            let fsStream = fs.createWriteStream(path.join(basePath, './' + downloadItem.filename), { flags: 'a', start: downloadItem.start })
            downloadItem.downloadUrl = path.join(basePath, './' + downloadItem.filename)
            res.pipe(fsStream)


            res.on('end', () => {
               console.log('文件下载完成：' + downloadItem.filename);
               downloadItem.downloadStatus = 'downloaded'

            })
            res.on('close', () => {

               console.log('链接关闭：' + downloadItem.filename);
               if (downloadItem.downloadStatus != 'pause') {
                  downloadItem.downloadStatus = 'downloaded'
                  downloadedQueue.push(downloadItem)
                  recordDownloadedQueue.push(downloadItem)
                  downloadEmitter.emit('updateDownloadedQueue')  //记录已下载文件放入文件中

                  //下载完成后连接断开，从正在下载队列删除
                  const idx_downloaded = getIndexOfQueue(recordDownloadingQueue, downloadItem)
                  recordDownloadingQueue.splice(idx_downloaded, 1)
               }

               //删除请求对象
               for (let i = 0; i < recordRequestingQueue.length; i++) {
                  const reqUrl = new URL(recordRequestingQueue[i].path, `http://${recordRequestingQueue[i].host}:9797`)
                  const fileId = (reqUrl.pathname.split('/'))[2]
                  const userId = reqUrl.search.slice(1, reqUrl.search.length)
                  if (downloadItem.userId == userId && downloadItem.fileId == fileId) {
                     recordRequestingQueue.splice(i, 1)
                  }
               }
               if (recordDownloadingQueue.length == 0 && awaitDownloadQueue.length == 0) {
                  console.log('全部下载任务完成');
               }
               //等待队列不为空
               if (awaitDownloadQueue.length > 0) {
                  downloadingQueue.push(awaitDownloadQueue.shift())
                  downloadFile()
               }
            })
         })
   }
}




//单个暂停
function singlePause(val) {
   //下载中暂停
   switch (val.downloadStatus) {
      case 'downloading': {
         console.log('暂停下载1');
         for (let i = 0; i < recordRequestingQueue.length; i++) {
            const reqUrl = new URL(recordRequestingQueue[i].path, `http://${recordRequestingQueue[i].host}:9797`)
            const fileId = (reqUrl.pathname.split('/'))[2]
            const userId = reqUrl.search.slice(1, reqUrl.search.length)
            if (val.userId == userId && val.fileId == fileId) {
               recordRequestingQueue[i].abort()
               recordRequestingQueue.splice(i, 1)
               const idx_recordDownloading = getIndexOfQueue(recordDownloadingQueue, val)
               recordDownloadingQueue[idx_recordDownloading].downloadStatus = 'pause'
               recordDownloadingQueue[idx_recordDownloading].start = recordDownloadingQueue[idx_recordDownloading].downloadedSize - 1
               pauseDownloadQueue.push(recordDownloadingQueue[idx_recordDownloading])
               recordDownloadingQueue.splice(idx_recordDownloading, 1)  //从正在下载队列删除
            }
         }
      } break;
      //等待队列暂停
      case 'await': {
         console.log('暂停下载2');
         const idx_await = getIndexOfQueue(awaitDownloadQueue, val)
         awaitDownloadQueue[idx_await].downloadStatus = 'pause'
         pauseDownloadQueue.push(awaitDownloadQueue[idx_await])
         awaitDownloadQueue.splice(idx_await, 1)
      } break;
   }
}

//单个继续
function singleResume(val) {
   if (pauseDownloadQueue.length > 0) {
      const idx_pause = getIndexOfQueue(pauseDownloadQueue, val)
      pauseDownloadQueue[idx_pause].downloadStatus = 'await'
      awaitDownloadQueue.push(pauseDownloadQueue[idx_pause])   //暂停队列添加到等待队列头
      pauseDownloadQueue.splice(idx_pause, 1)
      if (recordDownloadingQueue.length < 2) {   //正在下载队列为空，需要重新启动下载，其它情况只需加入等待队列即可
         let i = 0
         while (awaitDownloadQueue.length > 0 && i < 2) {
            i++
            downloadingQueue.push(awaitDownloadQueue.shift())
         }
         downloadFile()
      }


   }
}

//单个取消
function singleCancel(val) {
   switch (val.downloadStatus) {
      case 'downloading': {
         console.log('正在下载队列取消', val.filename);
         for (let i = 0; i < recordRequestingQueue.length; i++) {
            const reqUrl = new URL(recordRequestingQueue[i].path, `http://${recordRequestingQueue[i].host}:9797`)
            const fileId = (reqUrl.pathname.split('/'))[2]
            const userId = reqUrl.search.slice(1, reqUrl.search.length)
            if (val.userId == userId && val.fileId == fileId) {
               recordRequestingQueue[i].abort()
               recordRequestingQueue.splice(i, 1)
            }
         }
      } break;
      case 'pause': {
         console.log('暂停队列取消', val.filename);
         const idx_pause = getIndexOfQueue(pauseDownloadQueue, val)
         pauseDownloadQueue.splice(idx_pause, 1)
      } break;
      case 'await': {
         console.log('等待队列取消', val.filename);
         const idx_await = getIndexOfQueue(awaitDownloadQueue, val)
         awaitDownloadQueue.splice(idx_await, 1)

      } break;
   }
}
//全部暂停
function allPause() {
   //下载中暂停
   if (recordRequestingQueue.length > 0)
      for (const item of recordRequestingQueue) {
         item.abort()
      }

   while (recordDownloadingQueue.length > 0) {
      let tmp = recordDownloadingQueue.shift()
      tmp.downloadStatus = 'pause'
      pauseDownloadQueue.push(tmp)
   }

   //等待队列暂停
   while (awaitDownloadQueue.length > 0) {
      let tmp = awaitDownloadQueue.shift()
      tmp.downloadStatus = 'pause'
      pauseDownloadQueue.push(tmp)
   }
}
//全部开始
function allStart() {
   while (pauseDownloadQueue.length > 0) {
      let tmp = pauseDownloadQueue.shift()
      tmp.downloadStatus = 'await'
      awaitDownloadQueue.push(tmp)

      if (recordDownloadingQueue.length < 2) {   //正在下载队列不足时，需要重新启动下载，其它情况只需加入等待队列即可
         let i = 0
         while (awaitDownloadQueue.length > 0 && i < 2) {
            i++
            downloadingQueue.push(awaitDownloadQueue.shift())
         }
         downloadFile()
      }

   }
}
//全部取消
function allCancel() {
   while (recordRequestingQueue.length > 0) {
      let tmp = recordRequestingQueue.shift()
      tmp.abort()
   }
   while (recordDownloadingQueue.length > 0) {
      recordDownloadingQueue.shift()
   }
   while (awaitDownloadQueue.length > 0)
      awaitDownloadQueue.shift()

   while (pauseDownloadQueue.length > 0)
      pauseDownloadQueue.shift()
}


//下载速度
setInterval(() => {
   let arr = []
   for (const item of recordDownloadingQueue) {
      if (fs.existsSync(item.downloadUrl)) {
         const fstat = fs.statSync(item.downloadUrl)
         let t = item.downloadedSize
         item.downloadedSize = fstat.size
         item.downloadSpeed = item.downloadedSize - t
         item.downloadPercentage = parseFloat((fs.statSync(item.downloadUrl).size / item.fileSize * 100).toFixed(1))
         t = item.downloadedSize
      }
   }
   arr = arr.concat(recordDownloadingQueue)
   arr = arr.concat(awaitDownloadQueue)
   arr = arr.concat(pauseDownloadQueue)
   arr = arr.concat(downloadedQueue)
   process.send(arr)
   if (downloadedQueue.length > 0)
      downloadedQueue.shift()
   
}, 1000)






//从recordDownloadedQueue中删除一个
function delDownloadedQueueItem(val) {
   const idx_recordDownloading = getIndexOfQueue(recordDownloadedQueue, val)
   recordDownloadedQueue.splice(idx_recordDownloading, 1)
   downloadEmitter.emit('updateDownloadedQueue')
}
//文件大小为0，直接创建
function createZeroSizeFile(downloadItem) {
   let basePath = userConfig.downloadFileUrl
   if (downloadItem.downloadType == 'folder') {
      let relativePath = downloadItem.relativePath
      os.platform != 'win32' ? relativePath = relativePath.replaceAll('\\', '/') : relativePath = relativePath.replaceAll('/', '\\')
      mkdirs(path.join(basePath, relativePath))
      basePath = path.join(basePath,relativePath)
   }
   fs.writeFileSync(path.join(basePath, './' + downloadItem.filename),'')
   downloadItem.downloadStatus = 'downloaded'
   downloadItem.downloadUrl = path.join(basePath, './' + downloadItem.filename)
   downloadedQueue.push(downloadItem)
   recordDownloadedQueue.push(downloadItem)
   downloadEmitter.emit('updateDownloadedQueue')
   
}

process.on('message', msg => {
   switch (msg.type) {
      case 'start': {
         if (awaitDownloadQueue.length == 0 && recordDownloadingQueue.length < 2) {
            msg.data.forEach(element => {
               if(element.fileSize > 0)
               awaitDownloadQueue.push(element)
               else
               createZeroSizeFile(element)
            });
            console.log('正在下载队列长度：' + recordDownloadingQueue.length);
            let i = 0
            while (awaitDownloadQueue.length > 0 && i < 2) {
               i++
               downloadingQueue.push(awaitDownloadQueue.shift())
            }
            downloadFile()
         } else {
            console.log('添加到下载进程');
            msg.data.forEach(element => {
               awaitDownloadQueue.push(element)
            });
         }
      } break;
      case 'singlePause': {
         console.log('暂停下载：' + msg.data.filename);
         singlePause(msg.data)
      } break;
      case 'singleResume': {
         console.log('继续下载：' + msg.data.filename);
         singleResume(msg.data)
      } break;
      case 'delDownloadedQueueItem': {
         console.log('删除已下载项', msg.data.filename);
         delDownloadedQueueItem(msg.data)
      } break;
      case 'singleCancel': {
         console.log('取消下载：', msg.data.filename);
         singleCancel(msg.data)
      } break;
      case 'allPause': {
         console.log('全部暂停');
         allPause()
      } break;
      case 'allStart': {
         console.log('全部开始');
         allStart()
      } break;
      case 'allCancel': {
         console.log('全部取消');
         allCancel()
      }
   }
})

/**
 * 文件下载进程退出
 * 若等待队列，正在下载队列还有任务全推到暂停队列，并进行持久化保存
 * 
*/
process.on('SIGTERM', () => {
   logger.info(`download process exit`)
   console.log('downloadFile进程退出');
   allPause()
   downloadEmitter.emit('updatePauseDownloadQueue')
   process.exit()
})