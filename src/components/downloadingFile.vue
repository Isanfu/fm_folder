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
                        <img :src="require(`@/assets/icons/refresh.svg`)" alt="刷新"
                           style="padding-top: 3px;height: 17px;width: 17px;margin-right: 30px;cursor:pointer;"
                           @click="getCurrTableData" />
                     </el-tooltip>

                  </div>

               </div>
            </span>
         </div>


         <el-table highlight-current-row @current-change="currRow"
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
                              <em v-if="scope.row.downloadStatus == 'downloading' || scope.row.downloadStatus == 'await'"
                                 class="el-icon-video-pause" @click="singlePause(scope.row)"></em>
                              <em v-else class='el-icon-video-play' @click="singleResume(scope.row)"></em>
                           </el-button>

                        </el-tooltip>
                        <el-tooltip content="取消" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <em @click="singleCancel(scope.row)" class="el-icon-close"></em>
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
         userInfo: this.$root.$data.userInfo,
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
      //鼠标移入显示菜单
      showMenu(tableItem) {
        this.showRowMenu(tableItem,this)
      },
      currRow(val) {
         this.checkedTableRow(val,this)
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
   },
   computed: {
      topMenu: {
         get: function () {
            return this.multipleSelection.length != 0
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
      this.initComp(this)
      const size = filesize.partial({ base: 2, standard: "jedec" });
      window.userOps.removeDownloadProgressListener()
      window.userOps.downloadQueue((event, value) => {
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
                  this.$root.$data.awaitDownloadQueue[d].rowId = 'row'+(d+1)
               }
            }

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
   
</style>