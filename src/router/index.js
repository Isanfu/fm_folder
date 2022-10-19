import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from "@/views/HomeView";
import LanLoginView from "@/views/LanLoginView"

Vue.use(VueRouter)

const routes = [
  {
    path: '/homeView',
    name: "home",
    component: HomeView
  },{
    path: '/',
    name: 'lanLogin',
    component: LanLoginView
  }
]

const router = new VueRouter({
  // mode: 'history',
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
