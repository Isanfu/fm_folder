<template>
   <div id="mainContainer">
      <div id="mainHeader">

         <el-button size="small" @click="multipleStart" round>{{btnStart}}</el-button>
         <el-button size="small" @click="multiplePause" round>{{btnPause}}</el-button>
         <el-button size="small" @click="multipleCancel" round>{{btnCancel}}</el-button>
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
            <el-table-column prop="fileName" sortable label="文件名" width="400">
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
                        <el-tooltip content="暂停" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left">
                              <i v-if="scope.row.downloadStatus == 'downloading' || scope.row.downloadStatus == 'await'"
                                 class="el-icon-video-pause" @click="singlePause(scope.row)"></i>
                              <i v-else class='el-icon-video-play' @click="singleResume(scope.row)"></i>
                           </el-button>

                        </el-tooltip>
                        <el-tooltip content="取消" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <i @click="singleCancel(scope.row)" class="el-icon-close"></i>
                           </el-button>
                        </el-tooltip>
                     </div>
                  </div>
               </template>
            </el-table-column>
            <el-table-column sortable label="大小" width="250">
               <template slot-scope="scope">
                  {{ scope.row.downloadedSize }}/{{ scope.row.fileSize }}
               </template>

            </el-table-column>
            <el-table-column sortable label="状态" show-overflow-tooltip>
               <template slot-scope="scope">
                  {{ scope.row.downloadStatus =='downloading'?scope.row.downloadSpeed+'/s': scope.row.downloadStatus
                  =='pause'?'暂停':'等待下载'}}
                  <el-progress :percentage="scope.row.downloadPercentage"></el-progress>
               </template>

            </el-table-column>

         </el-table>
      </div>
   </div>
</template>

<script>
const filesize = require('filesize')
export default {
   name: "downloadingFile",
   data() {
      return {
         tableData: [],
         multipleTable: [],
         multipleSelection: [],
         currTopBarVal: this.$root.$data.topBar,
         userInfo: this.$cookies.get('userInfo'),
         namesakeWarmingDialog: false,
         recordNamesakeFileObj: [],
         recordNamesakeFileObjOnTableData: [],
         page: 1,
         i: 21,
         tableHeight: undefined,
      }
   },
   methods: {
      load() { },
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
      //单个暂停
      singlePause(val) {
         window.userOps.singlePause(val)
      },
      //单个继续
      singleResume(val) {
         window.userOps.singleResume(val)
      },
      //单个取消
      singleCancel(val) {
         window.userOps.singleCancel(val)
         const idx_await = this.$root.$data.awaitDownloadQueue.findIndex(item => {
            return val.fileId == item.fileId && val.userId == item.userId
         })
         this.$root.$data.awaitDownloadQueue.splice(idx_await, 1)
      },
      //多个/全部暂停
      multiplePause() {
         switch (this.btnPause) {
            case '全部暂停': {
               window.userOps.allPause()
            } break;
            case '暂停': {
               for (const item of this.multipleSelection) {
                  this.singlePause(item)
               }
            } break;
         }
      },
      //多个/全部开始
      multipleStart() {
         switch (this.btnStart) {
            case '全部开始': {
               window.userOps.allStart()
            } break;
            case '开始': {
               for (const item of this.multipleSelection) {
                  this.singleStart(item)
               }
            } break;
         }
      },
      //多个/全部取消
      multipleCancel() {
         switch (this.btnCancel) {
            case '全部取消': {
               window.userOps.allCancel()
            } break;
            case '取消': {
               for (const item of this.multipleSelection) {
                  this.singleCancel(item)
               }
            } break;
         }
      },
      getCurrTableData() {
         // this.tableData = this.formatTableData(this.$root.$data.awaitDownloadQueue)
      },
      getChildTableData(val) {
         // console.log(val.childFileList);
         if (val.isDir == 1) {
            this.$root.$data.topBar.push({
               key: val.id,
               name: val.filename,
               netPath: val.netPath,
               fileId: typeof val.fileId == 'undefined' ? val.id : val.fileId,
               userId: val.userId,
               ip: val.ip,
               childFileList: val.childFileList
            })
         }
      },
      delFileObjArr() {
         this.$confirm('是否删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
         }).then(() => {
            window.userOps.delFileObjArr(this.multipleSelection, this.userInfo.id, data => {
               console.log(data);
            })
         }).catch(() => {
            console.log('取消');
         })
      },
      updateFileObj(command) {
         const tmpFileObjArr = []
         switch (command.name) {
            case 'delFile':
               tmpFileObjArr.push(command.fileObj)
               this.$confirm('是否删除？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
               }).then(() => {
                  window.userOps.delFileObjArr(tmpFileObjArr, this.userInfo.id, data => {
                     console.log(data);
                  })
               }).catch(() => {
                  console.log('取消');
               }); break;
            case 'rename':
               this.$prompt('输入新文件名', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
               }).then(newFileName => {
                  const len = this.$root.$data.topBar.length
                  console.log(command.fileObj);
                  for (const item of this.tableData) {
                     if (item.isDir == 1 && command.fileObj.isDir == 1) {
                        if (item.filename == newFileName.value) {
                           this.$message.error('文件夹已存在！');
                           return
                        }
                     }
                     if (item.isDir == 0 && command.fileObj.isDir == 0) {
                        var name = newFileName.value + window.fileOps.getExtname(command.fileObj.filename)
                        if (item.filename == name) {
                           this.$message.error('文件已存在！');
                           return
                        }
                     }
                  }
                  window.userOps.updateFilename(command.fileObj, this.userInfo.id, name, this.currTopBarVal[len - 1].netPath, data => {
                     console.log(data);
                  })
               }).catch(() => {
                  console.log('取消');
               }); break;
         }
      },


   },
   computed: {
      topMenu: {
         get: function () {
            if (this.multipleSelection.length != 0)
               return true
            else
               return false
         }

      },
      btnStart: function () {
         if (this.multipleSelection.length == 0)
            return '全部开始'
         else
            return '开始'
      },
      btnPause: function () {
         if (this.multipleSelection.length == 0)
            return '全部暂停'
         else
            return '暂停'
      },
      btnCancel: function () {
         if (this.multipleSelection.length == 0)
            return '全部取消'
         else
            return '取消'
      },

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
      const size = filesize.partial({ base: 2, standard: "jedec" });
      window.userOps.removeDownloadProgressListener()
      window.userOps.downloadQueue((event, value) => {
         console.log(value);
         for (let item of value) {
            item.fileSize = size(item.fileSize)
            item.downloadedSize = size(item.downloadedSize)
            item.downloadSpeed = size(item.downloadSpeed)

            //下载完成，从队列中删除
            if (item.downloadStatus == 'downloaded') {
               const d = this.$root.$data.awaitDownloadQueue.findIndex(element => {
                  return item.fileId == element.fileId && item.userId == element.userId
               })
               if (d > -1) {
                  this.$root.$data.awaitDownloadQueue.splice(d, 1)
                  this.$parent.downloadedLen += 1
               }

            }
            for (let d = 0; d < this.$root.$data.awaitDownloadQueue.length; d++) {

               if (item.fileId == this.$root.$data.awaitDownloadQueue[d].fileId && item.userId == this.$root.$data.awaitDownloadQueue[d].userId) {
                  this.$root.$data.awaitDownloadQueue[d].downloadPercentage = item.downloadPercentage
                  this.$root.$data.awaitDownloadQueue[d].fileSize = item.fileSize
                  this.$root.$data.awaitDownloadQueue[d].downloadedSize = item.downloadedSize
                  this.$root.$data.awaitDownloadQueue[d].downloadSpeed = item.downloadSpeed
                  this.$root.$data.awaitDownloadQueue[d].downloadStatus = item.downloadStatus
               }
            }

         }
         let i = 1
         for (const item of this.$root.$data.awaitDownloadQueue) {
            item.rowId = 'row' + i
            i++
         }
         if (value.length == 0){
            this.tableData = []
            this.$root.$data.awaitDownloadQueue = []
         }
           

      })
      this.tableData = this.$root.$data.awaitDownloadQueue
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