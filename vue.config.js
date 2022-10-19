const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8999
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      customFileProtocol: "./",
      builderOptions: {
        productName: 'FM文件夹',
        appId: 'com.sanfu.person',
        copyright: 'copyright @ sanfu',
        mac: {
          icon: '/Users/sanfu/Desktop/file_share/public/icon.icns'
        },
        win:{
          icon: ''
        },
        extraResources: [
          {
            from: 'src/child_process/',
            to: 'child_process/'
          },
          {
            from: 'src/file_broadcast',
            to: 'file_broadcast'
          },
          {
            from: 'src/utils',
            to: 'utils'
          },
          {
            from: 'src/mobileDevicePage',
            to: 'mobileDevicePage'
          },
          {
            from: 'src/db',
            to: 'db'
          },
          {
            from: 'src/dbInstance',
            to: 'dbInstance'
          },
          {
            from: 'src/config',
            to: 'config'
          },
          {
            from: 'src/entity',
            to: 'entity'
          }
        ]
      }
    }
  },
})
