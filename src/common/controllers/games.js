const Config = require('../../config');
const Http = require('../network/http');

class Games {
    constructor(client = new Http(Config.rsiApiUrl)) {
        this.client = client;
    }

    async getClaims() {
        return await this.client.post('/games/claims');
    }

    async getLibrary() {
        const claims = await this.getClaims();
        return await this.client.post('/games/library', { claims: claims.data });
    }

    async getRelease(gameId, channelId) {
        const claims = await this.getClaims();
        return await this.client.post('/games/release', { gameId: gameId, channelId: channelId, claims: claims.data })
    }

    async downloadManifest(releaseInfo, path, progressCallback = null, completeCallback = null) {
        return await this.client.downloadFile(`${releaseInfo.manifest.url}?${releaseInfo.manifest.signatures}`, path, null, progressCallback, completeCallback);
    }
};

module.exports = Games;