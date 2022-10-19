import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import VueCookies from 'vue-cookies';
import 'element-ui/lib/theme-chalk/index.css';
import ElTableInfiniteScroll from "el-table-infinite-scroll";
import moment from 'moment'
import axios from 'axios'
import VueAxios from 'vue-axios'
import filesize from "filesize";

import './assets/css/component.css'


Vue.use(VueAxios, axios)

Vue.directive("el-table-infinite-scroll", ElTableInfiniteScroll);

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueCookies)
Vue.use(moment)

//表格数据格式化
Vue.prototype.formatFileSize = (item) => {
  if (item.shareNum === 0)
    item.shareNum = ''
  const size = filesize.partial({ base: 2, standard: "jedec" });
  if (item.isDir == 0)
    item.fileSize = size(item.fileSize)
  else
    item.fileSize = ''

  if (typeof item.shareNum == 'undefined')
    item.modifyTime = moment(item.modifyTime).format('YYYY-MM-DD hh:mm')
  else
    item.createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm')

  return item
}
//rowId控制行内菜单
Vue.prototype.formatTableData = (data) => {
  let i = 1;
  for (let item of data) {
    item.rowId = 'row' + i
    i++
    item = Vue.prototype.formatFileSize(item)
  }
  return data
}
// 组件初始化
Vue.prototype.initComp = (_this) => {
  let mainHeader = document.getElementById('mainHeader')
  let fileItemAndFileOps = document.getElementById('fileItemAndFileOps')
  mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
  fileItemAndFileOps.style.width = document.documentElement.clientWidth - 210 + 'px'
  _this.tableHeight = document.documentElement.clientHeight - 185
  window.addEventListener('resize', () => {
    mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
    fileItemAndFileOps.style.width = document.documentElement.clientWidth - 210 + 'px'
    _this.tableHeight = document.documentElement.clientHeight - 185
  })
  _this.$root.$data.topBar.length = 0
  _this.$root.$data.topBar.push({
    key: '0',
    name: '文件',
    netPath: window.userOps.rootNetPath(_this.userInfo.username) + '/'
  })
}
//dialog保存文件
Vue.prototype.saveFileInDialogWay = (_this) => {
  window.fileOps.saveFilesObjOnMainProcess().then(res => {
    let namesakeFileObjArr = []
    res.forEach(itemA => {
      _this.tableData.forEach(itemB => {
        if (window.fileOps.getFileObjName(itemA) == itemB.filename) {
          _this.recordNamesakeFileObjOnTableData.push(itemB)
          namesakeFileObjArr.push({
            name: window.fileOps.getFileObjName(itemA),
            path: itemA
          })
        }
      })
    });

    if (namesakeFileObjArr.length > 0) {
      _this.namesakeWarmingDialog = true
      _this.recordNamesakeFileObj = namesakeFileObjArr
    }

    //不同名文件，可以直接插入
    const unNamesake = res.filter(itemA => {
      return namesakeFileObjArr.every(itemB => {
        return itemB.name != window.fileOps.getFileObjName(itemA)
      })
    })
    const filePathArr = []
    const len = _this.$root.$data.topBar.length
    //插入文件
    for (const item of unNamesake) {
      if (window.fileOps.isDir(item))
        window.fileOps.saveDir(_this.userInfo, item, _this.$root.$data.topBar[len - 1])
      else
        filePathArr.push(item)
    }
    if (filePathArr.length > 0)
      window.fileOps.saveFile(_this.userInfo, filePathArr, _this.$root.$data.topBar[len - 1])

  })
}
//鼠标移入显示表格项行菜单
Vue.prototype.showRowMenu = (tableItem, _this) => {
  const m = document.getElementById(tableItem.rowId)
  if (m !== null)
    m.style.visibility = 'visible'

  let len = _this.tableData.length
  for (let i = 1; i <= len; i++) {
    if (('row' + i) !== tableItem.rowId) {
      let tmpId = document.getElementById('row' + i)
      tmpId.style.visibility = 'hidden'
    }
  }
}
//选中表格行
Vue.prototype.checkedTableRow = (val, _this) => {
  _this.tableData.forEach(item => {
    if (item == val)
      _this.$refs.multipleTable.toggleRowSelection(val, true)
    else
      _this.$refs.multipleTable.toggleRowSelection(item, false)
  })
}
//文件对象更新
Vue.prototype.updateFile = (command, _this) => {
  const tmpFileObjArr = []
  switch (command.name) {
    case 'delFile':
      tmpFileObjArr.push(command.fileObj)
      _this.$confirm('是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.userOps.delFileObjArr(tmpFileObjArr, _this.userInfo, data => {
          this.$message({
            message: `删除${data}项`,
            type: 'success'
          })
        })
      }).catch(() => {
        console.log('operate cancel');
      }); break;
    case 'rename':
      _this.$prompt('输入新文件名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(newFileName => {
        const len = _this.$root.$data.topBar.length
        for (const item of _this.tableData) {
          if (item.filename == newFileName.value + command.fileObj.fileExtname) {
            _this.$message.error('文件已存在！');
            return
          }
        }
        let name = ''
        if (command.fileObj.isDir == 1)
          name = newFileName.value
        else
          name = newFileName.value + command.fileObj.fileExtname
        window.userOps.updateFilename(command.fileObj, _this.userInfo.id, name, _this.currTopBarVal[len - 1].netPath, data => {
          console.log(data);
        })
      }); break;
  }
}

//多选删除文件
Vue.prototype.delFileArr = (_this) => {
  _this.$confirm('是否删除？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    window.userOps.delFileObjArr(_this.multipleSelection, _this.userInfo, data => {
      this.$message({
        message: `删除${data}项`,
        type: 'success'
      })
    })
  }).catch(() => {
    console.log(`operate cancel`);
  })
}



new Vue({
  router,
  data() {
    return {
      topBar: [],
      awaitDownloadQueue: [],
      downloadedQueue: [],
      downloadingQueue: [],
      pauseDownloadQueue: [],
      downloadData: [],
      userInfo: undefined,
    }
  },
  render: h => h(App)
}).$mount('#app')
