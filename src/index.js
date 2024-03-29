const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./common/windows/window');
const Signin = require('./common/controllers/signin');
const Games = require('./common/controllers/games');
const RsiManifest = require('./common/controllers/rsi-manifest');
const ObjectStore = require('./common/controllers/object-store');

let mainWindow = null;
let manifestWindow = null;

global.DownloadFolder = `Downloads`;

app.on('ready', () => {

    // if session X-RSI-Token
        // try getting data with token
        // if succeed
            // show logged screen
        // if fail
            // show login screen
    // if not
        // show login screen

    mainWindow = new Window({
        file: path.join(__dirname, 'index.html'),
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        resizable: false,
        open: true
    });

    manifestWindow = new Window({
        file: path.join(__dirname, 'common/views/open-download-manifest/open-download-manifest.html'),
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        resizable: false,
        open: false,
        height: 400,
        width: 600
    });
});

ipcMain.on('auth@login', (event, authParams) => {
    if (authParams == undefined) {
        throw Error('authParams undefined');
    }

    const { username, password, captcha } = authParams;

    if (username == undefined) {
        throw Error('username undefined');
    }

    if (password == undefined) {
        throw Error('password undefined');
    }
    
    const signin = new Signin();
    if (signin == undefined) {
        throw Error('Cannot start signin module');
    }

    signin.signin(username, password, captcha).then(
        signinResponse => {
            mainWindow.send('auth@show-login');
            mainWindow.send('auth@hide-captcha');
            mainWindow.send('auth@hide-authenticator');

            switch (signinResponse.code) {
                case 'OK':
                    signin.setupConnectedData({ displayName: signinResponse.data.displayname, nickName: signinResponse.data.nickname });
                    mainWindow.send('auth@hide-login');
                    mainWindow.send('auth@show-user');
                    break;
                case 'ErrInvalidChallengeCode':
                case 'ErrCaptchaRequiredLauncher':
                    signin.getCaptcha().then(captchaResponse => mainWindow.send('auth@show-captcha', captchaResponse));
                    break;
                case 'ErrWrongPassword_username':
                    mainWindow.send('auth@wrong-credentials');
                    break;
                case 'ErrMultiStepRequired':
                    mainWindow.send('auth@hide-login');
                    mainWindow.send('auth@show-authenticator');
                    break;
                default:
                    break;
            }
        }
    )
});

ipcMain.on('auth@validate', (event, validationParams) => {
    const signin = new Signin();
    if (signin == undefined) {
        throw Error('Cannot start signin module');
    }

    signin.validate(validationParams.code).then(
        validationResponse => {
            if (validationResponse.code === "OK") {
                signin.setupConnectedData({ displayName: validationResponse.displayname, nickName: validationResponse.nickname });
                mainWindow.send('auth@hide-login');
                mainWindow.send('auth@hide-authenticator');
                mainWindow.send('auth@show-user');
            }
        }
    );
});

ipcMain.on('game-list@open-window', (event) => {
    const games = new Games();
    if (games == undefined) {
        throw Error('Cannot start games module');
    }

    games.getLibrary().then(
        library => {
            manifestWindow.send('game-list@show-games', library.data);
            manifestWindow.show();
        }
    );
});

let rsiManifestFile = null;
ipcMain.on('manifest@parse', (event, filePath) => {
    const games = new Games();
    if (games == undefined) {
        throw Error('Cannot start games module');
    }

    const _path = path.parse(filePath);
    const filename = _path.base;
    const rgxMatches = new RegExp(/([A-Z]+)\-([A-Z]+)\-\d+\.manifest/gm).exec(filename);
    if (rgxMatches == undefined || rgxMatches.length == 0) {
        throw Error('Failed to parse filename');
    }

    const gameId = rgxMatches[1];
    const channelId = rgxMatches[2];

    games.getRelease(gameId, channelId).then(releaseInfo => global.releaseInfo = releaseInfo.data);

    rsiManifestFile = new RsiManifest();
    if (rsiManifestFile == undefined) {
        throw Error('Cannot build manifest parser');
    }

    manifestWindow.hide();
    mainWindow.send('manifest@update-parsing-state', 'started');

    rsiManifestFile.parse(filePath, (str) => {
        // update current parsing state
        mainWindow.send('manifest@update-parsing-state', str);
    }, (filesTree) => {
        mainWindow.send('manifest@update-parsing-state', 'finished');
        mainWindow.send('manifest@update-parsing-state', 'Parsing complete');
        mainWindow.send('manifest@update-file-tree', filesTree);
    });
});

ipcMain.on('manifest@download-file', (event, fileData) => {
    const index = fileData.index;
    const _path = path.parse(fileData.path);

    const releaseInfo = global.releaseInfo;

    const filename = _path.base;
    const filepath = _path.dir;
    const targetFolder = `${global.DownloadFolder}/${releaseInfo.gameId}-${releaseInfo.channelId}-${releaseInfo.version}`;

    if (!fs.existsSync(`${targetFolder}/${filepath}`)) {
        fs.mkdirSync(`${targetFolder}/${filepath}`, { recursive: true });
    }

    const fileRecord = rsiManifestFile.getFileRecord(index);

    if (releaseInfo == undefined) {
        throw Error('releaseInfo undefined');
    }

    const objectStore = new ObjectStore(releaseInfo.objects);
    if (objectStore == undefined) {
        throw Error('Unable to create ObjectStore');
    }

    objectStore.downloadFile(fileRecord, `${targetFolder}/${filepath}`, filename, (current, total, percent) => mainWindow.send('manifest@download-file-update', { current: current, total: total, percent: percent }), null).then(() => {});
});