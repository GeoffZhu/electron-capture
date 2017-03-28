const fs = require('fs')
const Electron = require('electron')
const { BrowserWindow, app } = require('electron')
const electronCapture = require('electron-capture')

let mainWindow = null

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 2768,
        resizable: true,
        webPreferences: {
            preload: __dirname + '/node_modules/electron-capture/src/preload.js'
        }
    })
    mainWindow.loadURL('https://www.google.com/')
    // mainWindow.openDevTools()
    electronCapture.init(mainWindow)
    electronCapture.start(mainWindow)
    mainWindow.on('capture-done', function(resultStream){
      resultStream.pipe(fs.createWriteStream('com.png'));
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})