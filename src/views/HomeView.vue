<template>
  <div id="body">
    <div style="height: 25px;width: 100%;background-color: #f4f4f7; -webkit-app-region: drag;"></div>
    <div id="aside">
      
      <div id="asideTop">
        <div id="asideIcon">
          <img :src="require('@/assets/fm_folder.svg')" alt="" srcset="">
        </div>
        <div style="float:left;margin-top: 30px;font-weight:500;font-style: italic; font-size:15px;">FM文件夹</div>
        <div id="asideBtnGroup" style="margin-top: 10px">
          <span type="text" class="asideGroupName">文件</span>
          <div>
            <el-button @click="checked('btn1', 'myFile')" id="btn1" icon="el-icon-folder" type="text">我的文件
            </el-button>
          </div>

          <div>
            <el-button @click="checked('btn2', 'myShare')" id="btn2" icon="el-icon-position" type="text">我的分享
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn3', 'lanFile')" id="btn3" icon="el-icon-box" type="text">局域网文件</el-button>
          </div>

          <div>
            <el-button @click="checked('btn4', 'video')" id="btn4" icon="el-icon-video-camera" type="text">视频
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn5', 'audio')" id="btn5" icon="el-icon-headset" type="text">音频
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn6', 'image')" id="btn6" icon="el-icon-picture-outline" type="text">图片
            </el-button>
          </div>
          <div>
            <el-button @click="checked('btn7', 'document')" id="btn7" icon="el-icon-document" type="text">文档
            </el-button>
          </div>

          <div>
            <span type="text" class="asideGroupName">传输</span>

          </div>
          <div>

            <el-button @click="checked('btn8', 'downloadingFile')" id="btn8" icon="el-icon-download" type="text">
              <el-badge :value="awaitQueueLen == 0?'':awaitQueueLen" class="item">
                <div style="width: 63px;">正在下载</div>
              </el-badge>
            </el-button>

          </div>
          <div>

            <el-button @click="checked('btn9', 'downloadedFile')" id="btn9" icon="el-icon-circle-check" type="text">
              <el-badge :value="downloadedLen == 0?'':downloadedLen" class="item">
                <div style="width: 63px;">下载完成</div>
              </el-badge>

            </el-button>

          </div>
        </div>
      </div>
    </div>
    <div id="header">

      <div id="topBar">

        <span v-for="item in items" :key="item.key" style="font-size:medium; cursor:pointer;color: black;"
          @click="topBarOps(item.key)">
          <em v-if="item.key != '0'" class="el-icon-arrow-right" /> {{ item.name }}
        </span>
      </div>
      <div id="searchInput">
        <el-input v-model="searchKey" placeholder="搜索全部文件" @keyup.enter.native="searchData"
          prefix-icon="el-icon-search">
        </el-input>
      </div>

      <!-- <div id="notify">
        <el-button type="text" style="color: #0f62fe">消息</el-button>
      </div> -->
      <div id="mobilePage">
        <el-popover placement="bottom" trigger="click">
          <div id="qrcode"></div>
          <el-button slot="reference" type="text" style="color: #0f62fe" icon="el-icon-mobile-phone"></el-button> 
        </el-popover>
      </div>

      <div id="avatar">
        <el-dropdown @command="updateUser">
          <el-avatar :size="40"
            :src="defaultAvatarImg == '' ? require(`@/assets/default_avatar.png`) : require(`@/assets/${defaultAvatarImg}`)">
          </el-avatar>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item style="font-weight: bolder;" disabled>当前用户：{{ userInfo.username }} </el-dropdown-item>
            <el-dropdown-item command="username" divided>修改用户名</el-dropdown-item>

            <el-dropdown-item command="password">修改密码</el-dropdown-item>
            <el-dropdown-item command="avatar">更改头像</el-dropdown-item>
            <el-dropdown-item command="userExit">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </div>
    </div>
    <el-dialog title="修改密码" :visible.sync="passwordDialogVisible" width="30%">
      <el-input v-model="oldPassword" autocomplete="off" placeholder="请输入旧密码"></el-input>

      <el-input style="margin-top: 20px" v-model="newPassword" autocomplete="off" placeholder="请输入新密码"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword">确 定</el-button>
      </span>
    </el-dialog>

    <div id="main">
      <component :is="componentName" :type="fileType" :searchKey="serarchMsg"></component>
    </div>

  </div>

</template>

<script>

import classifyFile from "@/components/classifyFile.vue";
import myFile from "@/components/myFile";
import myShare from "@/components/myShare.vue";
import lanFile from "@/components/lanFile.vue";
import downloadingFile from "@/components/downloadingFile.vue";
import downloadedFile from "@/components/downloadedFile.vue";
import AraleQrcode from 'arale-qrcode'
export default {
  name: 'HomeView',
  components: {
    myFile,
    classifyFile,
    myShare,
    lanFile,
    downloadingFile,
    downloadedFile
  },
  data() {
    return {
      componentName: 'myFile',
      defaultAvatarImg: '',
      fileType: '',
      passwordDialogVisible: false,
      oldPassword: '',
      newPassword: '',
      userInfo: this.$root.$data.userInfo,
      searchKey: '',
      serarchMsg: '',
      downloadedLen: 0,

    };
  },
  computed: {
    items() {
      return this.$root.$data.topBar
    },
    awaitQueueLen() {
      return this.$root.$data.awaitDownloadQueue.length
    },
  },
  mounted() {
    let aside_height = document.getElementById('aside')
    let main = document.getElementById('main')
    let header = document.getElementById('header')
    let topBar = document.getElementById('topBar')
    let myFile = document.getElementById('btn1')

    myFile.style.background = '#fff'
    myFile.style.color = '#0F62FE'

    aside_height.style.height = document.documentElement.clientHeight - 25 + 'px'
    main.style.height = document.documentElement.clientHeight - 86 + 'px'
    main.style.width = document.documentElement.clientWidth - 190 + 'px'
    header.style.width = document.documentElement.clientWidth - 190 + 'px'
    topBar.style.width = (document.documentElement.clientWidth - 190) * 0.4 + 'px'
    window.addEventListener('resize', () => {
      aside_height.style.height = document.documentElement.clientHeight - 25 + 'px'
      main.style.height = document.documentElement.clientHeight - 86 + 'px'
      main.style.width = document.documentElement.clientWidth - 190 + 'px'
      header.style.width = document.documentElement.clientWidth - 190 + 'px'
      topBar.style.width = (document.documentElement.clientWidth - 190) * 0.4 + 'px'
    })

    const user = this.userInfo
    if (user.avatar != 'default_avatar.png')
      this.defaultAvatarImg = user.avatar

    const qrcodeConf = new AraleQrcode({
      "render": 'svg',
      "text": `http://${window.userOps.getLocalIp()}:9797/mobileDeviceRequest/0?${this.userInfo.id}`,
      "size": 120
    })
    var share_tools = document.querySelector('#qrcode')
    share_tools.appendChild(qrcodeConf)
  },

  methods: {
    checked(id, args) {

      const btn = document.getElementById(id);
      btn.style.color = "#0F62FE";
      btn.style.backgroundColor = "#fff";

      for (let i = 1; i <= 9; i++) {
        if ('btn' + i != id) {
          const tmpBtn = document.getElementById('btn' + i);
          tmpBtn.style.background = '#F4F4F7'
          tmpBtn.style.color = 'black'
        }
      }
      if (id == 'btn1' || id == 'btn2' || id == 'btn3' || id == 'btn8' || id == 'btn9') {
        this.componentName = args
      } else {
        this.componentName = 'classifyFile'
        this.fileType = args
      }
      if (id == 'btn9')
        this.downloadedLen = 0
    },
    updatePassword() {
      const user = this.userInfo
      if (window.userOps.md5ForPassword(this.oldPassword) != user.password) {
        this.$message.error('密码错误！');
      } else {
        window.userOps.updateUser('password', user.id, window.userOps.md5ForPassword(this.newPassword), data => {
          console.log(data);
          user['password'] = window.userOps.md5ForPassword(this.newPassword)

          this.userInfo = user
        })
      }
    },
    searchData() {
      this.componentName = 'myFile'
      this.serarchMsg = this.searchKey
    },
    topBarOps(itemId) {
      // console.log(itemId);
      const idx = this.$root.$data.topBar.map(o => o.key).indexOf(itemId)
      console.log(idx);
      const num = this.$root.$data.topBar.length - 1 - idx
      console.log(this.$root.$data.topBar.length - 1 - idx);

      for (let i = 0; i < num; i++)
        this.$root.$data.topBar.pop()

    },
    updateUser(command) {
      const user =this.userInfo
      let prompt = ''
      switch (command) {
        case 'username': prompt = '输入新用户名'; break;
        case 'password': prompt = '输入密码'; break;
        case 'avatar': window.userOps.updateUser('avatar', user.id); return;
      }

      if (command == 'password') {
        this.passwordDialogVisible = true
        return
      }

      if (command == 'userExit') {

        this.userInfo = ''
        this.$router.push('/')
        return
      }

      this.$prompt(prompt, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[^/\\:*?"<>|\\]{1,255}$/,
        inputErrorMessage: '不符合规则'
      }).then((newVal) => {
        window.userOps.updateUser(command, user.id, newVal.value, data => {
          console.log(data);
          user[command] = newVal.value
          this.userInfo = user
        })
      }).catch(() => {
        console.log('取消');
      })
    },
  },
};
</script>

<style scoped>
#aside {
  width: 150px;
  background-color: #f4f4f7;
  padding-left: 20px;
  padding-right: 20px;
  float: left;
}

/* #asideTop {} */

#asideIcon {
  width: 60px;
  height: 60px;
  float: left
}

#header {
  width: 100%;
  height: 70px;
  background-color: #f4f4f7;
  position: absolute;
  left: 190px;
  min-width: 0;

}

#searchInput,
/* #notify, */
#mobilePage,
#avatar {
  float: right;
  margin-right: 30px;
}

#main {
  background: white;
  border-radius: 10px;
  position: absolute;
  left: 190px;
  top: 85px;
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

#topBar {
  float: left;
  margin-top: 5px;
  height: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}


#asideBtnGroup :deep() .el-button {
  background-color: #F4F4F7;
  width: 130px;
  float: left;
  margin-top: 5px;
  text-align: left;
  padding: 10px;
}

#asideBtnGroup :deep() .el-button--text {
  color: black;
  font-size: small;
}

#asideBtnGroup :deep() .el-button--text:focus,
.el-button--text:hover {
  color: #0F62FE;
}
</style>
