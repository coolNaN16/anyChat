const chat_container = document.getElementById("chat_container")

function place_message(username, text) {
    const div = document.createElement('div')
    div.classList.add("chat_group")

    const p = document.createElement('p')
    const label = document.createElement('label')

    label.innerHTML = `<b>@${username} $:</b>`
    p.innerHTML = text

    div.appendChild(label)
    div.appendChild(p)

    chat_container.appendChild(div)
}

place_message("cool16", "So cool!")
place_message("right15", "I know right!")
place_message("any", "ts so cool gng")