const chat_container = document.getElementById("chat_container")
const user_input = document.getElementById("usr_input")
const msg_input = document.getElementById("msg_input")
const pw_input = document.getElementById("pwd_input")
const ch_input = document.getElementById("ch_input")

function place_message(username, text) {
    const div = document.createElement('div')
    div.classList.add("chat_group")

    const p = document.createElement('p')
    const label = document.createElement('label')

    label.innerHTML = `<b>@${document.createTextNode(username).textContent} $:</b>`
    p.textContent = text

    div.appendChild(label)
    div.appendChild(p)

    chat_container.prepend(div)
}

function send_msg() {
    // data structure = {username, text, chid, pw}
    console.log(user_input.value)

    let name = "any"
    if (user_input.value.length > 0) {
        name = user_input.value
    }

    socket.emit("write", {
        "username"  : name,
        "text"      : msg_input.value,
        "chid"      : ch_input.value,
        "pw"        : pw_input.value
    })
    msg_input.value = ""
}

function read_msg() {
    // data structure = {chid, pw}
    socket.emit("read", {
        "chid"  : ch_input.value,
        "pw"    : pw_input.value
    })
}

function open_dialog(dialog) {
    dialog.showModal()
}

function close_dialog(dialog) {
    
    setTimeout(() => {
        dialog.close()
    }, 200)
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
        place_message(msg.Username, msg.Message)
    }
})


place_message("cool16", "So cool!")
place_message("right15", "I know right!")
place_message("any", "ts so cool gng")

setInterval(() => {
    read_msg()
}, 1000)