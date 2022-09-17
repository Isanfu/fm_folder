const { ThreadWorker } = require('poolifier')
const {Worker} = require('worker_threads')
const md5File = require('md5-file')

// console.log(getDirObj('/Users/sanfu/Downloads/test'));


function setFileMd5(dirObj){
   for (const item of dirObj) {
      if(item.isDir == 0)
      item.md5 = md5File.sync(`${item.absPath}/${item.name}`)

   }
   return dirObj
}


// console.log(getDir);

new ThreadWorker(setFileMd5)