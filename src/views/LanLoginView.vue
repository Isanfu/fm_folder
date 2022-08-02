<template>
   <div id="body">
      <div id="login">
         <el-tabs v-model="activeName">
            <el-tab-pane label="设置用户" name="first">
               <el-form :model="registerFormData">

                  <el-form-item prop="username">
                     <el-input id="username" name="username" :autosize="true" placeholder="请输入用户名"
                        v-model='registerFormData.username' clearable style="margin-top: 20px;">
                     </el-input>
                  </el-form-item>

                  <el-form-item prop="password">
                     <el-input id="password" name="password" placeholder="请输入密码" v-model='registerFormData.password'
                        show-password clearable>
                     </el-input>
                  </el-form-item>


                  <el-button v-if="!btnFlag" type="primary" @click="submitRegisterForm(registerFormData)"
                     style="margin-top: 71px;width: 100%">
                     注册
                  </el-button>
                  <el-button v-if="btnFlag" type="primary" @click="submitSignInForm(registerFormData)"
                     style="margin-top: 71px;width: 100%">
                     登陆
                  </el-button>
               </el-form>
            </el-tab-pane>
         </el-tabs>
      </div>
   </div>
</template>

<script>

export default {
   name: "LanLoginView",
   mounted() {
      let body = document.getElementById('body')
      body.style.height = document.documentElement.clientHeight + 'px'
      this.formMarginTop('username')
      this.formMarginTop('password')

      window.userOps.isExistUser(data => {
         console.log(data);
         if (data['count(*)'] != 0)
            this.btnFlag = true
      })


   },
   data() {
      return {
         registerFormData: {
            username: '',
            password: ''
         },
         activeName: 'first',
         btnFlag: false
      }
   },

   methods: {
      //   输入框样式修改
      formMarginTop(id) {
         const el = document.getElementById(id)
         el.style.borderTop = '0px'
         el.style.borderLeft = '0px'
         el.style.borderRight = '0px'
         el.style.borderRadius = '0px'
         el.style.padding = '0px'
      },
      submitRegisterForm(registerFormData) {

         window.userOps.isRegisterUser(registerFormData.username, i => {
            if (i) {
               this.$message.error('用户已存在!')
            } else {
               console.log(registerFormData);
               let user = {
                  username: registerFormData.username,
                  password: window.userOps.md5ForPassword(registerFormData.password)
               }
               window.userOps.registerUser(user, res => {
                  this.$cookies.set('userInfo', res)
                  this.$router.push('/homeView')
               })
            }

         })

      },
      submitSignInForm(registerFormData) {
         const md5Password = window.userOps.md5ForPassword(registerFormData.password)
         window.userOps.signInUser(registerFormData.username,data=>{
            if(data.password === md5Password){
               console.log(data);
               this.$cookies.set('userInfo',data)
               this.$router.push('/homeView')
            }
               
            else
               this.$message.error('密码错误')
         })
         console.log(registerFormData);
      }

      //   toHome(){
      //     this.$router.push('/home-view')
      //   }
   }

}
</script>

<style scoped>
#body {
   margin: 0;
   padding: 0;
   display: flex;
}

#login {
   width: 350px;
   height: 450px;
   margin: 0 auto;
   align-self: center;
   background: #ffffff;
   padding: 20px;
}
</style>