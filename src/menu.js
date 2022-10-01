const { app } = require('electron')


exports.template = [
   {
      label: app.name,
      submenu: [
         {
            label: '偏好设置',

         },
         { type: 'separator' },
         {
            label: '检查更新'
         },
         { type: 'separator' },
         {
            label: '服务',
            role: 'services'
         },
         { type: 'separator' },
         {
            label: '隐藏',
            role: 'hide'
         },
         {
            label: '隐藏其它',
            role: 'hideOthers'
         },
         {
            label: '全部显示',
            role: 'unhide'
         },
         { type: 'separator' },
         {
            label: '退出',
            role: 'quit'
         }
      ]
   },
   {
      label: '修改',
      submenu: [
         {
            label: '撤销',
            role: 'undo'
         },
         {
            label: '重做',
            role: 'redo'
         },
         { type: 'separator' },
         {
            label: '剪切',
            role: 'cut'
         },
         {
            label: '拷贝',
            role: 'copy'
         },
         {
            label: '粘贴',
            role: 'paste'
         },

         {
            label: '粘贴并匹配样式',
            role: 'pasteAndMatchStyle'
         },
         {
            label: '删除',
            role: 'delete'
         },
         {
            label: '选择所有',
            role: 'selectAll'
         },
         { type: 'separator' },
         {
            label: '讲话',
            submenu: [
               {
                  label: '开始讲话',
                  role: 'startSpeaking'
               },
               {
                  label: '停止讲话',
                  role: 'stopSpeaking'
               }
            ]
         }
      ]
   },
   {
      label: '窗口',
      submenu: [
         {
            label: '最小化',
            role: 'minimize'
         },
         {
            label: '缩放',
            role: 'zoom'
         },
         { type: 'separator' },
         {
            label: '前置窗口',
            role: 'front'
         },
         { type: 'separator' },
         {
            label: '关闭窗口',
            role: 'close'
         }
      ]
   },
   {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
]