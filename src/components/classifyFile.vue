<template>
   <div id="mainContainer">
      <div id="mainHeader">
         <el-button round icon="el-icon-upload" style="background-color: rgb(23,55,245); color: #fff;"
            @click="saveFilesObjOnMainProcess">文件上传
         </el-button>
         <el-button-group style="margin-left: 20px" v-show="topMenu">
            <el-button size="small" round>分享</el-button>
            <el-button size="small" @click="delFileObjArr" round>删除</el-button>
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
                        <el-tooltip content="本地打开" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;" @click="openInFinder(scope.row)">
                              <em class="el-icon-search"></em>
                           </el-button>
                        </el-tooltip>
                        <el-tooltip content="移动" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;" @click="moveFileObj(scope.row)">
                              <em class="el-icon-folder-opened"></em>
                           </el-button>
                        </el-tooltip>
                        <el-tooltip content="下载" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <em class="el-icon-download"></em>
                           </el-button>
                        </el-tooltip>
                        <el-tooltip content="分享" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;">
                              <em class="el-icon-share"></em>
                           </el-button>
                        </el-tooltip>
                        <el-dropdown trigger="click" style="margin-left: 10px" @command="updateFileObj">
                           <el-tooltip content="更多" placement="bottom" :open-delay=500>
                              <el-button type="text" size="medium" style="float: left;">
                                 <em class="el-icon-more"></em>
                              </el-button>
                           </el-tooltip>
                           <el-dropdown-menu slot="dropdown">
                              <el-dropdown-item :command="{ name: 'delFile', fileObj: scope.row }">删除</el-dropdown-item>
                              <el-dropdown-item :command="{ name: 'rename', fileObj: scope.row }">重命名</el-dropdown-item>
                           </el-dropdown-menu>
                        </el-dropdown>

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
   name: "classifyFile",
   props: ['type'],
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
         tableHeight: undefined
      }
   },
   watch: {
      type: function () {
         this.getCurrTableData()
      }
   },
   methods: {
      //打开主进程文件对话框
      saveFilesObjOnMainProcess() {
         this.saveFileInDialogWay(this)
      },
      //鼠标移入显示菜单
      showMenu(tableItem) {
         this.showRowMenu(tableItem, this)
      },
      currRow(val) {
         this.checkedTableRow(val, this)
      },
      doubleClickCurrRow(row) {
         row.isDir == 1 ? this.getChildTableData(row) : window.userOps.openFile(row)
      },
      openInFinder(val) {
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
      delFileObjArr() {
         this.delFileArr(this)
      },
      updateFileObj(command) {
         this.updateFile(command, this)
      },
      //异步加载数据处理
      handleLoadData(data) {
         for (let item of data) {
            item.rowId = 'row' + this.i
            this.i++
         }
         this.tableData = this.tableData.concat(data)
         this.page++
      },
      load() {
         if (this.type != 'document') {
            window.userOps.getClassifyFileData(this.type, this.userInfo.id, this.page * 20, data => this.handleLoadData(data))
         } else {
            window.userOps.getDocClassFileData(this.userInfo.id, this.page * 20, data => this.handleLoadData(data))
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
   }
}
</script>
<style scoped>

</style>