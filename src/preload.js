import {contextBridge,ipcRenderer } from 'electron';

const noteUtils  = require('@/utils/noteUtils')
const fileUtils = require('@/utils/fileUtils')
const dbUtils = require('@/utils/dbUtils')
const userUtils = require('@/utils/userUtils')


contextBridge.exposeInMainWorld('noteOps',{
   newNote: ()=>{
      ipcRenderer.send('newNote','open')
   },
   saveNote: (filename,text)=>{
      noteUtils.saveNote(filename,text)
   },
})

contextBridge.exposeInMainWorld('fileOps',{
   isDir: (fileAbsPath)=>{
      return fileUtils.isDir(fileAbsPath)
   },
   saveDir: (user,dirAbsPath)=>{
      fileUtils.getDirObj(dirAbsPath,(dirObj)=>{
            dbUtils.insertFileObjToDB(user,dirObj)
      })
   },
   saveFile: (user,fileArrAbsPath)=>{
      fileUtils.getFileObj(fileArrAbsPath,(fileObjArr)=>{
         dbUtils.insertFileObjToDB(user,fileObjArr)
      })
   }
})

contextBridge.exposeInMainWorld('userOps',{
   registerUser: (user,callback)=>{
      userUtils.registerUser(user,u=>{
         callback(u)
      })
   },
   isExistUser: (callback)=>{
      userUtils.isExistUser((data)=>{
         callback(data)
      })
   },
   md5ForPassword: (password)=>{
      return userUtils.md5ForPassword(password)
   },
   isRegisterUser: (username,callback)=>{
      userUtils.isRegisterUser(username,i=>{
         callback(i)
         console.log(i);
      })
   },
   signInUser: (username,callback)=>{
      userUtils.signInUser(username,data=>{
         callback(data)
      })
   },
   getHomeTableData: (user,callback,parentId)=>{
      userUtils.getHomeTableData(user,data=>{
         callback(data)
      },parentId)
   }
})