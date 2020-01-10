const Config = require('../../config');
const Http = require('../network/http');

class Account {
    constructor(client = new Http(Config.rsiApiUrl)) {
        this.client = client;
    }

    async getClaims() {
        return this.claims = await this.client.post('/account/claims');
    }
};

module.exports = Account;