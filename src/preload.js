import { contextBridge, ipcRenderer } from 'electron';

const fileUtils = require('@/utils/fileUtils')
const userUtils = require('@/utils/userUtils')
const netUtils = require('@/utils/netUtils')
const LocalFiles = require('./entity/LocalFIles')
const User = require('./entity/User')
const FileShare = require('./entity/FileShare')

const localFiles = new LocalFiles()
const user = new User()
const fileShare = new FileShare()
contextBridge.exposeInMainWorld('fileOps', {
   isDir: (fileAbsPath) => {
      return fileUtils.isDir(fileAbsPath)
   },
   getExtname: (filename) => {
      return fileUtils.getExtname(filename)
   },
   saveDir: (user, dirAbsPath, curUrl) => {
      // fileUtils.getDirObj(dirAbsPath, (dirObj) => {
      //    localFiles.insertToLocalFiles(user, dirObj, curUrl)
      // })
      ipcRenderer.send('readDirAndinsertToDB',{user: user,dirAbsPath: dirAbsPath,curUrl: curUrl})
   },
   saveFile: (user, fileArrAbsPath, curUrl) => {
      fileUtils.getFileObj(fileArrAbsPath, (fileObjArr) => {
         localFiles.insertToLocalFiles(user, fileObjArr, curUrl)
      })
   },
   saveFilesObjOnMainProcess: () => ipcRenderer.invoke('saveFilesObj'),
   getFileObjName: (p) => fileUtils.getFileObjName(p)
})

contextBridge.exposeInMainWorld('userOps', {
   rootNetPath: (username) => {
      return netUtils.baseUrl(username)
   },
   getLocalIp: ()=>{
      return netUtils.getIpAddress().address
   },
   registerUser: (userInfo, callback) => {
      user.registerUser(userInfo, u => {
         callback(u)
      })
   },
   isExistUser: (callback) => {
      user.isExistUser((data) => {
         callback(data)
      })
   },
   md5ForPassword: (password) => {
      return userUtils.md5ForPassword(password)
   },
   isRegisterUser: (username, callback) => {
      user.isRegistered(username, i => {
         callback(i)
      })
   },
   signInUser: (username, callback) => {
      user.signInUser(username, data => {
         callback(data)
      })
   },
   getHomeTableData: (user, callback, parentId) => {
      localFiles.getPageData(user, data => {
         callback(data)
      }, parentId)
   },
   createNewFolder: (folderName, currtUrl, userId, callback) => {
      userUtils.createNewFolder(folderName, currtUrl, userId, data => {
         if (data == 200)
            callback(200)
         else
            callback(400)
      })
   },
   delFileObjArr: (fileIdArr, user, callback) => {
      userUtils.delFileObjArr(fileIdArr, user, data => {
         if (data == fileIdArr.length) {
            callback(200)
            ipcRenderer.send('share', user)
         }

      })
   },
   updateFilename: (fileObj, userId, newFileName, currNetPath, callback) => {
      userUtils.updateFileName(fileObj, userId, newFileName, currNetPath, data => {
         callback(data)
      })
   },
   updateUser: (attr, userId, newVal, callback) => {
      if (attr == 'avatar') {
         ipcRenderer.send('newAvatar', attr, userId)
         return
      }
      user.updateUser(attr, userId, newVal, data => {
         callback(data)
      })
   },
   getAllFolder: (user, callback, parentId) => {
      userUtils.getAllFolder(user, data => {
         callback(data)
      }, parentId)
   },
   moveFileObjArr: (fileObjArr, user, targetObj, callback) => {
      userUtils.moveFileObjArr(fileObjArr, user, targetObj, data => {
         callback(data)
      })
   },
   getClassifyFileData: (type, userId, offset, callback) => {
      userUtils.getClassifyFileData(type, userId, offset, data => {
         callback(data)
      })
   },
   getDocClassFileData: (userId, offset, callback) => {
      userUtils.getDocClassFileData(userId, offset, data => {
         callback(data)
      })
   },
   fileShare: (fileObjArr, user, callback, method = 0) => {
      fileShare.insertToFileShare(fileObjArr, user, data => {
         if (data.len == fileObjArr.length) {
            callback(data)
            ipcRenderer.send('share', user)
         }
      }, method)
   },
   getShareTableData: (user, offset, callback) => {
      userUtils.getShareTableData(user, offset, data => {
         callback(data)
      })
   },
   delFileObjArrOnFileShareTable: (user, fileObjArr, callback) => {
      userUtils.delFileObjArrOnFileShareTable(user, fileObjArr, data => {
         if (data == fileObjArr.length) {
            callback(data)
            ipcRenderer.send('share', user)
         }
      })
   },
   getRemoteFileListShareData: (callback) => {
      userUtils.getRemoteFileListShareData(data => {
         callback(data)
      })
   },
   notifyUserOnlineToLan: () => {
      ipcRenderer.send('ding')
   },
   getSearchData: (user, key, callback) => {
      userUtils.getSearchData(user, key, data => {
         callback(data)
      })
   },
   downloadItem: (val) => {
      ipcRenderer.send('download', val)
   },
   getDownloadingObj: () => {
      return fileUtils.getDownloadingObj()
   },
   recordDownloadingFile: (val) => {
      fileUtils.recordDownloadingFile(val)

   },
   downloadQueue: (callback) => ipcRenderer.on('downloadProgress', callback),
   removeDownloadProgressListener: () => {
      ipcRenderer.removeAllListeners('downloadProgress')
   },
   singlePause: (val) => ipcRenderer.send('singlePause', val),
   singleResume: (val) => ipcRenderer.send('singleResume', val),
   singleCancel: (val) => ipcRenderer.send('singleCancel', val),
   allPause: () => ipcRenderer.send('allPause', ''),
   allStart: () => ipcRenderer.send('allStart', ''),
   allCancel: () => ipcRenderer.send('allCancel', ''),
   delDownloadedQueueItem: (val) => ipcRenderer.send('delDownloadedQueueItem', val),
   getFstat: (path) => {
      return fileUtils.getFstat(path)
   },
   getDownloadedQueue: () => fileUtils.getDownloadedQueue()
})