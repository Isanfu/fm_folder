<template>
  <div id="mainContainer">
    <div id="mainHeader">
      <el-button round icon="el-icon-upload" style="background-color: rgb(23,55,245); color: #fff;"
        @click="saveFilesObjOnMainProcess">文件上传
      </el-button>
      <el-button @click="newFolderDialogVisible = true" round icon="el-icon-folder-add" style="color: rgb(23,55,245)">
        新建文件夹
      </el-button>
      <el-button-group style="margin-left: 20px" v-show="topMenu">
        <el-button size="small" round @click="shareFileDialogVisible = true">分享</el-button>
        <el-button size="small" @click="delFileObjArr">删除</el-button>
        <el-button size="small" @click="getHomeFolderList" round>移动到</el-button>

      </el-button-group>

    </div>
    <el-dialog :visible.sync="moveMenuDialog" @closed="handleCloseFolderList" width="35%">
      <div slot="title">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item v-for="item in folderListBar" :key="item.key">
            <span v-if="item.key == 0" style="color:#303133;font-size:large;font-weight: bold; cursor:pointer;"
              @click="folderListBarOps(item.key)">{{ item.name }}</span>

            <span v-else style="color: #606266;font-size:medium; cursor:pointer" @click="folderListBarOps(item.key)">{{
            item.name
            }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div style="height: 400px;">
        <!-- 移动文件夹目录 -->

        <div v-if="moveMenuData.length != 0">
          <el-card class="box-card" shadow="never">
            <div v-for="o in moveMenuData" :key="o.id" style="position: relative;padding: 5px;cursor:pointer;"
              @click="getChildFolderList(o)">
              <img class="icon-like" :src="require(`@/assets/icons/folder.svg`)" alt="" srcset="" />
              <span style="position: absolute;top: 20%;"> &nbsp;&nbsp;{{ o.filename }}</span>
            </div>
          </el-card>
        </div>
        <div v-else>
          该目录下无文件夹
        </div>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moveMenuDialog = false">取 消</el-button>
        <el-button type="primary" @click="moveFileObjArr">移动到此处</el-button>
      </span>
    </el-dialog>

    <el-dialog title="新建文件夹" :visible.sync="newFolderDialogVisible" width="30%" center>
      <el-input placeholder="输入文件夹名" autocomplete="off" v-model="newFolderName"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newFolderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createNewFolder">确 定</el-button>
      </span>
    </el-dialog>
    <div id="mainBody">

      <span id="fileItemAndFileOps">
        <span v-if="multipleSelection.length == 0" style="margin-left: 10px;">
          文件项 <span style="color: #909399;font-size:medium;margin-left: 3px;">{{ tableData.length }}</span>
        </span>
        <span v-else>
          已选项 <span style="color: #909399;font-size:medium;margin-left: 3px;">{{ multipleSelection.length }}</span>
        </span>

        <div style="float: right;">
          <el-dropdown trigger="click" @command="methodOfSort">
            <span class="el-dropdown-link" style="cursor: pointer;">
              排序<em class="el-icon-caret-bottom el-icon-d-caret"></em>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item class="clearfix" command="time">
                按时间排序<em v-show="currMethodOfSort == 1" class="el-icon-check"></em>
              </el-dropdown-item>
              <el-dropdown-item class="clearfix" command="name">
                按名称排序<em v-show="currMethodOfSort == 2" class="el-icon-check"></em>
              </el-dropdown-item>
              <el-dropdown-item class="clearfix" command="size">
                按大小排序<em v-show="currMethodOfSort == 3" class="el-icon-check"></em>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div style="float: right;">
            <el-tooltip content="刷新" placement="bottom" :open-delay="400">
              <img :src="require(`@/assets/icons/refresh.svg`)" alt="刷新"
                style="margin:0px 30px 0 10px;padding-top: 3px;height: 17px;width: 17px;" @click="getCurrTableData" />

            </el-tooltip>

          </div>

        </div>
      </span>

      <el-table :height="tableHeight" @row-dblclick="doubleClickCurrRow" highlight-current-row @current-change="currRow"
        :cell-style="{ padding: '2px 0' }" ref="multipleTable" :data="tableData" tooltip-effect="dark"
        style="width: 100%;margin-top: 100px;" @cell-mouse-enter="showMenu" @selection-change="handleSelectionChange"
        v-el-table-infinite-scroll="load" :infinite-scroll-disabled="false">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" width="500">

          <template slot-scope="scope">

            <div slot="reference" class="name-wrapper" style="width: 100%"
              @mouseenter.middle="showMenu(scope.row.rowId)">
              <el-button type="text" size="medium" style="cursor: default;">
                <div id="filename-parent">
                  <img class="icon-like" :src="require(`@/assets/icons/${scope.row.filetype}.svg`)" alt="" srcset="">
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
                <el-tooltip content="移动" placement="bottom" :open-delay="400">
                  <el-button type="text" size="medium" style="float: left;" @click="moveFileObj(scope.row)">
                    <em class="el-icon-folder-opened"></em>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="分享" placement="bottom" :open-delay="400">
                  <el-button type="text" size="medium" style="float: left;" @click="shareSingleFileObj(scope.row)">
                    <em class="el-icon-share"></em>
                  </el-button>
                </el-tooltip>
                <el-dropdown trigger="click" style="margin-left: 10px" @command="updateFileObj">
                  <el-tooltip content="更多" placement="bottom" :open-delay="400">
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
        <el-table-column prop="fileSize" label="大小" width="150">
        </el-table-column>
        <el-table-column prop="modifyTime" label="修改时间" width="200">
        </el-table-column>
        <el-table-column prop="username" label="用户" show-overflow-tooltip>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="提示" :visible.sync="namesakeWarmingDialog" width="40%">
      <div>
        <h3>检测到存在{{ recordNamesakeFileObj.length }}个同名文件:</h3>
        <ul>
          <li v-for="item of recordNamesakeFileObj" :key="item.name" style="color: blue">{{ item.name }}</li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="namesakeWarmingDialog = false" size="small">取消</el-button>
        <el-button type="primary" @click="fileCover" size="small">覆盖</el-button>
      </span>
    </el-dialog>

    <el-dialog title="文件分享" :visible.sync="shareFileDialogVisible" width="30%" center>
      <div>文件项：{{ multipleSelection.length }}
        <h4>
          分享方式：
        </h4>
        <el-select style="width: 100%" v-model="fileShareMethod" filterable placeholder="请选择">
          <el-option v-for="item in fileShareOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareFileDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="shareFileObjArr" size="small">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

export default {
  name: "myFile",
  props: ['searchKey'],
  data() {
    return {
      initTableData: [],
      tableData: [],
      moveMenuDialog: false,
      moveMenuData: [],
      multipleTable: [],
      multipleSelection: [],
      currTopBarVal: this.$root.$data.topBar,
      currMethodOfSort: 1,
      newFolderDialogVisible: false,
      newFolderName: '',
      userInfo: this.$root.$data.userInfo,
      folderListBar: [],
      isTopBar: true,
      singleTmpFileObjArr: [],  //临时记录
      namesakeWarmingDialog: false,
      recordNamesakeFileObj: [],
      recordNamesakeFileObjOnTableData: [],
      tableHeight: undefined,
      shareFileDialogVisible: false,
      fileShareOptions: [
        {
          value: 0,
          label: '公开分享'
        },
        {
          value: 1,
          label: '分享码分享'
        }
      ],
      fileShareMethod: ''
    }
  },
  watch: {
    currTopBarVal: function () {

      this.getCurrTableData()
    },
    folderListBar: function () {
      const len = this.folderListBar.length
      window.userOps.getAllFolder(this.userInfo, data => {
        this.moveMenuData = data
      }, this.folderListBar[len - 1].key)
    },
    searchKey: function () {
      if (this.searchKey != '')
        window.userOps.getSearchData(this.userInfo, this.searchKey, data => {
          this.tableData = this.formatTableData(data)
        })
    }
  },
  methods: {
    //无限滚动预留
    load() { },
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
    //获取子文件夹数据
    getChildTableData(fileItem) {

      const len = this.$root.$data.topBar.length

      if (fileItem.isDir == 1 && fileItem.id != this.$root.$data.topBar[len - 1].key) {
        this.$root.$data.topBar.push({
          key: fileItem.id,
          name: fileItem.filename,
          netPath: this.currTopBarVal[len - 1].netPath + fileItem.filename + '/'
        })
      }
    },
    methodOfSort(command) {

      if (command == 'time') {
        this.currMethodOfSort = 1
        this.tableData.sort((a, b) => {
          if (a.isDir == b.isDir)
            return b.modifyTime.localeCompare(a.modifyTime)
        })
      } else if (command == 'name') {
        this.currMethodOfSort = 2
        this.tableData.sort((a, b) => {
          if (a.isDir == b.isDir)
            return a.filename.localeCompare(b.filename)
        })
      } else {
        this.currMethodOfSort = 3
        this.tableData.sort((a, b) => {
          if (a.isDir == b.isDir)
            return b.fileSize.localeCompare(a.fileSize)
        })
      }
    },
    getCurrTableData() {
      const len = this.$root.$data.topBar.length
      window.userOps.getHomeTableData(this.userInfo, data => {


        this.tableData = this.formatTableData(data)
        this.initTableData = JSON.parse(JSON.stringify(data))

        if (this.currMethodOfSort == 3)
          this.tableData.sort((a, b) => {
            if (a.isDir == b.isDir)
              return b.fileSize.localeCompare(a.fileSize)
          })
        else if (this.currMethodOfSort == 2) {

          this.tableData.sort((a, b) => {
            if (a.isDir == b.isDir)
              return a.filename.localeCompare(b.filename)
          })
        } else {
          this.tableData = this.initTableData
        }
      }, this.currTopBarVal[len - 1].key)

    },
    createNewFolder() {
      this.newFolderDialogVisible = false
      const len = this.$root.$data.topBar.length

      for (const item of this.tableData) {
        if (item.isDir == 1) {
          if (item.filename == this.newFolderName) {
            this.$message.error('文件夹已存在！');
            return
          }
        }
      }

      window.userOps.createNewFolder(this.newFolderName, this.currTopBarVal[len - 1], this.userInfo, data => {
        console.log(data);
      })

    },
    delFileObjArr() {
      this.delFileArr(this)
    },
    updateFileObj(command) {
      this.updateFile(command, this)
    },
    getHomeFolderList() {
      this.moveMenuDialog = true
      this.folderListBar.push({
        key: '0',
        name: '全部文件',
        netPath: window.userOps.rootNetPath(this.userInfo.username) + '/'
      })
    },
    getChildFolderList(o) {
      const len = this.folderListBar.length
      this.folderListBar.push({
        key: o.id,
        name: o.filename,
        netPath: this.folderListBar[len - 1].netPath + o.filename + '/'
      })
    },
    folderListBarOps(itemId) {
      const idx = this.folderListBar.map(o => o.key).indexOf(itemId)
      const num = this.folderListBar.length - 1 - idx
      for (let i = 0; i < num; i++)
        this.folderListBar.pop()
    },
    handleCloseFolderList() {
      this.folderListBar.length = 0
      this.multipleSelection = []
    },
    moveFileObjArr() {
      this.moveMenuDialog = false
      const tmpFolderList = JSON.parse(JSON.stringify(this.folderListBar))
      //移动时，需要检测当前文件夹目录下有无同名文件，即先查询。
      window.userOps.getHomeTableData(this.userInfo, data => {
        const namesakeArr = []
        if (this.isTopBar == true) {
          this.multipleSelection.forEach(itemA => {
            data.forEach(itemB => {
              if (itemA.filename == itemB.filename) {
                namesakeArr.push(itemA)
              }
            })
          })
          //不同名文件，可以直接移动
          const unNamesake = this.multipleSelection.filter(itemA => {
            return namesakeArr.every(itemB => {
              return itemB.filename != itemA.filename
            })
          })
          if (namesakeArr.length > 0) {
            this.$message({
              message: '存在同名文件，部分文件移动失败！',
              type: 'warning'
            });
          }
          if (unNamesake.length > 0)
            window.userOps.moveFileObjArr(unNamesake, this.userInfo, tmpFolderList[tmpFolderList.length - 1], data => {
              console.log(data);
            })

        } else {
          this.singleTmpFileObjArr.forEach(itemA => {
            data.forEach(itemB => {
              if (itemA.filename == itemB.filename) {
                namesakeArr.push(itemA)
              }

            })
          })

          //不同名文件，可以直接移动
          const unNamesake = this.singleTmpFileObjArr.filter(itemA => {
            return namesakeArr.every(itemB => {
              return itemB.filename != itemA.filename
            })
          })
          if (namesakeArr.length > 0) {
            this.$message({
              message: '存在同名文件，部分文件移动失败！',
              type: 'warning'
            });
          }
          if (unNamesake.length > 0)
            window.userOps.moveFileObjArr(unNamesake, this.userInfo, tmpFolderList[tmpFolderList.length - 1], data => {
              console.log(data);
            })

        }
      }, tmpFolderList[tmpFolderList.length - 1].key)

      this.isTopBar = true

    },
    moveFileObj(fileObj) {
      this.moveMenuDialog = true
      this.folderListBar.push({
        key: '0',
        name: '全部文件',
        netPath: window.userOps.rootNetPath(this.userInfo.username) + '/'
      })
      this.isTopBar = false
      this.singleTmpFileObjArr.push(fileObj)
    },
    //先删除，再插入
    fileCover() {
      this.namesakeWarmingDialog = false
      //删除表格里面的同名文件
      window.userOps.delFileObjArr(this.recordNamesakeFileObjOnTableData, this.userInfo, data => {
        //插入覆盖
        const filePathArr = []
        const len = this.$root.$data.topBar.length
        console.log(data);
        for (const item of this.recordNamesakeFileObj) {
          if (window.fileOps.isDir(item.path))
            window.fileOps.saveDir(this.userInfo, item.path, this.$root.$data.topBar[len - 1])
          else
            filePathArr.push(item.path)
        }
        if (filePathArr.length > 0)
          window.fileOps.saveFile(this.userInfo, filePathArr, this.$root.$data.topBar[len - 1])

      })
    },
    //文件分享操作
    shareFile(fileList, method = 0) {
      if(method != 3){
        window.userOps.fileShare(fileList, this.userInfo, data => {
        this.$message({
          message: `${data.len}项分享成功`,
          type: 'success'
        })
      }, method)
      }
    },
    //多选分享
    shareFileObjArr() {
      this.shareFileDialogVisible = false
      this.shareFile(this.multipleSelection, this.fileShareMethod)
    },
    //单个分享
    shareSingleFileObj(fileObj) {
      this.shareFileDialogVisible = true
      this.multipleSelection.push(fileObj)
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
    let mainContainer = document.getElementById('mainContainer')
    //文件拖拽
    mainContainer.addEventListener('drop', e => {
      e.stopPropagation(); // 防止浏览器打开新的标签页（firefox）
      e.preventDefault(); // 阻止拖放后的浏览器默认行为

      const fileList = [...e.dataTransfer.files]  //拖转上传的文件列表

      let namesakeFileObjArr = []   //同名文件，用户选择接下啦的操作：1、取消；2、覆盖  

      for (let i = 0; i < fileList.length; i++) {
        for (let j = 0; j < this.tableData.length; j++) {
          if (fileList[i].name == this.tableData[j].filename) {
            this.recordNamesakeFileObjOnTableData.push(this.tableData[j])
            namesakeFileObjArr.push(fileList[i])
          }
        }
      }
      //不同名文件，可以直接插入

      if (namesakeFileObjArr.length > 0) {
        this.recordNamesakeFileObj = namesakeFileObjArr
        this.namesakeWarmingDialog = true
      }
      const unNamesake = fileList.filter(itemA => {
        return namesakeFileObjArr.every(itemB => {
          return itemB.name != itemA.name
        })
      })
      const filePathArr = []
      const len = this.$root.$data.topBar.length
      //插入不同名文件
      for (const item of unNamesake) {
        if (window.fileOps.isDir(item.path))
          window.fileOps.saveDir(this.userInfo, item.path, this.$root.$data.topBar[len - 1])
        else
          filePathArr.push(item.path)
      }
      if (filePathArr.length > 0)
        window.fileOps.saveFile(this.userInfo, filePathArr, this.$root.$data.topBar[len - 1])
    })

    mainContainer.addEventListener('dragover', (e) => {
      //必须要阻止拖拽的默认事件
      e.preventDefault();
      e.stopPropagation();
    })

  }
}
</script>
<style scoped>

</style>