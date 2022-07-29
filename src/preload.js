import {contextBridge,ipcRenderer } from 'electron';

const noteUtils  = require('@/utils/noteUtils')
const fileUtils = require('@/utils/fileUtils')
const dbUtils = require('@/utils/dbUtils')


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
   saveDir: (dirAbsPath)=>{
      fileUtils.getDirObj(dirAbsPath,(dirObj)=>{
            dbUtils.insertFileObjToDB(dirObj)
      })
   },
   saveFile: (fileArrAbsPath)=>{
      fileUtils.getFileObj(fileArrAbsPath,(fileObjArr)=>{
         dbUtils.insertFileObjToDB(fileObjArr)
      })
   }
})