const chat_container = document.getElementById("chat_container")
const user_input = document.getElementById("usr_input")
const msg_input = document.getElementById("msg_input")
const pw_input = document.getElementById("pwd_input")
const ch_input = document.getElementById("ch_input")

let currentPW = ""
let currentUser = ""
let currentCH = ""

function place_message(username, text, date) {
    const div = document.createElement('div')
    div.classList.add("chat_group")

    const infoDiv = document.createElement('div')
    infoDiv.style.display = "flex"
    infoDiv.style.flexDirection = "row"
    infoDiv.style.justifyContent = "space-between"
    infoDiv.style.width = "100%"

    const p = document.createElement('p')
    p.style.paddingLeft = "15px"
    const label = document.createElement('label')
    const dateLabel = document.createElement('label')

    dateLabel.style.flexShrink = 0
    p.style.flex = 1
    label.style.flexShrink = 0
    
    dateLabel.style.opacity = 0.6

    label.innerHTML = `<b>@${document.createTextNode(username).textContent} </b>`
    p.innerHTML = " <b>⮡ </b> "
    p.textContent += text
    dateLabel.textContent = date

    infoDiv.appendChild(label)
    infoDiv.appendChild(dateLabel)
    
    div.appendChild(infoDiv)
    div.appendChild(p)

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

    chat_container.scrollTop = chat_container.scrollHeight

    socket.emit("write", {
        "username"  : name,
        "text"      : msg_input.value,
        "chid"      : currentCH,
        "pw"        : currentPW
    })
    msg_input.value = ""
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

    chat_container.innerHTML = ""
    for (const msg of messages) {
        place_message(msg.Username, msg.Message, msg.Date)
    }
    scroll_down()
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

setInterval(() => {
    read_msg()
}, 5000)