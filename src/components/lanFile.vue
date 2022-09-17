<template>
   <div id="mainContainer">
      <div id="mainHeader">
         <el-button round icon="el-icon-upload" style="background-color: rgb(23,55,245); color: #fff;"
            @click="saveFilesObjOnMainProcess">文件上传
         </el-button>
         <el-button-group style="margin-left: 20px" v-show="topMenu">
            <el-button size="small" round @click="downloadMultipleFile">下载</el-button>
         </el-button-group>

      </div>
      <div id="mainBody">

         <div id="fileItemAndFileOps">
            <span>
               <span v-if="multipleSelection.length == 0" style="margin-left: 10px;">
                  文件项 <span style="color: #909399;font-size:medium;margin-left: 3px;">{{ tableData.length }}</span>
               </span>
               <span v-else>
                  已选项
                  <span style="color: #909399;font-size:medium;margin-left: 3px;">
                     {{ multipleSelection.length }}
                  </span>
               </span>

               <div style="float: right;">

                  <div style="float: right;">
                     <el-tooltip content="刷新" placement="bottom" :open-delay=500>
                        <img :src="require(`@/assets/icons/refresh.svg`)"
                           style="padding-top: 3px;height: 17px;width: 17px;margin-right: 30px;cursor:pointer;"
                           @click="getCurrTableData" />
                     </el-tooltip>

                  </div>

               </div>
            </span>
         </div>


         <el-table @row-dblclick="doubleClickCurrRow" highlight-current-row @current-change="currRow"
            :cell-style="{ padding: '2px 0' }" ref="multipleTable" :data="tableData" tooltip-effect="dark"
            style="width: 100%;margin-top: 100px;" @cell-mouse-enter="showMenu" v-el-table-infinite-scroll="load"
            :infinite-scroll-disabled="false" :height="tableHeight"
            :default-sort="{ prop: 'fileName', order: 'ascending' }" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45">
            </el-table-column>
            <el-table-column prop="fileName" sortable label="文件名" width="500">
               <template slot-scope="scope">

                  <div slot="reference" class="name-wrapper" style="width: 100%"
                     @mouseenter.middle="showMenu(scope.row.rowId)">
                     <el-button type="text" size="medium" style="cursor: default;">
                        <div id="filename-parent">
                           <img class="icon-like" :src="require(`@/assets/icons/${scope.row.filetype}.svg`)" alt=""
                              srcset="">
                           <div class=" item-color filename-child">
                              <span @click="getChildTableData(scope.row)" style="cursor: pointer;">&nbsp;&nbsp;{{
                              scope.row.filename
                              }}</span>
                           </div>
                        </div>
                     </el-button>
                     <!-- 表格行菜单显示-->
                     <div :id="scope.row.rowId" class="item-btn">
                        <el-tooltip content="下载" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <i class="el-icon-download" @click="downloadFile(scope.row)"></i>
                           </el-button>
                        </el-tooltip>

                     </div>
                  </div>
               </template>
            </el-table-column>
            <el-table-column prop="fileSize" sortable label="大小" width="150">
            </el-table-column>
            <el-table-column prop="modifyTime" sortable label="修改时间" width="200">
            </el-table-column>
            <el-table-column prop="username" sortable label="用户" show-overflow-tooltip>
            </el-table-column>

         </el-table>
      </div>
   </div>
</template>

<script>

export default {
   name: "lanFile",
   data() {
      return {
         loading: true,
         tableData: [],
         multipleTable: [],
         multipleSelection: [],
         currTopBarVal: this.$root.$data.topBar,
         userInfo: this.$cookies.get('userInfo'),
         isTopBar: true,
         singleTmpFileObjArr: [],  //临时记录
         namesakeWarmingDialog: false,
         recordNamesakeFileObj: [],
         recordNamesakeFileObjOnTableData: [],
         page: 1,
         i: 21,
         tableHeight: undefined,
      }
   },
   watch: {
      currTopBarVal: function () {
         this.getCurrTableData()
      },
   },
   methods: {
      //打开主进程文件对话框
      saveFilesObjOnMainProcess() {
         window.fileOps.saveFilesObjOnMainProcess().then(res => {
            console.log(res);

            let namesakeFileObjArr = []
            res.forEach(itemA => {
               this.tableData.forEach(itemB => {
                  if (window.fileOps.getFileObjName(itemA) == itemB.filename) {
                     this.recordNamesakeFileObjOnTableData.push(itemB)
                     namesakeFileObjArr.push({
                        name: window.fileOps.getFileObjName(itemA),
                        path: itemA
                     })
                  }
               })
            });
            if (namesakeFileObjArr.length > 0) {
               this.namesakeWarmingDialog = true
               this.recordNamesakeFileObj = namesakeFileObjArr
            }
            //不同名文件，可以直接插入
            const unNamesake = res.filter(itemA => {
               return namesakeFileObjArr.every(itemB => {
                  return itemB.name != window.fileOps.getFileObjName(itemA)
               })
            })
            const filePathArr = []
            const len = this.$root.$data.topBar.length
            //插入文件
            for (const item of unNamesake) {
               if (window.fileOps.isDir(item))
                  window.fileOps.saveDir(this.userInfo, item, this.$root.$data.topBar[len - 1])
               else
                  filePathArr.push(item)
            }
            window.fileOps.saveFile(this.userInfo, filePathArr, this.$root.$data.topBar[len - 1])

         })

      },
      //鼠标移入显示菜单
      showMenu(tableItem) {
         const m = document.getElementById(tableItem.rowId)
         if (m !== null)
            m.style.visibility = 'visible'

         let len = this.tableData.length

         for (let i = 1; i <= len; i++) {
            if (('row' + i) !== tableItem.rowId) {
               let tmpId = document.getElementById('row' + i)
               tmpId.style.visibility = 'hidden'
            }
         }
      },
      currRow(val) {
         this.tableData.forEach(item => {
            if (item == val)
               this.$refs.multipleTable.toggleRowSelection(val, true)
            else
               this.$refs.multipleTable.toggleRowSelection(item, false)
         })
      },
      doubleClickCurrRow(row) {
         console.log(row);
      },
      handleSelectionChange(val) {
         this.multipleSelection = val;
      },
      getCurrTableData() {
         const len = this.$root.$data.topBar.length
         if (this.currTopBarVal[len - 1].key == '0') {
            window.userOps.getRemoteFileListShareData(data => {
               for (const item of data) {
                  const netPathArr = item.netPath.split('/')
                  const userUrlLen = netPathArr[1].length + netPathArr[2].length + 2
                  item.relativePath = '.' + item.netPath.slice(userUrlLen, item.netPath.length)
               }
               this.initTableData = JSON.parse(JSON.stringify(data))
               this.tableData = this.formatTableData(data)
            })
         } else {

            const currFolder = this.currTopBarVal[len - 1]
            this.axios.get(`http://${currFolder.ip}:9797/getFolderData/${currFolder.fileId}?${currFolder.userId}`).then(res => {
               console.log(res.data);
               if (res.data != 0) {
                  for (const item of res.data) {
                     item.fileId = item.id
                  }
                  this.initTableData = JSON.parse(JSON.stringify(res.data))
                  this.tableData = this.formatTableData(res.data)
               } else
                  this.tableData = []
            })
         }
      },
      getChildTableData(val) {
         if (val.isDir == 1) {
            this.$root.$data.topBar.push({
               key: val.id,
               name: val.filename,
               netPath: val.netPath,
               fileId: typeof val.fileId == 'undefined' ? val.id : val.fileId,
               userId: val.userId,
               ip: val.ip
            })

         }
      },
      load() {
         window.userOps.getClassifyFileData(this.type, this.userInfo.id, this.page * 20, data => {
            for (let item of data) {
               item.rowId = 'row' + this.i
               this.i++
            }
            this.tableData = this.tableData.concat(data)
            this.page++
         })
      },
      downloadMultipleFile() {

         this.multipleSelection.forEach(item => {
            this.downloadFile(item)
         })
      },

      downloadFile(val) {
         console.log(val);


         //单个文件下载
         if (val.isDir == 0) {
            this.initTableData.forEach(item => {
               if (val.id == item.id) {
                  console.log(item);
                  item.downloadedSize = 0    //已下载数据
                  item.downloadType = 'file'   //表明下载方式，单个文件下载，直接下载放入下载目录
                  item.downloadStatus = 'await'
                  item.downloadSpeed = 0
                  item.downloadPercentage = 0
                  item.start = 0
                  for (const item of this.$root.$data.awaitDownloadQueue) {
                     if (item.fileId == val.fileId && item.userId == val.userId) {
                        this.$message({
                           message: '该文件正在下载',
                           type: 'warning'
                        })
                        return
                     }
                  }
                  let itemWrapper = []
                  itemWrapper.push(item)
                  window.userOps.downloadItem(itemWrapper)
                  this.$root.$data.awaitDownloadQueue.push(item)
               }
            })
         }
         else {
            //文件夹下载
            const t = JSON.stringify({
               netPath: this.currTopBarVal[this.currTopBarVal.length - 1].key == '0' ? val.netPath + val.filename : val.netPath + '/' + val.filename
            })
            console.log(val);
            this.axios.post(`http://${val.ip}:9797/getFileListInFolder/${val.fileId}?${val.userId}`, t).then(res => {
               console.log(res.data);
               for (const item of res.data) {
                  item.downloadedSize = 0
                  item.downloadSpeed = 0
                  item.start = 0
                  item.downloadType = 'folder'   //需要创建文件夹后放入文件
                  item.downloadStatus = 'await'
                  item.fileId = item.id
                  item.downloadPercentage = 0
                  for (const item of this.$root.$data.awaitDownloadQueue) {
                     if (item.fileId == val.fileId && item.userId == val.userId) {
                        this.$message({
                           message: '该文件正在下载',
                           type: 'warning'
                        })
                        return
                     }
                  }
                  this.$root.$data.awaitDownloadQueue.push(item)
               }
               window.userOps.downloadItem(res.data)
            })
         }


      }
   },
   computed: {
      topMenu: {
         get: function () {
            if (this.multipleSelection.length != 0)
               return true
            else
               return false
         }

      }

   },
   mounted() {
      let mainHeader = document.getElementById('mainHeader')
      let fileItemAndFileOps = document.getElementById('fileItemAndFileOps')
      mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
      fileItemAndFileOps.style.width = document.documentElement.clientWidth - 210 + 'px'
      this.tableHeight = document.documentElement.clientHeight - 185
      window.addEventListener('resize', () => {
         mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
         fileItemAndFileOps.style.width = document.documentElement.clientWidth - 210 + 'px'
         this.tableHeight = document.documentElement.clientHeight - 185
      })
      this.$root.$data.topBar.length = 0
      this.$root.$data.topBar.push({
         key: '0',
         name: '文件',
         netPath: window.userOps.rootNetPath(this.userInfo.username) + '/'
      })

      this.getCurrTableData()
      if (window.userOps.getDownloadingObj() != '')
         this.downloadingItems = JSON.parse(window.userOps.getDownloadingObj())


   }
}
</script>
<style scoped>
#mainHeader {
   border-top-left-radius: 10px;
   border-top-right-radius: 10px;
   white-space: nowrap;
   padding: 10px;
   border-bottom: rgba(236, 234, 234, 0.6) solid 1px;
   position: absolute;
   top: 0px;
   background-color: white;

}

#mainBody {
   white-space: nowrap;
}

.el-checkbox__inner {
   background-color: #0f62fe;
   border-color: #0f62fe;
}

.icon-like {
   width: 22px;
   height: 22px;
}

#filename-parent {
   position: relative;
}

.filename-child {
   font-weight: 400;
   color: black;
   font-size: 15px;
   position: absolute;
   top: 12%;
   text-align: left;
   white-space: nowrap;
   width: 300px;
   height: 17px;
   text-overflow: ellipsis;
   overflow: hidden;
   position: absolute;
   left: 120%;
}

.item-btn {
   position: absolute;
   right: 0%;
   top: 10%;
   margin-right: 20px;
}

#fileItemAndFileOps {

   font-size: large;
   font-weight: 500;
   color: #606266;
   height: 30px;
   padding: 10px;
   position: absolute;
   top: 61px;

   background-color: #fff;
}

:deep().el-dialog__body {
   padding: 10px 20px;
}
</style>