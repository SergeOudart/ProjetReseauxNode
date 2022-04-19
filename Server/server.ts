import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({server, path: "/stomp"});

wss.on('connection', (ws: WebSocket, req) => {
    console.log("New client connected.");
    ws.send('You joined chat');

    ws.on('message', (message: string) => {

        console.log('received :' + message);

        wss.clients.forEach(function(client) {
            client.send(message.toString());
            });
        });

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});