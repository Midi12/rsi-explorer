const Config = require('../../config');
const Http = require('../network/http');

const Session = require('../controllers/session');

class Signin {
    constructor(client = new Http(Config.rsiApiUrl), session = new Session()) {
        this.client = client;
        this.session = session;
    }

    async signin(username, password, captcha) {
        const authParams = {
            username,
            password
        };

        if (captcha != undefined) {
            authParams.captcha = captcha;
        }

        return await this.client.post('/signin', authParams);
    }

    async getCaptcha() {
        return await this.client.post('/signin/captcha');
    }

    async validate(code) {
        const multiStepPayload = {
            code: code,
            device_type: 'computer',
            device_name: 'Computer',
            duration: 'month'
        };

        return await this.client.post('/signin/multiStep', multiStepPayload);
    }

    getSession() {
        return this.client.session;
    }

    setupConnectedData({ displayName, nickName }) {
        this.session.set('displayName', displayName);
        this.session.set('nickName', nickName);
    }
};

module.exports = Signin;