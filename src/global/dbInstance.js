// const sqlite3 = require('sqlite3').verbose()
// const file = '../db/files.db'

// //单例模式
// class DB{
//    static db = null
//    constructor(){
//      this.db = new sqlite3.Database(file, err => {
//       if (err) {
//          console.log('数据库错误');
//          throw err
//       }
//       //表创建语句
//       const createTable = 'CREATE TABLE local_files(id VARCHAR(128) PRIMARY KEY,'
//          + 'filename VARCHAR(255),'
//          + 'filetype VARCHAR(30),'
//          + 'fileSize VARCHAR(64),'
//          + 'path TEXT,'
//          + 'modifyTime VARCHAR(100),'
//          + 'createTime VARCHAR(100),'
//          + 'user VARCHAR(100),'
//          + 'ip CHAR(15));'
//       this.db.serialize(() => {
   
//          const isExistTableSql = 'SELECT * FROM sqlite_master WHERE type="table" AND name = "local_files";'
//          this.db.get(isExistTableSql, (err, row) => {
//             if (err) throw err
   
//             if (typeof (row) == 'undefined') {
//                this.db.run(createTable)
//             }
//             console.log(row);
//          })
   
//       })
//       })
//    }
//    static getInstance(){
//       if(!DB.instance)
//          DB.instance = new DB()
//       return DB.instance
//    }

//    close(){
//       this.db.close()
//    }
//    getDB(){
//       return this.db
//    }
// }

// // let d1 = DB.getInstance('qq.com')
// // let d2 = DB.getInstance('360.com')

// // console.log(DB.instance);

// // console.log(d1 === d2);

// // let d1 = DB.getInstance()
// // let d2 = DB.getInstance()



// // console.log(d1 === d2)


// // module.exports = DB


// // let d1 = DB.getInstance()

// module.exports = DB.getInstance()