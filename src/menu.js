const { app } = require('electron')

const isMac = process.platform === 'darwin'
exports.template = [
   ...(isMac ? [{
      label: app.name,
      submenu: [
         { label: '关于fm_folder', role: 'about' },
         { type: 'separator' },
         { label: '服务', role: 'services' },
         { type: 'separator' },
         { label: '隐藏fm_folder', role: 'hide' },
         { label: '隐藏其它', role: 'hideOthers' },
         { label: '全部显示', role: 'unhide' },
         { type: 'separator' },
         { label: '退出', role: 'quit' }
      ]
   }] : []),
   {
      label: 'File',
      submenu: [
         isMac ? { label: '关闭窗口', role: 'close' } : { label: '退出', role: 'quit' }
      ]
   },
   {
      label: 'Edit',
      submenu: [
         { label: '撤消', role: 'undo' },
         { label: '重做', role: 'redo' },
         { type: 'separator' },
         { label: '剪切', role: 'cut' },
         { label: '拷贝', role: 'copy' },
         { label: '粘贴', role: 'paste' },
         ...(isMac ? [
            { label: '粘贴并匹配样式', role: 'pasteAndMatchStyle' },
            { label: '删除', role: 'delete' },
            { label: '全选', role: 'selectAll' },
            { type: 'separator' },
            {
               label: '讲话',
               submenu: [
                  { label: '开始讲话', role: 'startSpeaking' },
                  { label: '停止讲话', role: 'stopSpeaking' }
               ]
            }
         ] : [
            { label: '删除', role: 'delete' },
            { type: 'separator' },
            { label: '全选', role: 'selectAll' }
         ])
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
               await shell.openExternal('https://github.com/Isanfu/fm_folder')
            }
         }
      ]
   }
]