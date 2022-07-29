<template>
   <div>
    <div id="mainHeader">
      <el-button
          round
          icon="el-icon-edit-outline"
          style="background-color: rgb(23,55,245); color: #fff;"
          @click="newNote"
      >新建笔记
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


      <h3 style="color: #606266;margin-left: 10px;margin-top: 80px">全部文件 <span style="color: #909399">1</span>


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

       <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%;"
          @cell-mouse-enter="showMenu"
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
            width="45">
        </el-table-column>
        <el-table-column
            prop="fileName"
            label="文件名"
            width="500">
          <template slot-scope="scope">

            <div  slot="reference" class="name-wrapper" style="width: 100%" @mouseenter="showMenu(scope.row.id)">
              <el-button  type="text" size="medium" style="float: left;">

                <span :class="scope.row.type + ' item-color' " >&nbsp;&nbsp;{{ scope.row.fileName }}</span>
              </el-button>
<!-- 表格行菜单显示-->
              <div :id="scope.row.id" style="float: right;visibility: hidden">
                <el-tooltip content="移动" placement="bottom" open-delay="1000">
                <el-button  type="text" size="medium" style="float: left;">
                  <i  class="el-icon-folder-opened"></i>
                </el-button>
                </el-tooltip>
                <el-tooltip content="下载" placement="bottom" open-delay="1000">
                <el-button  type="text" size="medium" style="float: left;">
                  <i class="el-icon-download"></i>
                </el-button>
                </el-tooltip>
                <el-tooltip content="分享" placement="bottom" open-delay="1000">
                  <el-button type="text" size="medium" style="float: left;">
                    <i class="el-icon-share"></i>
                  </el-button>
                </el-tooltip>
                <el-dropdown trigger="click" style="margin-left: 10px">
                <el-tooltip content="更多" placement="bottom" open-delay="1000">
                  <el-button  type="text" size="medium" style="float: left;">
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
        <el-table-column
            prop="fileSize"
            label="大小"
            width="150">
        </el-table-column>
        <el-table-column
            prop="modifyTime"
            label="修改日期"
            width="200">
        </el-table-column>
        <el-table-column
            prop="from"
            label="用户"
            show-overflow-tooltip>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>


 var fileTypes = {
        folder: 'el-icon-notebook-1',
        video: 'el-icon-video-play',
        music: 'el-icon-headset',
        picture: 'el-icon-picture-outline',
        document: 'el-icon-document'
      }
export default {
  name: "myNotes",
  data() {
    return {
      tableData: [
        {
        id: 'row'+1,
        fileName: 'java课程设计',
        fileSize: '19mb',
        modifyTime: '2019-02-12',
        from: '192.168.2.31(王子)',
        type: fileTypes.folder
      }, {
          id: 'row'+2,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)',
          type: fileTypes.video
        },
        {
          id: 'row'+3,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)',
          type: fileTypes.music
        },
        {
          id: 'row'+4,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)',
          type: fileTypes.picture
        },
        {
          id: 'row'+5,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)',
          type: fileTypes.document
        },
        {
          id: 'row'+6,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        {
          id: 'row'+7,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        {
          id: 'row'+8,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        {
          id: 'row'+9,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        {
          id: 'row'+10,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        {
          id: 'row'+11,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },{
          id: 'row'+12,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },{
          id: 'row'+13,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },{
          id: 'row'+14,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },{
          id: 'row'+15,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },{
          id: 'row'+16,
          fileName: 'java课程设计',
          fileSize: '19mb',
          modifyTime: '2019-02-12',
          from: '192.168.2.31(王子)'
        },
        ],
      multipleTable: [],
      multipleSelection: []
    }
  },
  methods: {
    //鼠标移入显示菜单
    showMenu(tableItem) {
      const m = document.getElementById(tableItem.id)
      if (m !== null)
      m.style.visibility = 'visible'

      let len = this.tableData.length

      for (let i = 1; i <=len ; i++) {
        if (('row'+i) !== tableItem.id){
          let tmpId = document.getElementById('row'+i)
          tmpId.style.visibility = 'hidden'
        }
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    newNote(){
      // window.ipcRenderer.send('a','a')
      // console.log('a');
      window.noteOps.newNote()
    }

  },
  computed: {
    topMenu: function (){
      console.log(this.multipleSelection)
      if (this.multipleSelection.length != 0)
        return true
      else
        return false
    }
  },
  mounted() {
    let mainHeader = document.getElementById('mainHeader')
      mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
      window.addEventListener('resize', () => {
      mainHeader.style.width = document.documentElement.clientWidth - 210 + 'px'
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
.el-checkbox__inner{
  background-color: #0f62fe;
  border-color: #0f62fe;
}
.item-color{
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}
.item-color:hover{
  color: #0f62fe;
}

</style>