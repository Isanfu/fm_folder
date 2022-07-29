<template>
  <div id="body">
    <div id="login">
      <el-tabs v-model="activeName">
        <el-tab-pane label="密码登录" name="first">
          <el-form :model="signInRuleForm" :rules="signInRules" ref="signInRuleForm">

            <el-form-item prop="email">
              <el-input id="email"
                        name="email"
                        :autosize="true"
                        placeholder="请输入邮箱"
                        v-model='signInRuleForm.email'
                        clearable
                        style="margin-top: 20px;">
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input id="password"
                        name="password"
                        placeholder="请输入密码"
                        v-model='signInRuleForm.password'
                        show-password
                        clearable>
              </el-input>
            </el-form-item>

            <div align="right">
              <el-link>忘记密码?</el-link>
            </div>

            <el-button type="primary" @click="submitSignInForm('signInRuleForm')" style="margin-top: 71px;width: 100%">
              登录
            </el-button>
          </el-form>
          <el-button type="danger" plain @click="toHome"
                     style="margin-top: 30px;width: 100%;" >进入局域网版本
          </el-button>
        </el-tab-pane>
        <el-tab-pane label="免密登录" name="second">

          <el-form :model="registerRuleForm" :rules="registerRule" ref="registerRuleForm">

            <el-form-item prop="registerRuleEmail">
              <el-input id="registerEmail"
                        name="email"
                        :autosize="true"
                        placeholder="请输入邮箱"
                        v-model='registerRuleForm.registerRuleEmail'
                        style="margin-top: 20px;"
                        clearable>
              </el-input>
            </el-form-item>

            <el-form-item prop="validRoleNum">
              <el-input id="valid-num"
                        name="validRoleNum"
                        placeholder="请输入验证码"
                        v-model='registerRuleForm.validRoleNum'>
              </el-input>
              <el-button :disabled="authBtnSwitch" @click="getValidNum" id="validBtn" style="border: 0">
                {{ authBtn }}
              </el-button>


            </el-form-item>

            <div>
              <p style="color: #909399;font-size: small">未注册邮箱验证后将自动注册登录</p>
            </div>

            <el-button type="primary" @click="submitRegisterForm('registerRuleForm')"
                       style="margin-top: 60px;width: 100%">注册/登录
            </el-button>
          </el-form>
          <el-button type="danger" plain @click="toHome"
                     style="margin-top: 30px;width: 100%;" >进入局域网版本
          </el-button>

        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>

export default {
  name: "LoginView",
  mounted() {
    let body = document.getElementById('body')
    body.style.height = document.documentElement.clientHeight + 'px'
    this.formMarginTop('email')
    this.formMarginTop('password')
    this.formMarginTop('registerEmail')
    this.formMarginTop('valid-num')
    this.login();

   
},
  watch: {
    registerRuleFoerm: {
      handler(newVal){
        const emailReg = /^(\w)+@(([a-zA-Z\d-])+.)+([a-zA-Z\d]{2,4})+$/;
        const flag = emailReg.test(newVal.registerRuleEmail)

        if(newVal.registerRuleEmail.length != 0 && flag == true && newVal.validRoleNum.length != 0){
          this.registeBtnFlag = false
        }
        else  if(newVal.registerRuleEmail.length != 0 && flag == true){
          this.authBtnSwitch = false
          this.registeBtnFlag = true
        }
        else{
          this.authBtnSwitch = true
          this.registeBtnFlag = true
        }
      },
      deep: true
    },
    signInRuleForm: {
      handler(newVal){
        const emailReg = /^(\w)+@(([a-zA-Z\d-])+.)+([a-zA-Z\d]{2,4})+$/;
        const flag = emailReg.test(newVal.email)
        this.signInFlag = !(newVal.email.length != 0 && newVal.password.length != 0 && flag == true);
      },
      deep: true
    }

  },
  data() {
    return {
      // 验证码按钮
      authBtn: '获取验证码',
      //   控制验证码按钮的disable属性
      authBtnSwitch: true,
      //   控制注册/登录按钮的disable属性
      registeBtnFlag: true,
      //   控制登录按钮的disable属性
      signInFlag: true,


      registerRuleForm: {
        registerRuleEmail: '',
        validRoleNum: '',

      },
      signInRuleForm: {
        email: '',
        password: ''
      },

      activeName: 'first',

      registerRule: {
        registerRuleEmail: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
        ],
        validRoleNum: [
          {required: true, message: '请输入验证码', trigger: 'blur'}
        ]
      },
      signInRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, message: '密码长度不小于6', trigger: 'blur'}

        ]
      },



    }
  },

  methods: {
    //   输入框样式修改
    formMarginTop(id){
      const el = document.getElementById(id)
      el.style.borderTop = '0px'
      el.style.borderLeft = '0px'
      el.style.borderRight = '0px'
      el.style.borderRadius = '0px'
      el.style.padding = '0px'
    },
    submitSignInForm(signInRuleForm) {
      this.$refs[signInRuleForm].validate((valid) => {
        //  验证通过
        if (valid) {
          //数据提交
          //将密码md5加密后传输
          // const  passwordWrapperMd5 = this.$md5(this.signInRuleForm.password)


          console.log('submit success!!');
        } else {
          //  验证失败
          console.log('error submit!!');
          return false;
        }
      });
    },
    submitRegisterForm(registerRuleForm) {
      this.$refs[registerRuleForm].validate((valid) => {
        //  验证通过
        if (valid) {
          //数据提交

          console.log('submit success!!');
        } else {
          //  验证失败
          console.log('error submit!!');
          return false;
        }
      });
    },
    getValidNum() {},

    //请求测试
    login(){


    },
  toHome(){
    this.$router.push('/home-view')
  }
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

#validBtn {
  position: absolute;
  right: 2px;

}

</style>