const fs = require('fs');
const zstd = require ('node-zstandard');

const Http = require('../network/http');

class ObjectStore {
    constructor(objects) {
        this.objects = objects;
        this.client = new Http(objects.url);
    }

    async downloadFile(record, path, filename, progressCallback = null, completeCallback = null) {
        const recordSha256 = Buffer.from(record.sha256).toString('hex').toUpperCase();

        return await this.client.downloadFile(`${this.objects.url}/${recordSha256}?${this.objects.signatures}`, `${path}/${recordSha256}`, null, progressCallback, () => {
            if (record.compressionMethod === 100) {
                console.log(`Decompression started for ${filename}`);
                zstd.decompress(`${path}/${recordSha256}`, `${path}/${filename}`, (err, result) => {
                    if (err) {
                        throw err;
                    }
        
                    if (fs.existsSync(`${path}/${recordSha256}`)) {
                        fs.unlinkSync(`${path}/${recordSha256}`);
                    }

                    console.log(`File ${path}/${filename} downloaded !`);
                });
            } else {
                fs.renameSync(`${path}/${recordSha256}`, `${path}/${filename}`);
                console.log(`File ${path}/${filename} downloaded !`);
            }
            
            if (completeCallback != undefined) {
                completeCallback();
            }
        });
    }
};

module.exports = ObjectStore;