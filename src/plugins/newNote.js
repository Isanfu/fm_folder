const newNote = Object.create(null)


newNote.install = (Vue) => {
   Vue.prototype.$newNote = (window)=>{
      window.ipc.senda()
      // alert('1')
}
}

export default newNote