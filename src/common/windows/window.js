const { BrowserWindow } = require('electron');

const defaultConfig = {
    height: 800,
    width: 1000,
    show: false
};

class Window extends BrowserWindow {
    constructor({ file, ...config }) {
        super({ ...defaultConfig, ...config });

        this.loadFile(file);
        this.webContents.openDevTools();

        this.webContents.on('did-finish-load', () => {
            if (config.open === true) {
                this.show();
            }
        });
    }
}

module.exports = Window;