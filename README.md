# electron-capture

> A small webpage capture extension for electron Application. Get a screenshot of the full webpage.

![](http://o80ronwlu.bkt.clouddn.com/electron-capture.gif)

### Why I create this repo
I tried a lots of npm packages, but no one can add the feature (full page screenshot) for my electron-application. So I code it.

### Install

npm install electron-capture --save

### Usage

``` javascript
const electronCapture = require('electron-capture')

mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    resizable: true,
    webPreferences: {
        preload: __dirname + '/node_modules/electron-capture/src/preload.js'
    }
})
mainWindow.loadURL('https://www.google.com/')
// mainWindow.openDevTools()
// init some ipc events for mainWindow
electronCapture.init(mainWindow)

// start capture
electronCapture.start(mainWindow)

mainWindow.on('capture-done', function(resultStream){
    // resultStream: capture image Stream
    resultStream.pipe(fs.createWriteStream('result.png'));
})
```

[Demo Here](https://github.com/GeoffZhu/electron-capture/tree/master/demo)

