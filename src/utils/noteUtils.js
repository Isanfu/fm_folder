const os = require('os')
const fs = require('fs')

//获取用户目录
const userDir = os.homedir() + '/fsnote'


//保存md笔记
const saveNote = (filename,text)=>{
   fs.mkdir(userDir,{ recursive: true }, err=>{
      if (err) throw err;
      fs.writeFile(userDir+`/${filename}.md`,text,(err)=>{
         if(err) throw err;
      })
   })
}



module.exports = {
   saveNote
}