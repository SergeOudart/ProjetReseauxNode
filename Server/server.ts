import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { parse } from 'url';
import * as Str from '@supercharge/strings';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({server});
const clientsChat1= new Map();
const clientsChat2= new Map();
const clientsChat3= new Map();

function subscription(ws, message, location, id) {
    switch (location) {
        case '/chat1':
            clientsChat1.set(ws, id);
            ws.send('you subscribed to chat 1 with ');
            break;
        case '/chat2':
            clientsChat2.set(ws, id);
            ws.send('you subscribed to chat 2 with ');
            break;
        case '/chat3':
            clientsChat3.set(ws, id);
            ws.send('you subscribed to chat 3 with ');
            break;
        default:
            ws.send(`Désolé, ce topic n'éxiste pas`);
            break;
    }
}

function unsubscribe(ws, message, location) {
    switch (location) {
        case '/chat1':
            clientsChat1.delete(ws);
            ws.send('you unsubscribed of chat 1 with ');
            break;
        case '/chat2':
            clientsChat2.delete(ws);
            ws.send('you unsubscribed of chat 2 with ');
            break;
        case '/chat3':
            clientsChat3.delete(ws);
            ws.send('you unsubscribed of chat 3 with ');
            clientsChat3.forEach((value, key) => {
                console.log(value);
            });
            break;
        default:
            ws.send(`Désolé, vous n'êtes pas inscrit à ce topic`);
            break;
    }

}

function sendMessage(ws, message, location, type) {
    var arrayMessage = message.substring(message.indexOf("\n") + 1);
    for (var i = 0; i<2; i++) {
        arrayMessage = arrayMessage.substring(arrayMessage.indexOf("\n") + 1);
    }
    arrayMessage = arrayMessage.substring(arrayMessage.lastIndexOf("\n") + 1, -1 );


    if ((location == '/chat1') && (clientsChat1.has(ws)) && (type == 'text/plain')) {
        clientsChat1.forEach((value, key) => {
            key.send(arrayMessage);
        });
    } else if ((location == '/chat2') && (clientsChat2.has(ws)) && (type == 'text/plain')) {
        clientsChat2.forEach((value, key) => {
            key.send(arrayMessage);
        });
    } else if ((location == '/chat3') && (clientsChat3.has(ws)) && (type == 'text/plain')) {
        clientsChat3.forEach((value, key) => {
            key.send(arrayMessage);
        });
    } else {
        ws.send(`Impossible d'envoyer votre message, vous n'êtes pas insrit à ce topic`);
    }
}

function getQueue(lines) {
    if (lines[0] == 'SEND') {
        return lines[1].replace('destination:', '');
    } else if (lines[0] == 'SUBSCRIBE') {
        return lines[2].replace('destination:', '');
    }   
}

function getType(lines) {
    return lines[2].replace('content-type:', '');
}

wss.on('connection', (ws: WebSocket, req) => {

    console.log("New client connected with ip : " + req.socket.remoteAddress);

    ws.on('message', (message: string) => {

        console.log('received :\n' + message);
        
        if (message.toString().startsWith('SUBSCRIBE')) {
            const stringReq = Str(message).lines();
            const location = getQueue(stringReq);
            subscription(ws, message, location, stringReq[1].replace('id:', ''));
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            /**
             * Supprimer le client connecté en vérifiant que l'id est le même
             */
            const location = getQueue(Str(message).lines());
            unsubscribe(ws, message, location);
        }
        if (message.toString().startsWith('SEND')) { 
            const location = getQueue(Str(message).lines());
            var stringMessage = message.toString();
            const type = getType(Str(message).lines());
            sendMessage(ws, stringMessage, location, type);
        }            
    });

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});