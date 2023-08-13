

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