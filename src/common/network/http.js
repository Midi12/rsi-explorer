const fs = require('fs');
const fetch = require('node-fetch');
const setCookie = require('set-cookie-parser');

const Session = require('../controllers/session');

class Http {

    constructor(url) {
        this.baseUrl = url;
        this.session = new Session();
    }

    async fetch(url, opts) {

        this.session.forEach((key, value) => {
            if (key === 'X-Rsi-Token' || key === 'X-Rsi-Device') {
                opts.headers.append(key, value);
            }
        })

        const response = await fetch(`${this.baseUrl}${url}`, opts);

        if (!response.ok) {
            throw Error(`Request failed (${response.status}) : ${response.statusText}`);
        }

        if (response.headers != undefined && response.headers.get('set-cookie')) {
            const combinedCookies = response.headers.get('set-cookie');
            const splittedCookies = setCookie.splitCookiesString(combinedCookies);
            const cookies = setCookie.parse(splittedCookies, {
                decodeValues: false, 
                map: false
            });

            cookies.map(cookie => {
                switch (cookie.name) {
                    case 'Rsi-Token':    
                        this.session.set('X-Rsi-Token', cookie.value);
                        break;
                    case '_rsi_device':
                        this.session.set('X-Rsi-Device', cookie.value);
                    case 'moment_timezone':
                        this.session.set('X-Moment-Timezone', decodeURI(cookie.value));
                        break;
                    default:
                        break;
                }
            });
        }

        return response;
    }

    async get(url, headers = null) {
        if (typeof url !== 'string') {
            throw Error('url is not a string');
        }

        if (headers != undefined && !(headers instanceof fetch.Headers)) {
            throw Error('headers is not a fetch.Headers object');
        }

        const options = {
            method: "Get",
            mode: "cors",
            headers: headers
        };

        return this.fetch(url, options).json();
    }

    async post(url, body, headers = null) {
        if (typeof url !== 'string') {
            throw Error('url is not a string');
        }

        if (headers != undefined && !(headers instanceof fetch.Headers)) {
            throw Error('headers is not a fetch.Headers object');
        }

        if (headers == null) {
            headers = new fetch.Headers();
        }

        headers.append('Content-Type', 'application/json');

        const options = {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(body),
            headers: headers
        };

        let response = await this.fetch(url, options);

        switch(response.headers.get('content-type')) {
            case 'application/json':
                response = response.json();
                break;
            case 'image/png':
                response = response.buffer();
                break;
            default:
                break;
        }

        return response;
    }

    async downloadFile(url, path, headers = null, progressCallback = null, completeCallback = null) {
        if (typeof url !== 'string') {
            throw Error('url is not a string');
        }

        if (headers != undefined && !(headers instanceof fetch.Headers)) {
            throw Error('headers is not a fetch.Headers object');
        }

        if (headers == null) {
            headers = new fetch.Headers();
        }

        headers.append('Content-Type', 'application/octet-stream');

        const request = new fetch.Request(url, {
            headers: headers
        });

        const response = await fetch(request);

        const finalLength = Number.parseInt(response.headers.get('Content-Length') || '0', 10);
        const writer = fs.createWriteStream(path);

        const dlProm = (reader, writer, finalLength) => {
            return new Promise((resolve, reject) => {
                let bytesDone = 0;
    
                let nChunk = 0;
                reader.on('data', chunk => {
                    if (progressCallback != undefined) {
                        bytesDone += chunk.byteLength;
                        const percent = Math.floor(bytesDone / finalLength * 100);
                        progressCallback(bytesDone, finalLength, percent);

                        //handle small dl
                        if (percent === 100 && nChunk === 0) {
                            if (completeCallback != undefined) {
                                completeCallback();
                            }
                        }

                        nChunk++;
                    }
                });
    
                reader.on('error', err => reject(err));
                reader.on('finish', () =>  {
                    if (progressCallback != undefined) {
                        progressCallback(bytesDone, finalLength, 100);
                    }
    
                    if (completeCallback != undefined) {
                        completeCallback();
                    }
    
                    resolve();
                });
    
                reader.pipe(writer);
            });
        };
    
        if (finalLength > 0) {
            await dlProm(response.body, writer, finalLength);
        } else {
            progressCallback(0, 0, 100);
            completeCallback();
        }
    }

    getSessionHeaders() {
        const headers = new fetch.Headers();

        this.session.forEach((value, key, map) => {
            headers.append(key, value);
        });

        return headers;
    }

    setSessionHeader(key, value) {
        this.session.set(key, value);
    }
};

module.exports = Http;