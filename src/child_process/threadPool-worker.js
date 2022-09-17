
const { ThreadWorker  } = require('poolifier')

function sub (data){
   while(data.length > 0)
      console.log(data.shift());
}

new ThreadWorker(sub,{maxInactiveTime: 1000})




// parentPort.on('message',res=>{
//    console.log(threadId);
//    console.log(res.data);
// })