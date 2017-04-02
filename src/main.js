const fs = require('fs')
const Pixelsmith = require('pixelsmith')
const { BrowserWindow, ipcMain, app } = require('electron')
const { fsExistsSync } = require('./tools')

let tempDir = app.getPath('userData') + '/.temp_capture', pixelsmith = new Pixelsmith(), canvas = null, contentSize = null, captureTimes = 1
let targetWindow = null, callback = null, options = {}

ipcMain.on('start-capture', function(events){
  targetWindow.webContents.send('get-content-size')
})
ipcMain.on('return-content-size', function (events, size) {
  contentSize = size
  captureTimes = Math.ceil(contentSize.height/contentSize.windowHeight)
  targetWindow.webContents.send('move-page-to', 1)
})
ipcMain.on('return-move-page', function (events, page) {
  let options = {
    x: 0,
    y: 0,
    width: contentSize.windowWidth,
    height: contentSize.windowHeight
  }
  if (page === captureTimes) {
    options.height = contentSize.height - ((captureTimes - 1) * contentSize.windowHeight)
    options.y = contentSize.windowHeight - options.height
  }
  targetWindow.capturePage(options, function (image) {
    if (!fsExistsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }
    fs.writeFile(tempDir + '/' + page + '.png', image.toPNG(), function(err){
      if (page !== captureTimes) {
        targetWindow.webContents.send('move-page-to', page + 1)
      } else {
        flattenPNG()
      }
    })
  })
})

function flattenPNG () {
  let fileNames = [], y = 0, canvasHeight = 0, canvasWidth = 0, scrollBarWidth = 0
  for (var i = 1 ; i <= captureTimes; i++) {
    fileNames.push(tempDir + '/' + i + '.png')
  }
  pixelsmith.createImages(fileNames, function handleImages (err, imgs) {
    // If there was an error, throw it
    if (err) { console.log(err) }
    if (canvasWidth === 0) canvasWidth = imgs[0].width
    scrollBarWidth = canvasWidth/contentSize.width*contentSize.scrollBarWidth
    imgs.forEach(function(img) {
      canvasHeight += img.height
    })
    // Create a canvas that fits images
    canvas = pixelsmith.createCanvas(canvasWidth - scrollBarWidth, canvasHeight)
    // Add the images to canvas 
    imgs.forEach(function(img, index){
      canvas.addImage(imgs[index], 0, y);
      y += imgs[index].height 
    })
    // Export canvas to image
    var resultStream = canvas['export']({format: 'png'})
    callback(resultStream)
  })
}

BrowserWindow.prototype.captureFullPage = function(_callback, _options){
  targetWindow = this
  callback = _callback
  options = _options || {}
  canvas = null
  this.webContents.executeJavaScript(`
      var ipcRender = require('electron').ipcRenderer;
      ipcRender.send('start-capture');
  `)
}