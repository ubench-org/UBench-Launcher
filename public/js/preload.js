// preload.js
const {
  contextBridge,
  ipcRenderer
} = require('electron')

let tryCancel = false;
let downloading = false;

ipcRenderer.addListener('downloadProgress', (event, uuid, percentage) => {
  if (tryCancel) document.getElementById(uuid).innerHTML = `<b>Cancelling...</b>`;
  else if (tryCancel == false) {
    console.log("downloading", uuid, percentage)
    downloading = true;
    document.getElementById(`span_${uuid}`).innerHTML = `
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
  <span id="span_${uuid}"></span><button class="button button-small" onclick="download('${uuid}')">Download</button>`;
})

ipcRenderer.addListener('completedDownload', (event, uuid) => {
  console.log("completed download ", uuid)
  downloading = false;
  document.getElementById(uuid).innerHTML = `
  <button class="button button-danger button-small" onclick="remove('${uuid}')">Remove</button>
  <button class="button button-primary button-small" onclick="run('${uuid}')">Run</button>`;
  ipcRenderer.send('getManifest');
})

ipcRenderer.addListener('manifest', (event, data) => {
  console.log('manifest')
  console.log(data)
  document.getElementById("table").innerHTML = `
  <tr>
    <th style="width:20%">Benchmark</th>
    <th style="width:10%">Size</th>
    <th style="width:10%">Score</th>
    <th style="width:60%; text-align:left;">Manage</th>
  </tr>`;
  for (var i = 0; i < data.length; i++) {
    d = data[i].attributes;
    console.log(d)

    var o = document.createElement("option");
    o.text = d.version;

    let score = '★★★★★';
    score = score.slice(5 - d.score, 5);
    score += String('✰').repeat(5 - d.score);

    let btn = `<button class="button button-small" onclick="download('${d.uuid}','${d.url}')">Download</button>`;
    if ((d.downloading) && (!d.installed)) btn = `<button class="button button-small end" onclick="cancel('${d.uuid}')">Cancel</button>`;
    if (!d.url) {
      btn = `<button disabled class="button button-small" onclick="download('${d.uuid}')">Unavailable</button>`;
    }
    if (d.installed) {

      let sel = `
    <select name="rhi" id="rhi_${d.uuid}">`;

      for (var ii = 0; ii < d.executables.length; ii++) {
        sel += `<option value="${d.executables[ii].path}">${d.executables[ii].name}</option>`;
      }
      sel += `</select>`

      btn = `<button class="button button-danger button-small" onclick="remove('${d.uuid}')">Remove</button>
      <button class="button button-primary button-small" onclick="run('${d.uuid}')">Run</button>
      ${sel}
      `;
    }
    document.getElementById("table").innerHTML += `
    <tr>
      <td>${d.version}</td>
      <td>${d.size} GB</td>
      <td>${score}</td>
      <td id="${d.uuid}" style="text-align:left">
      <span id="span_${d.uuid}"></span>${btn}
      </td>
    </tr>
  `

    ;

  }

})


contextBridge.exposeInMainWorld('api', {

  requestDelete: (uuid) => {
    ipcRenderer.send('delete', uuid);
  },

  getManifest: () => {
    ipcRenderer.send('getManifest');
  },

  // Expose a `window.api.readFile` function to the renderer process.
  getSpecs: () => {
    // Send IPC event to main process "read-file".
    ipcRenderer.send('getSpecs')

    // Create a promise that resolves when the "read-file-success" event is received.
    // That even is sent from the main process when the file has been successfully read.
    return new Promise((resolve) =>
      ipcRenderer.once('ipcsuccess', (event, data) => {
        console.log(data)
        document.getElementById("specs").innerHTML = `<p>`;
        document.getElementById("specs").innerHTML += `
        <h4 class="">${data.system.model}</h4>
        &emsp;${data.cpu.brand} ${data.cpu.processors} x ${data.cpu.speed}GHz (${data.cpu.cores}C/${data.cpu.threads}T)
        <br>
        &emsp;${data.ram} GB RAM
        <br>
        `
        for (var i = 0; i < data.gpu.length; i++) {

          document.getElementById("specs").innerHTML += `
        &emsp;${data.gpu[i].model} ${data.gpu[i].vram} MB<br>
        `
        }
        for (var i = 0; i < data.disks.length; i++) {
          document.getElementById("specs").innerHTML += `
        &emsp;${data.disks[i].name} ${data.disks[i].size} GB<br>
        `
        }

        document.getElementById("specs").innerHTML += `</p>`
      }))

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
})
// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})