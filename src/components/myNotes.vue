<template>
  <div>
    <div id="mainHeader">
      <el-button round icon="el-icon-edit-outline" style="background-color: rgb(23,55,245); color: #fff;"
        @click="newNote">新建笔记
      </el-button>
      <el-button-group style="margin-left: 20px" v-show="topMenu">
        <el-button size="small" round>下载</el-button>
        <el-button size="small">分享</el-button>
        <el-button size="small">删除</el-button>
        <el-dropdown>
          <el-button size="small" icon="el-icon-more" round></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>移动到</el-dropdown-item>
            <el-dropdown-item>重命名</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-button-group>
    </div>
    <div id="mainBody">

      <h3 style="color: #606266;margin-left: 10px;margin-top: 80px">文件项 <span
          style="color: #909399;font-size:medium;">{{ tableData.length }}</span>


        <div style="position: absolute; right: 20px;top: 90px">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link" style="margin-right: 20px">
              排序<i class="el-icon-caret-bottom el-icon-d-caret"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item class="clearfix">
                按名称排序 <i class="el-icon-check"></i>
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                按时间排序
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                按大小排序
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <i class="el-icon-refresh-right" style="margin-right: 20px"></i>

        </div>
      </h3>

      <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%;"
        @cell-mouse-enter="showMenu" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" width="500">
          <template slot-scope="scope">

            <div slot="reference" class="name-wrapper" style="width: 100%"
              @mouseenter.middle="showMenu(scope.row.rowId)">
              <el-button type="text" size="medium" @click="getChildTableData(scope.row)">
                <div id="filename-parent">
                  <img id="icon-like" :src="require(`@/assets/icons/${scope.row.filetype}.svg`)" alt="" srcset="">
                  <span id="filename-child" class=" item-color ">&nbsp;&nbsp;{{ scope.row.filename }}</span>
                </div>

              </el-button>
              <!-- 表格行菜单显示-->
              <div :id="scope.row.rowId" class="item-btn">
                <el-tooltip content="移动" placement="bottom">
                  <el-button type="text" size="medium" style="float: left;">
                    <i class="el-icon-folder-opened"></i>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="下载" placement="bottom">
                  <el-button type="text" size="medium" style="float: left;">
                    <i class="el-icon-download"></i>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="分享" placement="bottom">
                  <el-button type="text" size="medium" style="float: left;">
                    <i class="el-icon-share"></i>
                  </el-button>
                </el-tooltip>
                <el-dropdown trigger="click" style="margin-left: 10px">
                  <el-tooltip content="更多" placement="bottom">
                    <el-button type="text" size="medium" style="float: left;">
                      <i class="el-icon-more"></i>
                    </el-button>
                  </el-tooltip>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>删除</el-dropdown-item>
                    <el-dropdown-item>重命名</el-dropdown-item>
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
  </div>
</template>

<script>

export default {
  name: "myNotes",
  data() {
    return {
      tableData: [],
      multipleTable: [],
      multipleSelection: [],
      currTopBarVal: this.$root.$data.topBar
    }
  },
  watch:{
    currTopBarVal: function(){
      console.log(this.currTopBarVal);
      const user = this.$cookies.get('userInfo')
      const len = this.$root.$data.topBar.length
      window.userOps.getHomeTableData(user,data=>{
        let i = 1;
          for (let item of data) {
            item.rowId = 'row' + i
            i++
          }
          this.tableData = data
      },this.currTopBarVal[len-1].key)
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    newNote() {
      window.noteOps.newNote()
    },
    getChildTableData(fileItem) {
      if (fileItem.isDir == 1) {
        this.$root.$data.topBar.push({
          key: fileItem.id,
          name: fileItem.filename
        })
        const user = this.$cookies.get('userInfo')
        window.userOps.getHomeTableData(user, data => {
          let i = 1;
          for (let item of data) {
            item.rowId = 'row' + i
            i++
          }
          this.tableData = data
        }, fileItem.id)
      }

    }

  },
  computed: {
    topMenu: function () {
      console.log(this.multipleSelection)
      if (this.multipleSelection.length != 0)
        return true
      else
        return false
    },
  },
  mounted() {
    let mainHeader = document.getElementById('mainHeader')
    mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
    window.addEventListener('resize', () => {
      mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
    })
    // const len = this.$root.$data.topBar.length
    // //初始值
    // this.currTopBarVal = this.$root.$data.topBar[len-1]

    
    const user = this.$cookies.get('userInfo')

    window.userOps.getHomeTableData(user, data => {
      console.log(data);
      let i = 1;
      for (let item of data) {
        item.rowId = 'row' + i
        i++
      }
      this.tableData = data
    })

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
  position: fixed;
  z-index: 999;
  background-color: white;
  width: 100%;
}

#mainBody {
  white-space: nowrap;
  padding: 10px;
}

.el-checkbox__inner {
  background-color: #0f62fe;
  border-color: #0f62fe;
}

#icon-like {
  width: 22px;
  height: 22px;
}

#filename-parent {
  position: relative;
}

#filename-child {
  font-weight: 400;
  color: black;
  font-size: 15px;
  position: absolute;
  top: 10%;
  left: 120%;
}

.item-btn {
  position: absolute;
  right: 0%;
  top: 25%;
  margin-right: 20px;
}
</style>