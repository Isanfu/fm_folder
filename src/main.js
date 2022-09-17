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
const filesize = require('filesize')


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

Vue.prototype.formatTableData = (data) => {
  let i = 1;
  for (let item of data) {
    item.rowId = 'row' + i
    i++
    item = Vue.prototype.formatFileSize(item)
  }
  return data
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
      downloadData: []
    }
  },
  mounted(){
    
  },
  render: h => h(App)
}).$mount('#app')
