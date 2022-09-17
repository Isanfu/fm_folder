const {db} = require('./dbConfig')
 const {promisify} =  require('util')
 const People = require('../entity/FileList')

// db.all('select * from file_share',(err,data)=>{
//    console.log(data);
// })

// db.run('CREATE TABLE abc(id INT(2))',(err)=>{
//    if (err) throw err
// })

const dbAll = promisify(db.all.bind(db))
new People().init()
dbAll('select * from file_share').then(res=>{
   console.log(res);
})