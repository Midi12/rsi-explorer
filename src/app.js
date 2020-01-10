const { ipcRenderer } = require('electron');
const Tabulator = require('tabulator-tables');

const Session = require('./common/controllers/session');

const btnLogin = document.getElementById('btnLogin');

if (btnLogin == undefined) {
    throw Error('btnLogin undefined');
}

const btnValidate = document.getElementById('btnValidate');

if (btnValidate == undefined) {
    throw Error('btnValidate undefined');
}

const btnOpenDownloadManifest = document.getElementById('btnOpenDownloadManifest');
if (btnOpenDownloadManifest == undefined) {
    throw Error('btnOpenDownloadManifest undefined');
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout == undefined) {
    throw Error('btnLogout undefined');
}

btnLogin.addEventListener('click', (event, mouse) => {
    const iptUsername = document.getElementById('iptUsername');
    if (iptUsername == undefined) {
        throw Error('iptUsername undefined');
    }

    const iptPassword = document.getElementById('iptPassword');
    if (iptPassword == undefined) {
        throw Error('iptPassword undefined');
    }

    const iptCaptcha = document.getElementById('iptCaptcha');
    if (iptCaptcha == undefined) {
        throw Error('iptCaptcha undefined');
    }

    const authPayload = { username: iptUsername.value, password: iptPassword.value };

    if (!iptCaptcha.hasAttribute('hidden')) {
        authPayload.captcha = iptCaptcha.value;
    }

    ipcRenderer.send('auth@login', authPayload);
});

btnValidate.addEventListener('click', (event, mouse) => {
    const iptAuthenticator = document.getElementById('iptAuthenticator');
    if (iptAuthenticator == undefined) {
        throw Error('iptAuthenticator undefined');
    }

    const authenticatorPayload = { code: iptAuthenticator.value };

    ipcRenderer.send('auth@validate', authenticatorPayload);
});

btnOpenDownloadManifest.addEventListener('click', (event, mouse) => {
    ipcRenderer.send('game-list@open-window');
});

ipcRenderer.on('auth@show-captcha', (event, image) => {
    const imgCaptcha = document.getElementById('imgCaptcha');
    if (imgCaptcha == undefined) {
        throw Error('imgCaptcha undefined');
    }

    const iptCaptcha = document.getElementById('iptCaptcha');
    if (iptCaptcha == undefined) {
        throw Error('iptCaptcha undefined');
    }

    const blob = new Blob([image], { type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);
    imgCaptcha.src = imageUrl;

    imgCaptcha.removeAttribute('hidden');
    iptCaptcha.removeAttribute('hidden');
});

ipcRenderer.on('auth@hide-captcha', (event) => {
    const imgCaptcha = document.getElementById('imgCaptcha');
    if (imgCaptcha == undefined) {
        throw Error('imgCaptcha undefined');
    }

    const iptCaptcha = document.getElementById('iptCaptcha');
    if (iptCaptcha == undefined) {
        throw Error('iptCaptcha undefined');
    }

    imgCaptcha.setAttribute('hidden', true);
    iptCaptcha.setAttribute('hidden', true);
    iptCaptcha.value = '';
});

ipcRenderer.on('auth@show-authenticator', (event) => {
    const iptAuthenticator = document.getElementById('iptAuthenticator');
    if (iptAuthenticator == undefined) {
        throw Error('iptAuthenticator undefined');
    }

    const btnValidate = document.getElementById('btnValidate');
    if (btnValidate == undefined) {
        throw Error('btnValidate undefined');
    }

    iptAuthenticator.removeAttribute('hidden');
    btnValidate.removeAttribute('hidden');
});

ipcRenderer.on('auth@hide-authenticator', (event) => {
    const iptAuthenticator = document.getElementById('iptAuthenticator');
    if (iptAuthenticator == undefined) {
        throw Error('iptAuthenticator undefined');
    }

    const btnValidate = document.getElementById('btnValidate');
    if (btnValidate == undefined) {
        throw Error('btnValidate undefined');
    }

    iptAuthenticator.setAttribute('hidden', true);
    iptAuthenticator.value = '';
    btnValidate.setAttribute('hidden', true);
});

ipcRenderer.on('auth@show-login', (event) => {
    const iptUsername = document.getElementById('iptUsername');
    if (iptUsername == undefined) {
        throw Error('iptUsername undefined');
    }

    const iptPassword = document.getElementById('iptPassword');
    if (iptPassword == undefined) {
        throw Error('iptPassword undefined');
    }

    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin == undefined) {
        throw Error('btnLogin undefined');
    }

    iptUsername.removeAttribute('hidden');
    iptPassword.removeAttribute('hidden');
    btnLogin.removeAttribute('hidden');
});

ipcRenderer.on('auth@hide-login', (event) => {
    const iptUsername = document.getElementById('iptUsername');
    if (iptUsername == undefined) {
        throw Error('iptUsername undefined');
    }

    const iptPassword = document.getElementById('iptPassword');
    if (iptPassword == undefined) {
        throw Error('iptPassword undefined');
    }

    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin == undefined) {
        throw Error('btnLogin undefined');
    }

    iptUsername.setAttribute('hidden', true);
    iptUsername.value = '';
    iptPassword.setAttribute('hidden', true);
    iptPassword.value = '';
    btnLogin.setAttribute('hidden', true);
});

ipcRenderer.on('auth@show-user', (event) => {
    const spConnectedAs = document.getElementById('spConnectedAs');
    if (spConnectedAs == undefined) {
        throw Error('spConnectedAs undefined');
    }

    const btnOpenDownloadManifest = document.getElementById('btnOpenDownloadManifest');
    if (btnOpenDownloadManifest == undefined) {
        throw Error('btnOpenDownloadManifest undefined');
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout == undefined) {
        throw Error('btnLogout undefined');
    }

    const session = new Session();
    if (session == undefined) {
        throw Error('session undefined');
    }

    spConnectedAs.innerHTML = `Connected as <strong>${session.get('displayName')}</strong>`;
    spConnectedAs.removeAttribute('hidden');
    btnOpenDownloadManifest.removeAttribute('hidden');
    btnLogout.removeAttribute('hidden');
});

ipcRenderer.on('auth@hide-user', (event) => {

});

ipcRenderer.on('manifest@update-parsing-state', (event, state) => {
    const divFileTreeParsingState = document.getElementById('divFileTreeParsingState');
    if (divFileTreeParsingState == undefined) {
        throw Error('divFileTreeParsingState undefined');
    }

    const divFileTree = document.getElementById('divFileTree');
    if (divFileTree == undefined) {
        throw Error('divFileTree undefined');
    }

    if (state === 'started') {
        divFileTree.innerHTML = '';
        divFileTreeParsingState.classList.remove('d-none');
    } else if (state === 'finished') {
        divFileTreeParsingState.classList.add('d-none');
    } else {
        divFileTreeParsingState.innerHTML = `<div class="d-flex align-items-center"><div class="spinner-border" role="status" aria-hidden="true"></div>&nbsp;<strong>${state}</strong></div>`;
    }
});

ipcRenderer.on('manifest@update-file-tree', (event, filesTree) => {
    const root = [{
        path: '/',
        children: filesTree
    }];

    /*const tree = */new Tabulator('#divFileTree', {
        layout: 'fitColumns',
        height: 600,
        data: root,
        dataTree: true,
        dataTreeStartExpanded: false,
        dataTreeChildField: 'children',
        columns: [
            { title: 'Path', field: 'path', width: '100%', responsive: 0 }
        ]
    });
});