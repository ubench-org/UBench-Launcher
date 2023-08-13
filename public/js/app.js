let sysinfo = JSON.parse(document.getElementById("sysinfo").innerHTML);
console.log(sysinfo)
let disks = ``;
let gpus = ``;
for (var i = 0; i < sysinfo.disks.length; i++) {
    disks += `${sysinfo.disks[i].name} ${sysinfo.disks[i].size} GB<br>`;
}
for (var i = 0; i < sysinfo.gpu.length; i++) {
    gpus += `${sysinfo.gpu[i].model} ${sysinfo.gpu[i].vram} MB<br>`;
}
document.getElementById("system_content").innerHTML = `
    <p class="sirow"><b>${sysinfo.system.model}</b></p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/os.png"><b class="key">System</b> ${sysinfo.os.distro} ${sysinfo.os.arch}</p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/motherboard.png"><b class="key">Board</b> ${sysinfo.board.model}<br>Version ${sysinfo.board.version}<br>Made by ${sysinfo.board.manufacturer}</p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/cpu.png"><b class="key">Processor</b> ${sysinfo.cpu.brand}<br>${sysinfo.cpu.processors} x ${sysinfo.cpu.speed} GHz<br>${sysinfo.cpu.cores} Core / ${sysinfo.cpu.threads} Thread</p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/gpu.png"><b class="key">Graphics</b> ${gpus}</p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/ram.png"><b class="key">Memory</b> ${sysinfo.ram} GB</p>
    <line/>
    <p class="sirow"><img class="system-icon" src="./icons/grey/disk.png"><b class="key">Storage</b> ${disks}</p>
    <line/>
    `;

let v = window.localStorage.getItem("view_id") || "system";
change_selected_menu_item(v);

function change_selected_menu_item(id) {
    window.localStorage.setItem("view_id",id);
    //var id = document.getElementById("selected_menu_item").innerHTML;
    var n = document.getElementsByClassName('nav-item');
    for (var i = 0; i < n.length; i++) {
        n[i].classList.remove('active');
    }
    document.getElementById(id).classList.add("active");
    document.getElementById("title").innerHTML = titleCase(id);
    document.getElementById("title_img").src = `./icons/${id}.svg`;
    show_view(id);
}

function show_view(id) {
    var n = document.getElementsByClassName("view");
    for (var i = 0; i < n.length; i++) {
        n[i].hidden = true;
    }
    var n = document.getElementsByClassName("toolbar_view");
    for (var i = 0; i < n.length; i++) {
        n[i].hidden = true;
    }

    document.getElementById(`${id}_content`).hidden = false;
    document.getElementById(`${id}_toolbar`).hidden = false;
}
function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }