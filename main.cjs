const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.maximize(true)    
    win.loadURL('http://localhost:5173')

    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F11') {
            win.setFullScreen(!win.isFullScreen())
        }
    })
}

app.whenReady().then(createWindow)