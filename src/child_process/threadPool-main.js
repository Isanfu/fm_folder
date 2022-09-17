const { FixedThreadPool  } = require('poolifier')

const pool = new FixedThreadPool(5,'/Users/sanfu/Desktop/file_share/src/child_process/threadPool-worker.js',{
   errorHandler: err=>{if(err) throw err},
   onlineHandler: ()=>{}
})

let ticket = [
   1,2,3,4,5,6,7,8,9,10
]


setTimeout(()=>{
  ticket = ticket.concat([11,12,13,14,15,16])
  pool.execute(ticket).then(res=>{
   console.log(res);
})
},2000)
pool.execute(ticket).then(res=>{
   console.log(res);
})