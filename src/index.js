const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        resizable: false
    });

    mainWindow.loadFile('index.html');
});