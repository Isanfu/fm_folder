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
                           <el-button type="text" size="medium" style="float: left;">
                              <i class="el-icon-search"></i>
                           </el-button>
                        </el-tooltip>
                        <el-tooltip content="清除记录" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <i @click="delItem(scope.row)" class="el-icon-close"></i>
                           </el-button>
                        </el-tooltip>
                     </div>
                  </div>
               </template>
            </el-table-column>
            <el-table-column prop="fileSize" sortable label="大小" width="150">
            </el-table-column>
            <el-table-column prop="modifyTime" sortable label="创建时间" width="200">
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
         currTopBarVal: this.$root.$data.topBar,
         userInfo: this.$cookies.get('userInfo'),
         namesakeWarmingDialog: false,
         recordNamesakeFileObj: [],
         recordNamesakeFileObjOnTableData: [],
         page: 1,
         i: 21,
         tableHeight: undefined
      }
   },
   methods: {
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
      load() { }

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
      btnClear: function () {
         if (this.multipleSelection.length > 0)
            return '删除'
         else
            return '全部删除'
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
      if (window.userOps.getDownloadedQueue() != '') {
         this.tableData = this.formatTableData(JSON.parse(window.userOps.getDownloadedQueue()))
      }
      else
         this.tableData = []



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