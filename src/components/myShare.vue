<template>
   <div id="mainContainer">
      <div id="mainHeader">
         <el-button round icon="el-icon-upload" style="background-color: rgb(23,55,245); color: #fff;"
            @click="saveFilesObjOnMainProcess">文件上传
         </el-button>
         <el-button-group style="margin-left: 20px" v-show="topMenu">
            <el-button size="small" @click="delFileObjArr" round>删除</el-button>
         </el-button-group>
      </div>
      <div id="mainBody">

         <span id="fileItemAndFileOps">
            <span v-if="multipleSelection.length == 0" style="margin-left: 10px;">
               文件项 <span style="color: #909399;font-size:medium;margin-left: 3px;">{{ tableData.length }}</span>
            </span>
            <span v-else>
               已选项 <span style="color: #909399;font-size:medium;margin-left: 3px;">{{ multipleSelection.length }}</span>
            </span>

            <div style="float: right;">
               <div style="float: right;">
                  <el-tooltip content="刷新" placement="bottom" :open-delay="400">
                     <img :src="require(`@/assets/icons/refresh.svg`)" alt="刷新"
                        style="margin:0px 30px 0 10px;padding-top: 3px;height: 17px;width: 17px;"
                        @click="getCurrTableData" />

                  </el-tooltip>

               </div>

            </div>
         </span>


         <el-table @row-dblclick="doubleClickCurrRow" highlight-current-row @current-change="currRow"
            :cell-style="{ padding: '2px 0' }" ref="multipleTable" :data="tableData" tooltip-effect="dark"
            style="width: 100%;margin-top: 100px;" @cell-mouse-enter="showMenu" v-el-table-infinite-scroll="load"
            :infinite-scroll-disabled="false" :height="tableHeight"
            :default-sort="{ prop: 'fileName', order: 'ascending' }" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45">
            </el-table-column>
            <el-table-column prop="fileName" label="文件名" width="500">
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
                        <el-tooltip content="删除" placement="bottom" :open-delay=500>
                           <el-button type="text" size="medium" style="float: left;" @click="delFileObj(scope.row)">
                              <em class="el-icon-delete"></em>
                           </el-button>
                        </el-tooltip>
                     </div>
                  </div>
               </template>
            </el-table-column>
            <el-table-column prop="fileSize" label="大小" width="150">
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="200">
            </el-table-column>
            <el-table-column prop="shareNum" label="分享码" show-overflow-tooltip>
            </el-table-column>
         </el-table>
      </div>
   </div>
</template>

<script>

export default {
   name: "myShare",
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
      currTopBarVal: function () {
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
         this.showRowMenu(tableItem,this)
      },
      currRow(val) {
         this.checkedTableRow(val,this)
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
            window.userOps.getShareTableData(this.userInfo, 0, data => {
               
               this.initTableData = JSON.parse(JSON.stringify(data))
                this.tableData = this.formatTableData(data)
                console.log(this.tableData);
            })
         }else{
              window.userOps.getHomeTableData(this.userInfo, data => {
               this.initTableData = JSON.parse(JSON.stringify(data))
                this.tableData = this.formatTableData(data)
            }, this.currTopBarVal[len - 1].key)
         }
      },
      getChildTableData(fileItem) {
         console.log(fileItem);
         const len = this.$root.$data.topBar.length
         if (fileItem.isDir == 1 && this.currTopBarVal[len - 1].key == '0') {
            this.$root.$data.topBar.push({
               key: fileItem.fileId,
               name: fileItem.filename,
               netPath: this.currTopBarVal[len - 1].netPath + fileItem.filename + '/'
            })
         }
         if (fileItem.isDir == 1 && this.currTopBarVal[len - 1].key != '0') {
            this.$root.$data.topBar.push({
               key: fileItem.id,
               name: fileItem.filename,
               netPath: this.currTopBarVal[len - 1].netPath + fileItem.filename + '/'
            })
         }
      },
      delFileObjArr() {
         this.$confirm('是否删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
         }).then(() => {
            window.userOps.delFileObjArrOnFileShareTable(this.userInfo, this.multipleSelection, data => {
               console.log(data);
            })
         }).catch(() => {
            console.log('取消');
         })
      },
      delFileObj(fileObj) {
         const tmpFileObjArr = []
         tmpFileObjArr.push(fileObj)
         this.$confirm('是否删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
         }).then(() => {
            window.userOps.delFileObjArrOnFileShareTable(this.userInfo, tmpFileObjArr, data => {
               console.log(data);
            })
         }).catch(() => {
            console.log('取消');
         })
      },
      load() {
         window.userOps.getShareTableData(this.userInfo, this.page * 20, data => {
            for (let item of data) {
               item.rowId = 'row' + this.i
               this.i++
              item  = this.formatFileSize(item)
            }
            this.tableData = this.tableData.concat(data)
            this.page++
         })
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
   }
}
</script>
<style scoped>
  
</style>