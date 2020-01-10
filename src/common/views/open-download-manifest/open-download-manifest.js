const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

const Games = require('../../controllers/games');

function downloadManifest(gameId, channelId) {
    const games = new Games();
    if (games == undefined) {
        throw Error('Cannot start games module');
    }

    const linkElem = document.getElementById(`${gameId}-${channelId}`);
    if (linkElem == undefined) {
        throw Error('linkElem undefined');
    }

    games.getRelease(gameId, channelId).then(releaseInfo => {
        const manifestPath = `${releaseInfo.data.gameId}-${releaseInfo.data.channelId}-${releaseInfo.data.version}.manifest`;
        games.downloadManifest(releaseInfo.data, manifestPath, (current, total, percent) => {
            linkElem.innerHTML = `${percent} %`;
        }, () => {
            linkElem.innerHTML = 'Download again';
        });
    });
}

function openManifest() {
    const files = dialog.showOpenDialog({
        title: 'Open Manifest File',
        filters: [
            {
                name: 'RSI Manifest File',
                extensions: [ 'manifest' ]
            }
        ]
    }).then(files => {
        if (files != undefined && files.filePaths != undefined) {
            ipcRenderer.send('manifest@parse', files.filePaths.pop());
        }
    });
}

ipcRenderer.on('game-list@show-games', (event, gameList) => {
    if (gameList != undefined && gameList.games != undefined) {
        const games = gameList.games;
        let innerHTML = '';

        for (let game of games) {
            for (let channel of game.channels) {
                innerHTML += '<tr>';
                innerHTML+= `<td>${game.name}</td><td>${channel.name}</td><td>${channel.versionLabel}</td><td><a class="manifest-link" id="${game.id}-${channel.id}" onclick="downloadManifest('${game.id}', '${channel.id}')">Download</a></td>`;
                innerHTML += '</tr>';
            }
        }

        const tblGameList = document.getElementById('tblGameList');
        if (tblGameList == undefined) {
            throw Error('tblGameList undefined');
        }
    
        tblGameList.innerHTML = innerHTML;
    }
});