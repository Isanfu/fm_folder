const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8999
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      // nodeIntegration: true,
      // externals: ['electron'], // 这里是你使用的原生模块名字列表，改成自己的即可
      // nodeModulesPath: ['../../node_modules', './node_modules', '../node_modules']// 这里是多个node_modules路径，按自己需要配置即可
    }
  },
  pages: {
    index: {
      entry: './src/main.js',
      template: './public/index.html',
      filename: 'index.html',
      title: 'index'
    },
    editor: {
      entry: './src/pages/editor/editor.js',
      template: './public/editor.html',
      filename: 'editor.html',
      title: '新建笔记'
    }
  }
})
