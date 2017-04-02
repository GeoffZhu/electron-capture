const fs = require('fs')
const Electron = require('electron')
const { BrowserWindow, app } = require('electron')
require('electron-capture')

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
    // init BrowserWindow

    // when need full capture, call function captureFullPage
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