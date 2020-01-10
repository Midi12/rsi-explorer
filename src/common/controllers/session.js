const Store = require('electron-store');

class Session {
    constructor() {
        this.store = new Store();
    }

    set(key, value) {
        this.store.set(key, value);
    }

    get(key) {
        return this.store.get(key);
    }

    forEach(fn) {
        Object.keys(this.store.store).map(key => fn(key, this.store.get(key)));
    }
};

module.exports = Session;