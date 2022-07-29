<template>
  <div id="body">
    <div id="aside">
      <div id="asideTop">
        <div id="asideIcon">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#0F62FE"
              d="M18.3,-22.4C32.8,-19,60.1,-29.5,67,-26.9C74,-24.3,60.6,-8.8,57.1,7.4C53.5,23.6,59.8,40.4,54.8,49.1C49.8,57.7,33.5,58.2,22.1,50.1C10.7,42,4.1,25.2,-9.6,24.8C-23.2,24.3,-43.9,40.2,-56.1,40.6C-68.3,40.9,-71.9,25.9,-68.7,13.1C-65.5,0.4,-55.4,-10.2,-48.1,-20.2C-40.8,-30.2,-36.2,-39.8,-28.7,-46.4C-21.1,-53,-10.6,-56.6,-4.4,-49.8C1.8,-43,3.7,-25.8,18.3,-22.4Z"
              transform="translate(100 100)" />
          </svg>
        </div>

        <div style="margin-top: 10px">
          <span type="text" class="asideGroupName">文件</span>
          <div>
            <el-button @click="checked('btn1', '1')" id="btn1" icon="el-icon-folder" type="text" style="
              background-color: #fff;
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #0f62fe;
            ">全部文件
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn2', '2')" id="btn2" icon="el-icon-edit" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">我的笔记
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn3', '3')" id="btn3" icon="el-icon-box" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;">局域网文件</el-button>
          </div>

          <div>
            <el-button @click="checked('btn4', '4')" id="btn4" icon="el-icon-video-camera" type="text" style="
                width: 130px;
                float: left;
                margin-top: 5px;
                text-align: left;
                padding: 10px;
                color: #303133;">视频</el-button>
          </div>
          <div>
            <el-button @click="checked('btn5', '5')" id="btn5" icon="el-icon-headset" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">音频
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn11', '11')" id="btn11" icon="el-icon-picture-outline" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">图片
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn6', '6')" id="btn6" icon="el-icon-document" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">文档
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn7', '7')" id="btn7" icon="el-icon-position" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">我的分享
            </el-button>
          </div>
          <div>
            <span type="text" class="asideGroupName">传输</span>

          </div>
          <div>
            <el-button @click="checked('btn8', '8')" id="btn8" icon="el-icon-upload2" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">正在上传
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn9', '9')" id="btn9" icon="el-icon-download" type="text" style="
              width: 130px;
              float: left;
              margin-top: 5px;
              text-align: left;
              padding: 10px;
              color: #303133;
            ">正在下载
            </el-button>
          </div>
          <div>
            <el-badge :value="12" class="item">
              <el-button @click="checked('btn10', '10')" id="btn10" icon="el-icon-circle-check" type="text" style="
                width: 130px;
                float: left;
                margin-top: 5px;
                text-align: left;
                padding: 10px;
                color: #303133;
              ">下载历史
              </el-button>
            </el-badge>
          </div>
        </div>
      </div>
    </div>
    <div id="header">
      <div style="float: left;margin-top: 15px">
        <el-button-group>
          <el-button size="small" icon="el-icon-arrow-left" round></el-button>
          <el-button size="small" round><i class="el-icon-arrow-right el-icon--right"></i></el-button>
        </el-button-group>
      </div>
      <div id="searchInput">

        <el-input placeholder="搜索全部文件" prefix-icon="el-icon-search" style="width: 250px">
        </el-input>
      </div>

      <div id="notify">
        <el-button type="text" style="color: #0f62fe">消息</el-button>
      </div>
    </div>
    <div id="main">
      <component :is="componentName"></component>
    </div>

  </div>
</template>

<script>

import lanShare from "@/components/lanShare";
import myNotes from "@/components/myNotes";



export default {
  name: 'HomeView',
  components: {
    lanShare,
    myNotes
  },
  mounted() {

    let aside_height = document.getElementById('aside')
    let main = document.getElementById('main')
    let header = document.getElementById('header')
    aside_height.style.height = document.documentElement.clientHeight + 'px'
    main.style.height = document.documentElement.clientHeight - 86 + 'px'
    main.style.width = document.documentElement.clientWidth - 190 + 'px'
    header.style.width = document.documentElement.clientWidth - 190 + 'px'

    window.addEventListener('resize', () => {
      aside_height.style.height = document.documentElement.clientHeight + 'px'
      main.style.height = document.documentElement.clientHeight - 86 + 'px'
      main.style.width = document.documentElement.clientWidth - 190 + 'px'
      header.style.width = document.documentElement.clientWidth - 190 + 'px'
    })

    //文件拖拽
    main.addEventListener('drop', e => {
      e.stopPropagation(); // 防止浏览器打开新的标签页（firefox）
      e.preventDefault(); // 阻止拖放后的浏览器默认行为

      const fileList = e.dataTransfer.files

      const filePathArr  = []

      for (const item of fileList) {
        if(window.fileOps.isDir(item.path))
          window.fileOps.saveDir(item.path)
        else
          // window.fileOps.saveFile(item.path)
          filePathArr.push(item.path)
      }
      window.fileOps.saveFile(filePathArr)



    })
    main.addEventListener('dragover', (e) => {
      //必须要阻止拖拽的默认事件
      e.preventDefault();
      e.stopPropagation();
    })
  },
  data() {
    return {
      multipleSelection: [],
      componentName: 'myNotes'
    };
  },
  methods: {
    checked(id, num) {
      const btn = document.getElementById(id);
      btn.style.color = "#0F62FE";
      btn.style.backgroundColor = "#fff";

      for (let i = 1; i <= 11; i++) {
        if (i == num) continue;
        const tmp = document.getElementById("btn" + i);
        tmp.style.background = "#F4F4F7";
        tmp.style.color = "#303133";
      }
    },
  },
};
</script>

<style>
#aside {
  width: 150px;
  background-color: #f4f4f7;
  padding-left: 20px;
  padding-right: 20px;
  float: left;
}

/* #asideTop {} */

#asideIcon {
  margin-top: 20px;
  width: 60px;
  height: 60px;
}

#header {
  padding-top: 16px;
  width: 100%;
  height: 70px;
  background-color: #f4f4f7;
  position: absolute;
  left: 190px;
}

#searchInput {
  float: right;
  margin-top: 10px;
  margin-right: 30px;
}

#notify {
  float: right;
  margin-top: 10px;
  margin-right: 30px;
}

#main {
  background: white;
  border-radius: 10px;
  position: absolute;
  left: 190px;
  top: 85px;
  overflow: scroll;
}

.asideGroupName {
  width: 130px;
  float: left;
  margin-top: 15px;
  text-align: left;
  padding: 5px;
  color: #606266;
  font-size: small;
  font-weight: 500;
}

.demo {
  width: 130px;
  float: left;
  margin-top: 5px;
  text-align: left;
  padding: 10px;
  color: #303133;
}
</style>
