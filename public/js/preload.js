// preload.js
const {
    contextBridge,
    ipcRenderer,
    remote
} = require('electron')


let tryCancel = false;
let downloading = false;

ipcRenderer.addListener('downloadProgress', (event, uuid, percentage) => {
  if (tryCancel) document.getElementById(`${uuid}_dl`).innerHTML = `<b>Cancelling...</b>`;
  else if (tryCancel == false) {
    console.log("downloading", uuid, percentage)
    downloading = true;
    document.getElementById(`${uuid}_dl`).innerHTML = `
  <label id="lbl_${uuid}" for="prg_${uuid}"> ${percentage}% </label>
  <progress id="prg_${uuid}" value="${percentage}" max="100"> ${percentage}% </progress>
    `;
  }
})

ipcRenderer.addListener('cancelledDownload', (event, uuid) => {
  console.log("cancelled download ", uuid)
  tryCancel = false;
  downloading = false;
  document.getElementById(uuid).innerHTML = `
  <span id="${uuid}"></span><button class="btn btn-sm" onclick="download('${uuid}')">Download</button>`;
})

ipcRenderer.addListener('completedDownload', (event, uuid) => {
  console.log("completed download ", uuid)
  downloading = false;
  document.getElementById(`${uuid}_dl`).innerHTML = `<p>Download complete</p>`;
  ipcRenderer.send('getManifest');
})

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
    },
    requestDownload: (uuid, url) => {
        if (!downloading) {
            ipcRenderer.send("requestDownload", uuid, url)
            console.log("requesting download", uuid, url)
        }
    },
    cancelDownload: (uuid) => {
        tryCancel = true;
        ipcRenderer.send('cancelDownload', uuid);
        console.log("cancelling download ", uuid)
    },
    execute: (uuid, path) => {
        ipcRenderer.send('execute', uuid, path);
    }
});