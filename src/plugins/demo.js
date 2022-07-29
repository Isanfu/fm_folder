const demo = Object.create(null)


demo.install = Vue => {
   Vue.prototype.$demo = () => {
      alert('111')
    }
}

export default demo