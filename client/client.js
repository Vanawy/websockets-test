const SERVER_URL = 'ws://localhost:1337';
let socket = new WebSocket(SERVER_URL);
socket.addEventListener('open', (e) => {
    displayMessage(`Connected!`);
});
socket.addEventListener('close', (e) => {
    displayMessage(`Disconnected!`);

});


const messages = document.querySelector('#messages');
const users = document.querySelector('#users');

function displayMessage(text, author = null) {
    let message = '';
    if (author == null) {
        message += '💻';
    } else {
        message += author + ': ';
    }
    message += text;
    messages.textContent += message + '\n';
    messages.scrollTop = messages.scrollHeight;
}
displayMessage(`Establishing connection...`);

function handleMessage(message) {
    if (message.type != 'message') {
        console.error('Cant handle message', message);
    }
    const event = JSON.parse(message.data);
    if (event.type == 'message') {
        displayMessage(event.text, event.name);
        return;
    }
    if (event.type == 'joined') {
        displayMessage(`User '${event.name}' joined conversation`);
        return;
    }
    if (event.type == 'online') {
        users.textContent = event.count;
        return;
    }
    console.log(event);
}

socket.addEventListener('message', handleMessage);

function sendEvent(event) {
    socket.send(JSON.stringify(event));
}

let name = '';

function joinChat(e) {
    const nameEl = document.querySelector('#name');
    name = nameEl.value.trim();
    nameEl.value = '';
    if (name.length < 1) {
        displayMessage('Name is too short');
        return;
    }
    sendEvent({
        type: 'joined',
        name: name,
    });
    document.getElementById('join-box').style.display = 'none';
    document.getElementById('message-box').style.display = '';
}

const join = document.querySelector('#join-btn');
join.addEventListener('click', joinChat);

const messageEl = document.querySelector('#message');

function sendMessage() {
    const type = 'message';
    const text = messageEl.value.trim();
    if (!text) return;
    messageEl.value = '';
    const event = {
        type,
        text,
        name
    };
    sendEvent(event);
}

const send = document.querySelector('#send-btn');
send.addEventListener('click', sendMessage);
messageEl.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
})