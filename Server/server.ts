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

function disconnect(ws){
    ws.on('close', () => {
        clientsChat1.delete(ws);
        clientsChat2.delete(ws);
        clientsChat3.delete(ws);
    })
    ws.close();

}

function error(ws, message,receipt_id,content_type,content_length){
    var msg = message.split("\n");


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

function body(message, subscriptionId, messageId){
    const stringReq = Str(message).lines();
    var frame = "MESSAGE\n"
                + `subscription: ${subscriptionId}\n`
                + `messageid: ${messageId}\n`
                + `destination: ${getQueue2(stringReq)}\n`
                + "content-type: text/plain"
                + "\n\n\0";
    
    return frame;

}


function sendMessage(ws, message, location, type) {
    var messageId = Math.floor(Math.random() * 1000);

    if(clientsChat1.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat1'))){
        clientsChat1.forEach((value, key) => {
            const frame = body(message, value, messageId);
            key.send(frame);
        });
    }
     else if (clientsChat2.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat2'))) {
        clientsChat2.forEach((value, key) => {
            const frame = body(message, value, messageId);
            key.send(frame);
        });
    } else if (clientsChat3.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat3'))) {
        clientsChat3.forEach((value, key) => {
            const frame = body(message, value, messageId);
            key.send(frame);
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

function testQueue(lines){
    return lines[2].toString().replace('destination:', '');
}

function getQueue2(lines){
    return lines[1].toString().replace('destination:', '');

}

function getType(lines) {
    return lines[2].toString().replace('content-type:', '');
}
function getReceiptId(lines){
    return lines[1].toString().replace('receipt-id:','');
}

wss.on('connection', (ws: WebSocket, req) => {

    console.log("New client connected with ip : " + req.socket.remoteAddress);

    ws.on('message', (message: string) => {

        //console.log('received :\n' + message);
        
        if (message.toString().startsWith('SUBSCRIBE')) {
            const stringReq = Str(message).lines();
            const location = testQueue(stringReq);
            console.log(stringReq[1].replace('id:',''));
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
            /**
             * Les messages renvoyés aux autres utilisateurs doivent utiliser la frame MESSAGE du server
             */
            const location = getQueue2(Str(message).lines());
            console.log(location);
            var stringMessage = message.toString();
            const type = getType(Str(message).lines());
            console.log(type);
            sendMessage(ws, stringMessage, location, type);
        }  
        if(message.toString().startsWith('DISCONNECT')){
            const receipt_id = getReceiptId(message);
            if(ws)
            disconnect(ws);
        }
        if(message.toString().startsWith('ERROR')){
            
        }    
    });

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});