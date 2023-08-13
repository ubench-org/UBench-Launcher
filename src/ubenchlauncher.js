// main.js
const token = "bfc3c46c85283c109d18cf428efe906306caebaf3124c44d4a645a7259ef8fe8448a3e0cb6b3ca9d3c95d5885d3bbded19f3e9bde4a0bb4abc0f32ca7243568fc7b67b6099395db1c08c0f762e6a0bde922cafbd61056bc298c0f4681cdb29a614a67c36b3c2bdd2daf9a9ee5faf80dc6fcb802fe8ddde9d077e8aa922124087"

// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    Notification
} = require('electron')
const path = require('path')
const fs = require('fs-extra')
const si = require('systeminformation');
const axios = require('axios');
const Downloader = require("nodejs-file-downloader");
var zipper = require("zip-local");
const ejse = require('ejs-electron')
var execFile = require('child_process').execFile,
    child;

let rootDir = app.getAppPath()
let last = path.basename(rootDir)
if (last == 'app.asar') {
    rootDir = path.dirname(app.getPath('exe'))
}
try {
    require('electron-reloader')(module)
} catch (_) {}

fs.ensureFileSync(path.join(rootDir, "data", "results.json"));
fs.ensureDirSync(path.join(rootDir, "bin"));
if (!fs.existsSync(path.join(rootDir, "data", "manifest.json")))
    fs.writeJSONSync(path.join(rootDir, "data", "manifest.json"), []);
fs.removeSync(path.join(rootDir, "cache"))

const ax = axios.create({
    baseURL: 'http://127.0.0.1:1337/api',
    proxy: false,
    timeout: 1000,
    headers: {
        'Authorization': 'Bearer ' + token
    }
});

let manifest = [];
//load_manifest();


let has_sysinfo = false;
let cpu = {};
let gfx = [];
let disks = [];
let uuid = {};
let os = {};
let mem = -1;
let system = {};
let mboard = {};
let checks = -1;
let downloading = false;
let downloader;


analyze_system();

function analyze_system() {
    checks = 0;
    si.system(function (data) {
        system.manufacturer = data.manufacturer;
        system.model = data.model;
        checks++;
        //console.log("System\t" + system.manufacturer + " " + system.model);
    });
    si.baseboard(function (data) {
        mboard.manufacturer = data.manufacturer;
        mboard.model = data.model;
        mboard.version = data.version;

        checks++;
        //console.log("Board\t" + mboard.manufacturer + " " + mboard.model + " V" + mboard.version)
    });
    si.cpu(function (data) {
        cpu.manufacturer = data.manufacturer
        cpu.brand = data.brand
        cpu.speed = data.speed
        cpu.threads = data.cores
        cpu.cores = data.physicalCores
        cpu.processors = data.processors

        checks++;
        //console.log("CPU\t" + cpu.brand + " " + cpu.processors + "x" + cpu.speed + "GHz (" + cpu.cores + "C/" + cpu.threads + "T)")
    });
    si.mem(function (data) {
        mem = Math.round(data.total / 1024 / 1024 / 1024);

        checks++;
        //console.log("RAM\t" + mem + "GB");
    });
    si.graphics(function (data) {
        for (var i = 0; i < data.controllers.length; i++) {
            let _gfx = {};
            _gfx.model = data.controllers[i].model
            _gfx.vram = data.controllers[i].vram
            gfx.push(_gfx)

            //console.log("GFX[" + i + "]\t" + _gfx.model + " " + _gfx.vram + "MB")
        }
        checks++;
    });
    si.osInfo(function (data) {
        os.platform = data.platform;
        os.distro = data.distro;
        os.kernel = data.kernel;
        os.arch = data.arch;

        checks++;
        //console.log("OS\t" + os.distro);
    });
    si.diskLayout(function (data) {
        for (var i = 0; i < data.length; i++) {
            let _disk = {};
            _disk.name = data[i].name;
            _disk.size = Math.round(data[i].size / 1024 / 1024 / 1024);
            _disk.vendor = data[i].vendor;
            _disk.type = data[i].interfaceType;
            disks.push(_disk);

            //console.log("DISK[" + i + "]\t" + _disk.name + " " + _disk.size + "GB")
        }
        checks++;

    });
    si.uuid(function (data) {
        uuid.os = data.os;
        uuid.hardware = data.hardware;

        checks++;
        //console.log("UUID\t" + uuid.hardware);
    });

    setInterval(() => {
        if (checks >= 8) {
            checks = 0;
            has_sysinfo = true;

            ejse.data('sysinfo', JSON.stringify(fs.readJsonSync(path.join(rootDir, "data", "sysinfo.json"))));
            fs.writeJsonSync(path.join(rootDir, "data", "sysinfo.json"), {
                "uuid": uuid,
                "system": system,
                "board": mboard,
                "os": os,
                "cpu": cpu,
                "gpu": gfx,
                "ram": mem,
                "disks": disks
            });
            createWindow();
        }
    }, 500);
}


let mainWindow;
let splashWindow;

ejse.data("version", fs.readJSONSync(path.join(rootDir, "package.json")).version);
const splash = () => {

    splashWindow = new BrowserWindow({
        width: 400,
        height: 250,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        backgroundColor: "#121212",
        icon: "./res/logo.ico",
    });
    splashWindow.loadURL(path.join(rootDir, "public", "splash.ejs"))

    splashWindow.once('ready-to-show', () => {
        splashWindow.center();
    })

}

const createWindow = () => {
    // Create the browser window.
    splashWindow.close();
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        backgroundColor: "#121212",
        icon: "./res/logo.ico",
        webPreferences: {
            preload: path.join(rootDir, "public", "js", 'preload.js'),
            nodeIntegration: true
        },
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true,
        title: "UBench Launcher"
    })


    ipcMain.on('load', (event) => {
        event.sender.send('load');
    })

    ipcMain.on('changePage', (event, id) => {
        ejse.data("menu", id);
    })

    ipcMain.on('getSpecs', (event) => {
        let specs = fs.readJsonSync(path.join(rootDir, "data", "sysinfo.json"));
        event.sender.send('sysinfo', specs)
    })

    ipcMain.on('delete', (event, uuid) => {
        fs.removeSync(path.join(rootDir, "bin", uuid));
        //event.sender.send('manifest', manifest)
        console.log('delete', uuid)
    })

    ipcMain.on('requestDownload', async (event, uuid, url) => {
        if (downloading == false) {
            downloading = true;
            console.log("starting download", uuid, url);
            let dir = path.join(rootDir, "bin", uuid)
            let cache = path.join(rootDir, "cache", uuid);
            console.log(dir)
            console.log(cache)
            console.log(url)
            downloader = new Downloader({
                url: url,
                directory: cache,
                cloneFiles: false,
                onProgress: function (percentage) {
                    event.sender.send("downloadProgress", uuid, percentage)
                },
            });

            try {
                await downloader.download();
                fs.ensureDirSync(dir);
                //zipper.sync.unzip(path.join(cache, uuid + ".zip")).save(dir);
                event.sender.send('completedDownload', uuid)
                new Notification({
                    title: "Download Complete",
                    body: uuid + " has been installed"
                }).show()
                downloading = false;
                console.log('done downloading', uuid)
                //fs.rmSync(path.join(cache, uuid + ".zip"));
                //fs.rmdirSync(cache);


            } catch (error) {
                downloader.cancel();
                downloading = false;
                //fs.removeSync(path.join(rootDir, "cache", uuid));
                //event.sender.send('manifest', manifest)
                console.log('error downloading', uuid, error)
            }
        }

    })

    ipcMain.on('cancelDownload', async (event, uuid, url) => {
        if (downloading == true) {
            downloading = false;
            console.log("cancelling download", uuid, url);
            downloader.cancel();
            event.sender.send('cancelledDownload', uuid)
            fs.removeSync(path.join(rootDir, "bin", uuid));
            //event.sender.send('manifest', manifest)
        }

    })

    ipcMain.on('execute', async (event, uuid, p) => {
        console.log(uuid, p)
        p = path.join(rootDir, "bin", uuid, p)
        child = execFile(p, function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                //console.log('Signal received: '+ 
                //       error.signal);
            }
            console.log('Child Process stdout: ' + stdout);
            console.log('Child Process stderr: ' + stderr);
        });
    })

    if (require('electron-squirrel-startup')) app.quit();
    // and load the index.html of the app.
    mainWindow.loadURL(path.join(rootDir, "public", "index.ejs"))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    splash();

    const options = {
        type: 'question',
        buttons: ['Disagree', 'Yes, collect anonymous data'],
        defaultId: 1,
        title: 'Data Consent',
        message: 'UBench Organization',
        detail: 'UBench Organization collects anonymous system specifications for benchmarking purposes. UBench is powered by community data, and this information is freely available to the community.',
    };

    if (!fs.existsSync(path.join(rootDir, "data", "sysinfo.json"))) {
        var d = dialog.showMessageBoxSync(null, options);
        if (d < 1) process.exit();
        else fs.writeJSONSync(path.join(rootDir, "data", "sysinfo.json"), {});
    }


    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
            splashWindow.hide();
        }
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.