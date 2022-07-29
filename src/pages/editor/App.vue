<template>
  <div id="app">
    <!-- <button @click="enableEditable">进入编辑模式</button> -->
     <v-md-editor :height="windowHeight" @save="save" v-model="text"  :mode="mode" tab-size="5"></v-md-editor>
  </div>
</template>

<script>

export default {
  data() {
    return {
      text: '## demo',
      windowHeight: '',
      mode: 'editable'
    };
  },
  mounted(){
    this.windowHeight = document.documentElement.clientHeight + 'px'
    window.addEventListener('resize',()=>{
      this.windowHeight = document.documentElement.clientHeight + 'px'
    })

    

  },
  methods: {
    save(text){
      console.log(text);
      //  window.ipc.saveNote(txt)
      this.$prompt('输入文件名', '保存', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          inputPattern: /^[\u4e00-\u9fa5_a-zA-Z0-9_-]+$/,
          inputErrorMessage: '文件名格式不正确'
        }).then(({ value }) => {
          window.noteOps.saveNote(value,text)
        }).catch((err) => {
          if(err) throw err
        });
    },
    //进入编辑模式
    enableEditable(){
      this.mode = 'editable'
    }
  }
};
</script>
