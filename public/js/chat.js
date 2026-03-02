const socket = io()

let username = null

Swal.fire({
    title: "Bienvenido",
    text: "Ingresa tu username",
    input: "text",
    inputPlaceholder: "Ingresa tu nombre",
    confirmButtonText: "Ingresar",
    allowOutsideClick: false,
    inputValidator: (value) => {
        if (!value) {
            return "Debes ingresar un username"
        }
    }
}).then(result => {
    username = result.value
})

const messageInput = document.getElementById("chatInput")
const sendBtn = document.getElementById("sendBtn")
const messages = document.getElementById("messages")

sendBtn.addEventListener("click", () => {

    if (messageInput.value.trim() !== "") {

        socket.emit("chat:message", {
            user: username,
            message: messageInput.value
        })

        messageInput.value = ""
    }

})

socket.on("chat:message", (data) => {

    const div = document.createElement("div")

    div.innerHTML = `<strong>${data.user}:</strong> ${data.message}`

    messages.appendChild(div)

    messages.scrollTop = messages.scrollHeight

})


const disconnectBtn = document.getElementById("disconnectBtn")

disconnectBtn.addEventListener("click", () => {

    socket.disconnect()

    Swal.fire({
        icon: "info",
        title: "Desconectado",
        text: "Serás redirigido al inicio",
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "/"
    })

})