const fs = require('fs')
const Pixelsmith = require('pixelsmith')
const { ipcMain } = require('electron')

let tempDir = './.temp_capture'

function fsExistsSync(path) {
  try {
    fs.accessSync(path,fs.F_OK);
  }catch (e) {
    return false;
  }
  return true;
}

module.exports.init = function (targetWindow) {
    var pixelsmith = new Pixelsmith()
    let contentSize = null, captureTimes = 1
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
            comPNG()
          }
        })
      })
    })

    function comPNG () {
      let fileNames = [], y = 0, canvasHeight = 0, canvasWidth = 0, scrollBarWidth = 0
      for (var i = 1 ; i <= captureTimes; i++) {
        fileNames.push(tempDir + '/' + i + '.png')
      }
      pixelsmith.createImages(fileNames, function handleImages (err, imgs) {
        // If there was an error, throw it
        if (err) {
          throw err;
        }
        imgs.forEach(function(img) {
          if (canvasWidth === 0) canvasWidth = img.width
          canvasHeight += img.height
        })
        scrollBarWidth = canvasWidth/contentSize.width*contentSize.scrollBarWidth
        // Create a canvas that fits our images
        var canvas = pixelsmith.createCanvas(canvasWidth - scrollBarWidth, canvasHeight);
        // Add the images to our canvas 
        imgs.forEach(function(img, index){
          canvas.addImage(imgs[index], 0, y);
          y += imgs[index].height 
        })
        // Export canvas to image
        var resultStream = canvas['export']({format: 'png'});  // Readable stream outputting PNG image of the canvas
        targetWindow.emit('capture-done', resultStream)
      });
    }
}

module.exports.start = function (targetWindow) {
  targetWindow.webContents.executeJavaScript(`
      var ipcRender = require('electron').ipcRenderer;
      ipcRender.send('start-capture');
  `)

}