# electron-capture

> An extension for Electron's BrowserWindow, Make it have the ability to capture full page.

[![npm version](https://img.shields.io/npm/v/electron-capture.svg)](https://www.npmjs.com/package/electron-capture)

### Why I create this repo
I tried a lots of npm packages, but no one can add the feature (full page capture) for my electron-application. So I code this.

### Install

``` sh
npm install electron-capture --save
```

### Usage

``` javascript
require('electron-capture')

mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    resizable: true,
    webPreferences: {
        preload: __dirname + '/node_modules/electron-capture/src/preload.js'
    }
})
mainWindow.loadURL('https://www.google.com/')

mainWindow.captureFullPage(function(imageStream){
    // return an image Stream
    imageStream.pipe(fs.createWriteStream('example.png'));
})

```

[Demo](https://github.com/GeoffZhu/electron-capture/tree/master/demo)

