<template>
   <div id="mainContainer">
      <div id="mainHeader">
         <el-button round icon="el-icon-upload" style="background-color: rgb(23,55,245); color: #fff;"
            @click="shareNum">分享码
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
                              <em class="el-icon-download" @click="downloadFile(scope.row)"></em>
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
         userInfo: this.$root.$data.userInfo,
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
      shareNum() {
         this.$prompt('请输入分享码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /[1-9]/,
          inputErrorMessage: '分享码格式不正确'
        }).then(({ value }) => {
         console.log(value);
         window.userOps.inputShareNum(value)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });       
        });
      },
      //鼠标移入显示菜单
      showMenu(tableItem) {
         this.showRowMenu(tableItem, this)
      },
      currRow(val) {
         this.checkedTableRow(val, this)
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
               if (res.data.length > 0) {
                  for (const item of res.data) {
                     item.fileId = item.id
                  }
                  this.initTableData = JSON.parse(JSON.stringify(res.data))
                  this.tableData = this.formatTableData(res.data)
               } else
                  this.tableData = []
            }).catch((err) => {
               console.log(err.message);
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
         //单个文件下载
         if (val.isDir == 0) {
            this.initTableData.forEach(item => {
               if (val.id == item.id) {
      
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
                  this.$message({
                     message: `${itemWrapper.length}项加入下载`,
                     type: 'success'
                  })
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
            this.axios.post(`http://${val.ip}:9797/getFileListInFolder/${val.fileId}?${val.userId}`, t).then(res => {
      
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
               this.$message({
                  message: `${res.data.length}项加入下载`,
                  type: 'success'
               })
               window.userOps.downloadItem(res.data)
            })
         }


      }
   },
   computed: {
      topMenu: {
         get: function () {
            return this.multipleSelection.length != 0
         }

      }

   },
   mounted() {
      this.initComp(this)
      this.getCurrTableData()
      if (window.userOps.getDownloadingObj() != '')
         this.downloadingItems = JSON.parse(window.userOps.getDownloadingObj())


   }
}
</script>
<style scoped>

</style>