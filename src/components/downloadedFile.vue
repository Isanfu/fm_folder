<template>
   <div id="mainContainer">
      <div id="mainHeader">
         <el-button round size="small" style="background-color: rgb(23,55,245); color: #fff;" @click="multipleDelItem">
            {{btnClear}}
         </el-button>

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
                              <span @click="getChildTableData(scope.row)" style="cursor: pointer;">
                                 &nbsp;&nbsp;{{scope.row.filename}}
                              </span>
                           </div>
                        </div>
                     </el-button>
                     <!-- 表格行菜单显示-->
                     <div :id="scope.row.rowId" class="item-btn">
                        <el-tooltip content="本地打开" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;" @click="openInFinder(scope.row)">
                              <em class="el-icon-search"></em>
                           </el-button>
                        </el-tooltip>
                        <el-tooltip content="清除记录" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <em @click="delItem(scope.row)" class="el-icon-close"></em>
                           </el-button>
                        </el-tooltip>
                     </div>
                  </div>
               </template>
            </el-table-column>
            <el-table-column prop="fileSize" sortable label="大小" width="150">
            </el-table-column>
            <el-table-column prop="modifyTime" sortable label="创建时间" show-overflow-tooltip>
            </el-table-column>

         </el-table>
      </div>
   </div>
</template>

<script>

export default {
   name: "downloadedFile",
   data() {
      return {
         tableData: [],
         multipleTable: [],
         multipleSelection: [],
         userInfo: this.$root.$data.userInfo,
         recordNamesakeFileObj: [],
         tableHeight: undefined
      }
   },
   methods: {
      //鼠标移入显示菜单
      showMenu(tableItem) {
         this.showRowMenu(tableItem, this)
      },
      currRow(val) {
         this.checkedTableRow(val, this)
      },
      doubleClickCurrRow(row) {
         row.absPath = window.userOps.getDownloadFileUrl()
         row.isDir == 1 ? this.getChildTableData(row) : window.userOps.openFile(row)
      },
      openInFinder(val) {
         val.absPath = window.userOps.getDownloadFileUrl()
         window.userOps.openInFinder(val)
      },
      handleSelectionChange(val) {
         this.multipleSelection = val;
      },

      getCurrTableData() {
         if (this.type != 'document') {
            window.userOps.getClassifyFileData(this.type, this.userInfo.id, 0, data => {
               this.initTableData = JSON.parse(JSON.stringify(data))
               this.tableData = this.formatTableData(data)
            })
         } else {
            window.userOps.getDocClassFileData(this.userInfo.id, 0, data => {
               this.initTableData = JSON.parse(JSON.stringify(data))
               this.tableData = this.formatTableData(data)
            })
         }

      },
      delItem(val) {
         const d = this.tableData.findIndex(item => {
            return val.fileId == item.fileId && val.userId == item.userId
         })
         this.tableData.splice(d, 1)
         window.userOps.delDownloadedQueueItem(val)
      },
      //全部/多个清除
      multipleDelItem() {
         switch (this.btnClear) {
            case '全部删除': {
               this.$root.$data.downloadedQueue = []
               this.tableData = this.$root.$data.downloadedQueue
            } break;
            case '删除': {
               for (const item of this.multipleSelection) {
                  this.delItem(item)
               }
            } break;
         }
      },
      load() { }

   },
   computed: {
      topMenu: {
         get: function () {
            return this.multipleSelection.length != 0
         }
      },
      btnClear: function () {
         if (this.multipleSelection.length > 0)
            return '删除'
         else
            return '全部删除'
      }

   },
   mounted() {
      this.initComp(this)
      if (window.userOps.getDownloadedQueue() != '') {
         this.tableData = this.formatTableData(JSON.parse(window.userOps.getDownloadedQueue()))
      }
      else
         this.tableData = []
   }
}
</script>
<style scoped>

</style>