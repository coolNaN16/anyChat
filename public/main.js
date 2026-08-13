const chat_container = document.getElementById("chat_container")
const user_input = document.getElementById("usr_input")
const msg_input = document.getElementById("msg_input")
const pw_input = document.getElementById("pwd_input")
const ch_input = document.getElementById("ch_input")

let currentPW = ""
let currentUser = ""
let currentCH = ""

let wanna_scroll = false

function place_message(username, text, date) {
    const div = document.createElement('div')
    div.classList.add("chat_group")

    const infoDiv = document.createElement('div')
    infoDiv.style.display = "flex"
    infoDiv.style.flexDirection = "row"
    infoDiv.style.justifyContent = "space-between"
    infoDiv.style.width = "100%"
    const pdiv = document.createElement('div')
    pdiv.style.display = "flex"
    pdiv.style.flexDirection = "row"
    pdiv.style.justifyContent = "flex-start"
    pdiv.style.width = "100%"

    const p = document.createElement('p')
    const arrowLabel = document.createElement('label')
    const label = document.createElement('label')
    const dateLabel = document.createElement('label')
    

    dateLabel.style.flexShrink = 0
    p.style.flex = 1
    p.style.paddingLeft = "0.5em"
    arrowLabel.style.flexShrink = 0
    arrowLabel.style.transform = "translateY(-0px)"
    label.style.flexShrink = 0
    
    dateLabel.style.opacity = 0.6

    label.innerHTML = `<b>@${document.createTextNode(username).textContent} </b>`
    arrowLabel.innerHTML = " <b>⮡ </b> "
    arrowLabel.style.paddingLeft = "15px"
    p.textContent += text
    dateLabel.textContent = date

    infoDiv.appendChild(label)
    infoDiv.appendChild(dateLabel)
    
    div.appendChild(infoDiv)
    pdiv.appendChild(arrowLabel)
    pdiv.appendChild(p)
    div.appendChild(pdiv)
    

    chat_container.prepend(div)
}

function send_msg() {
    // data structure = {username, text, chid, pw}
    console.log(user_input.value)

    let name = "any"
    if (currentUser.length > 0) {
        name = currentUser
    }

    if (msg_input.value.length < 0) {
		return
	}

    socket.emit("write", {
        "username"  : name,
        "text"      : msg_input.value,
        "chid"      : currentCH,
        "pw"        : currentPW
    })
    msg_input.value = ""
        setTimeout(() => {
        scroll_down()
    }, 100)
}

function read_msg() {
    // data structure = {chid, pw}
    socket.emit("read", {
        "chid"  : currentCH,
        "pw"    : currentPW
    })
}

function scroll_down() {
    chat_container.scrollTop = chat_container.scrollHeight
}

function open_dialog(dialog) {
    dialog.showModal()
}

function close_dialog(dialog) {
    
    setTimeout(() => {
        dialog.close()
    }, 200)
}

function setCh() {
    currentCH = ch_input.value
}

function setCred() {
    currentPW = pw_input.value
    currentUser = user_input.value
}

help_dialog.addEventListener("click", (event) => {
    if (event.target === help_dialog) {
        help_dialog.close();
    }
});

const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('res_msg', (data) => {
    const messages = data.Messages        
    if (chat_container.scrollTop + chat_container.clientHeight >= chat_container.scrollHeight - 50) {
        wanna_scroll = true
    }

    chat_container.innerHTML = ""
    for (const msg of messages) {
        place_message(msg.Username, msg.Message, msg.Date)
    }
    if (wanna_scroll == true) {
        scroll_down()
        wanna_scroll = false
    } else {

    }
})

socket.on("get_pw", (data, callback) => {
    callback(currentPW);
})

const pagestyle = document.getElementById("pagestyle")
function switch_theme(btn) {
    pagestyle.href = "themes/" + btn.dataset.theme + ".css"
    console.log(pagestyle.href)
    btn.style.filter = "brightness(150%)"

    const btns = document.querySelectorAll("[data-theme]")
    for (const butn of btns) {
        if (butn.dataset.theme != btn.dataset.theme) {
            butn.style.filter = "brightness(100%)"
        }
    }

    localStorage.setItem("theme", pagestyle.href)
}

if (localStorage.getItem("theme").length < 1) {
    pagestyle.href = "themes/default.css"
    localStorage.setItem("theme", "themes/default.css")
} else {
    pagestyle.href = localStorage.getItem("theme")
}

const theme_btn = document.querySelectorAll("[data-theme]")
for (const btn of theme_btn) {
    if (pagestyle.href.includes(btn.dataset.theme)) {
        btn.style.filter = "brightness(150%)"
    }
}

place_message("anyChat", "Click set Channel ID to go to a channel!", "0000-00-00 00:00:00")

let saved_id = [
    {
        name : "anyChat",
        id : "anyChat",
    }
]

if (JSON.parse(localStorage.getItem("saved-ids"))) {
    saved_id = JSON.parse(localStorage.getItem("saved-ids"))
} else {

}

const saved_container = document.getElementById("saved-id-container")
function add_save() {
    saved_id.push({
        name : "",
        id : ""
    })

    const mainDiv = document.createElement("div")
    mainDiv.id = `saved-${saved_id.length - 1}`
    mainDiv.classList.add("saved-id")

    mainDiv.innerHTML = `
            <div>
                <label> Name:  </label>
                <input class="saved-name-input" type="text">
            </div>
            <div>
                <label> ID..:  </label>
                <input class="saved-id-display">
            </div>
            <div>
                <button onclick="to_save(this)"> Save </button>
                <button onclick="load_save(this)"> Load </button>
                <button onclick="delete_save(this)"> x </button>
            </div>`

    saved_container.insertBefore(mainDiv, saved_container.lastElementChild)

    localStorage.setItem("saved-ids", JSON.stringify(saved_id))
}

function to_save(btn) {
    const id = btn.closest(".saved-id").id
    const id_input = document.querySelector(`#${id} .saved-id-display`)
    const name_input = document.querySelector(`#${id} .saved-name-input`)

    if (id_input.value == "") {
        id_input.value = currentCH
    } else {

    }
    
    const target_index = parseInt(id.replace("saved-", ""))

    saved_id[target_index].name = name_input.value
    saved_id[target_index].id = id_input.value

    localStorage.setItem("saved-ids", JSON.stringify(saved_id))
}

function saved_info_save(btn) {
    const id = btn.closest(".saved-id").id
    const id_input = document.querySelector(`#${id} .saved-id-display`)
    const name_input = document.querySelector(`#${id} .saved-name-input`)
    const target_index = parseInt(id.replace("saved-", ""))

    saved_id[target_index].name = name_input.value
    saved_id[target_index].id = id_input.value

    localStorage.setItem("saved-ids", JSON.stringify(saved_id))
}

function load_saves() {
    for (let i = 0; i < saved_id.length; i++) {
        const mainDiv = document.createElement("div")
        mainDiv.id = `saved-${i}`
        mainDiv.classList.add("saved-id")

        mainDiv.innerHTML = `
            <div>
                <label> Name:  </label>
                <input value="${saved_id[i].name}" class="saved-name-input" type="text">
            </div>
            <div>
                <label> ID..: </label>
                <input value="${saved_id[i].id}" class="saved-id-display">
            </div>
            <div>
                <button onclick="to_save(this)"> Save </button>
                <button onclick="load_save(this)"> Load </button>
                <button onclick="delete_save(this)"> x </button>
            </div>`

        saved_container.insertBefore(mainDiv, saved_container.lastElementChild)        
    }
    localStorage.setItem("saved-ids", JSON.stringify(saved_id))
}

function load_save(btn) {
    const id = btn.closest(".saved-id").id
    const id_input = document.querySelector(`#${id} .saved-id-display`)
    const name_input = document.querySelector(`#${id} .saved-name-input`)

    currentCH = id_input.value
    ch_input.value = currentCH
    read_msg()
}

function delete_save(btn) {
    const mainDiv = btn.closest(".saved-id")
    const id = mainDiv.id

    const target_index = parseInt(id.replace("saved-", ""))

    saved_id.splice(target_index, 1)

    localStorage.setItem("saved-ids", JSON.stringify(saved_id))

    const active_elements = saved_container.querySelectorAll(".saved-id")
    active_elements.forEach(element => element.remove())

    load_saves()
}

load_saves()

function toggle_aside() {
    const aside = document.querySelector("aside")
    console.log(aside.style.display)
    if (aside.style.display == "flex") {
        aside.style.transform = "translateX(-100%)"
        setTimeout(() => {
            aside.style.display = "none"
        }, 400)        
    } else {
        aside.style.transform = "translateX(-100%)"
        aside.style.display = "flex"
        requestAnimationFrame(() => {
            aside.style.transform = "translateX(0%)"
        })
    }
}


setInterval(() => {
    read_msg()
}, 10000)