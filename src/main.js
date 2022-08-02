import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import  VueCookies  from 'vue-cookies';
import 'element-ui/lib/theme-chalk/index.css';



Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueCookies)


new Vue({
  router,
  data(){
    return{
      topBar: [{
        key: '0',
        name: '文件'
      }]
    }
  },
  render: h => h(App)
}).$mount('#app')
