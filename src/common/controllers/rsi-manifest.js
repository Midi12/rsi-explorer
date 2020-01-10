const fs = require('fs');
const RsiManifestParser = require('../parsers/rsi-manifest');
const KaitaiStream = require('kaitai-struct/KaitaiStream');

buildStringTableRecursive = (table, node, str, progressCallback) => {
    if (node == undefined) {
        throw Error('Undefined node');
    }

    if (node.length !== 0) {
        str += node.data;
    }

    if (node.index > 0) {
        table.push({ index: node.index, path: str });
        if (progressCallback != undefined) {
            progressCallback(str);
        }
    }

    child = node.child;
    while (child != undefined) {
        child = buildStringTableRecursive(table, child, str, progressCallback);
    }

    return node.next;
};

buildStringTable = (manifest, progressCallback = null, completeCallback = null) => {
    const table = new Array();
    
    const root = manifest.stringNodes.root;
    if (root == undefined || root.index != 0) {
        throw Error('Ill-formated root node');
    }

    buildStringTableRecursive(table, root, '', progressCallback);

    if (completeCallback != undefined) {
        completeCallback(table);
    }

    return table;
};

buildFilesTreeFromStringTable = (stringTable) => {
    const root = stringTable.reduce((r, item) => {
        const paths = item.path.split('\\');
        paths.reduce((q, path) => {
            let temp = q.find(o => o.path === path);

            if (!temp) {
                temp = { path: path };
                
                if (paths.indexOf(path) === paths.length - 1) {
                    temp.index = item.index;
                } else {
                    temp.children = [];
                }

                q.push(temp);
            }

            return temp.children;
        }, r);
        return r;
    }, []);

    return root;
};

class RsiManifest {
    constructor() {}

    parse(filePath, progressCallback = null, completeCallback = null) {
        this.filePath = filePath;
        const manifestFile = fs.readFileSync(this.filePath);

        progressCallback('Parsing Manifest file');
        this.parsedManifest = new RsiManifestParser(new KaitaiStream(manifestFile));
        
        progressCallback('Building string table');
        const stringTable = buildStringTable(this.parsedManifest);

        progressCallback('Building files tree');
        this.filesTreeRoot = buildFilesTreeFromStringTable(stringTable);

        progressCallback('Parsing complete');
        completeCallback(this.filesTreeRoot);
    }

    getFilesTree() {
        return this.filesTree;
    }

    getParsedData() {
        return this.parsedManifest;
    }

    getFileRecord(index) {
        if (index <= 0) {
            throw Error('index <= 0');
        }
        
        return this.parsedManifest.indexRecords[index - 1];
    }
}

module.exports = RsiManifest;