require('dotenv').config();
import * as websocket from 'websocket';
import * as http from 'http';

const server = http.createServer(function(req, res) {
    console.log(`Request for ${req.url}`);
    res.writeHead(404);
    res.end();
});

const PORT: number = parseInt(process.env.PORT) || 1337;

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));

const socket = new websocket.server({
    httpServer: server,
    autoAcceptConnections: false,
});

class connection extends websocket.connection
{
    id?: string;
}

function sendEvent(event)
{
    socket.connections.forEach(c => c.send(JSON.stringify(event)));
}

function handleMessage(message: websocket.IMessage)
{
    if (message.type != 'utf8'){
        return;
    }
    const data = message.utf8Data;
    const event = JSON.parse(data);
    if(!['joined', 'message'].includes(event.type)){
        console.error('Unhandled event', event);
        return;
    }
    sendEvent(event);
    console.log(event);
}

function sendOnline(): void
{
    const event = {
        type: 'online',
        count: socket.connections.length,
    }
    sendEvent(event);
}

function handleConnection(request: websocket.request)
{
    if (false) {
        request.reject();
        return;
    }
    const c: connection = request.accept();
    sendOnline();
    
    c.on('message', handleMessage);
}

socket.on('request', handleConnection);

socket.on('close', (e) => {
    sendOnline();
});