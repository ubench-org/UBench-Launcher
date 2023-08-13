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

let url = "https://firestore.googleapis.com/v1/projects/ubench-75d3f/databases/(default)/documents/downloads"
fetch(url)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data.documents);
        let cards = `<div class="row">`;
        let d = data.documents;
        for (var i = 0; i < d.length; i++) {
            if (d[i].fields.Available.booleanValue == true)
                var tags = ``;
            var t = d[i].fields.Tags.arrayValue.values;
            for (ii = 0; ii < t.length; ii++) {
                tags += `<div class="tag">${t[ii].stringValue}</div>`;
            }
            cards += `
        <div class="card">
            <h3>${d[i].fields.Title.stringValue}</h3>
            <p>UE: ${d[i].fields["Unreal Engine Version"].stringValue}</p>
            <p>RHI: ${d[i].fields.RHI.stringValue}</p>
            <p>OS: ${d[i].fields.Platform.stringValue}</p>
            <p>Size: ${d[i].fields.Size.integerValue} GB</p>
            <p>Tags: ${tags}</p>
            <button class="btn">Download</button>
        </div>
            `;
            cards += `
        <div class="card">
            <h3>${d[i].fields.Title.stringValue}</h3>
            <p>UE: ${d[i].fields["Unreal Engine Version"].stringValue}</p>
            <p>RHI: ${d[i].fields.RHI.stringValue}</p>
            <p>OS: ${d[i].fields.Platform.stringValue}</p>
            <p>Size: ${d[i].fields.Size.integerValue} GB</p>
            <p>Tags: ${tags}</p>
            <button class="btn">Download</button>
        </div>
            `;
        }
        cards += `</div>`;
        document.getElementById("downloads_content").innerHTML = cards;
    })
    .catch(function (e) {
        // handle the error
        console.log(e)
    });

let navitems = ["System", "Benchmarks", "Scores", "Downloads"];

let navitems_bottom = ["Account", "Settings"];

for (var i = 0; i < navitems.length; i++) {
    let n = navitems[i];
    document.getElementById("navbar").innerHTML += `
        <a href="#" id="${n.toLowerCase()}" class="nav-item" onclick="change_selected_menu_item(this.id)">
            <img class="svg" src="./icons/${n}.svg" alt="${n}"/>
            <p>${n}</p>
        </a>
    `;
}

for (var i = 0; i < navitems_bottom.length; i++) {
    let n = navitems_bottom[i];
    document.getElementById("navbar_bottom").innerHTML += `
        <a id="${n.toLowerCase()}" class="nav-item" onclick="change_selected_menu_item(this.id)">
            <img class="svg" src="./icons/${n}.svg" alt="${n}"/>
            <p>${n}</p>
        </a>
    `;
}


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