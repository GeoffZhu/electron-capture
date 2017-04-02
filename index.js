const Electron = require('electron')
const fs = require('fs')
const { BrowserWindow, app } = require('electron')
require('./src/main')

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

    mainWindow.captureFullPage(function(imageStream){
      // return image Stream
      imageStream.pipe(fs.createWriteStream('example.png'));
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