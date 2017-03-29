const Electron = require('electron')
const fs = require('fs')
const { BrowserWindow, app } = require('electron')
const electronCapture = require('./src/main')


let mainWindow = null

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 2768,
        resizable: true,
        webPreferences: {
            preload: __dirname + '/src/preload.js',
            webSecurity: true
        }
    })
    mainWindow.loadURL('https://www.google.com/')
    mainWindow.openDevTools()
    electronCapture.init(mainWindow)
    electronCapture.start(mainWindow)

    mainWindow.on('capture-done', function(resultStream){
      resultStream.pipe(fs.createWriteStream(Math.random() + 'com.png'));
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