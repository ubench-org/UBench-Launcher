change_selected_menu_item();

function select_menu(id){
    window.api.changePage(id);
}

function change_selected_menu_item(){
    var id = document.getElementById("selected_menu_item").innerHTML;
    var n = document.getElementsByClassName('nav-item');
    for (var i = 0; i < n.length; i++){
        n[i].classList.remove('active');
    }
    document.getElementById(id).classList.add("active");
    document.getElementById("title").innerHTML = id;
    document.getElementById("title_img").src = `./icons/${id}.svg`;
}
