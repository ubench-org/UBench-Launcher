// preload.js
const {
    contextBridge,
    ipcRenderer,
    remote
} = require('electron')


ipcRenderer.addListener('sysinfo', (event, specs) => {
    console.log('sysinfo')
    console.log(specs)
});

contextBridge.exposeInMainWorld('api', {

    changePage: (id) => {
        ipcRenderer.send('changePage', id);
    },
    getSpecs: () => {
        ipcRenderer.send('getSpecs')
    },
    load: () => {
        ipcRenderer.send('load');
    }
});