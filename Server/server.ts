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
const listChatDispo = ["/chat1", "/chat2", "/chat3"];

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

//TODO Effectuer la vérification des receipt

function disconnect(ws){
    ws.on('close', () => {
        clientsChat1.delete(ws);
        clientsChat2.delete(ws);
        clientsChat3.delete(ws);
    })
    ws.close();

}

/**
 * TODO Envoyer les frame ERROR en fonction de l'erreur trigger
 * @param ws 
 * @param message 
 * @param queue 
 * @returns 
 */

function error(ws, message, queue){
    var msg = message.toString().split("\n");
    var verifFrame = false;
    switch (msg[0].toString()) {
        case "SEND":
            verifFrame = msg[1].includes("destination:") && listChatDispo.includes(queue) && msg[2].toString() == "content-type:text/plain" && message.toString().includes("^@");
        break;

        case "SUBSCRIBE": //TODO Vérifier que le nombre après id: n'est pas vide
            verifFrame = msg[1].includes("id:") && msg[2].includes("destination:") && listChatDispo.includes(queue) && message.toString().includes("^@");
        break;

        case "UNSUBSCRIBE": //TODO Vérifier que le nombre après id: n'est pas vide
            if (msg[1].includes("id:")) {
                var id = msg[1].replace("id:", "");
            }
            
            if (clientsChat1.get(ws) == id || clientsChat2.get(ws) == id || clientsChat3.get(ws) == id) {
                verifFrame = true;
            }
        break;

        case "DISCONNECT":

        break;
    
        default:
            break;
    }
    return verifFrame;
}



function unsubscribe(ws, message, location) {
    var id = getUnsubscribeId(Str(message).lines());
    clientsChat1.forEach((key,value) => {
        if (key.includes(id)) {
            clientsChat1.delete(value);
        }
    });
    clientsChat2.forEach((key,value) => {
        if (key.includes(id)) {
            clientsChat2.delete(value);
        }
    });
    clientsChat3.forEach((key,value) => {
        if (key.includes(id)) {
            clientsChat3.delete(value);
        }
    });
    var response = "UNSUBSCRIBED";

    ws.send(response);
}
/**
 * TODO Ajouter le message à envoyer dans la frame LOL
 */

function body(message, subscriptionId, messageId, messageToSend){
    const stringReq = Str(message).lines();
    var frame = "MESSAGE\n"
                + `subscription:${subscriptionId}\n`
                + `messageid:${messageId}\n`
                + `destination:${getQueueSend(stringReq)}\n`
                + "content-type:text/plain"
                + "\n\n"
                + `${messageToSend}\n`
                + "^@";
    
    return frame;

}


function sendMessage(ws, message, location, type, messageToSend) {
    var messageId = Math.floor(Math.random() * 1000);

    if(clientsChat1.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat1'))){
        clientsChat1.forEach((value, key) => {
            const frame = body(message, value, messageId, messageToSend);
            key.send(frame);
        });
    }
     else if (clientsChat2.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat2'))) {
        clientsChat2.forEach((value, key) => {
            const frame = body(message, value, messageId, messageToSend);
            key.send(frame);
        });
    } else if (clientsChat3.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat3'))) {
        clientsChat3.forEach((value, key) => {
            const frame = body(message, value, messageId, messageToSend);
            key.send(frame);
        });
    } else {
        var frame = "ERROR\n"
                    + "content-type:text/plain\n"
                    + "content-length:\n"
                    + "message: malformed frame received\n"
                    + "^@";

        ws.send(frame);
}
}

function sendConnect(ws, version) {
    var frame = "CONNECTED\n"
        + "version:"+version+"\n"
        + "\n"
        + "^@";
    ws.send(frame)

}

function getQueue(lines) {
    if (lines[0] == 'SEND') {
        return lines[1].replace('destination:', '');
    } else if (lines[0] == 'SUBSCRIBE') {
        return lines[2].replace('destination:', '');
    }   
}

function getQueueSubscribe(lines){
    return lines[2].toString().replace('destination:', '');
}

function getQueueSend(lines){
    return lines[1].toString().replace('destination:', '');
}

function getType(lines) {
    return lines[2].toString().replace('content-type:', '');
}
function getReceiptId(lines){
    return lines[1].toString().replace('receipt-id:','');
}
function getVersion(lines) {
    return lines[1].toString().replace('accept-version:','');
}
function getUsername(lines) {
    return lines[3].toString().replace('login:', '');
}
function getPassword(lines) {
    return lines[4].toString().replace('password:', '');
}
function getUnsubscribeId(lines) {
    return lines[1].toString().replace('id:', '');
}

function getMessage(ws,lines) {
    var result = [];
    for (var i = 0;i<=lines.length;i++) {
        if (!lines[i]?.toString().includes("SEND") && !lines[i]?.toString().includes("destination") && !lines[i]?.toString().includes("content-type") && !lines[i]?.toString().includes("^@")) {
            result.push(lines[i]);
        }
    }
    var realResult = result.join(' ');

    return realResult;
}

wss.on('connection', (ws: WebSocket, req) => {

    console.log("New client connected with ip : " + req.socket.remoteAddress);

    ws.on('message', (message: string) => {
        
        if (message.toString().startsWith('SUBSCRIBE')) {
            const stringReq = Str(message).lines();
            const location = getQueueSubscribe(stringReq);
            if (error(ws, message, location))
                subscription(ws, message, location, stringReq[1].replace('id:', ''));
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            /**
             * Supprimer le client connecté en vérifiant que l'id est le même
             */
            const location = getQueue(Str(message).lines());
            if(error(ws, message, location))
                unsubscribe(ws, message, location);
        }
        if (message.toString().startsWith('SEND')) { 
            const location = getQueueSend(Str(message).lines());
            var stringMessage = message.toString();
            const type = getType(Str(message).lines());
            var messageToSend = getMessage(ws, Str(message).lines());
            if(error(ws, message, location))
                sendMessage(ws, stringMessage, location, type, messageToSend);
        }  
        if(message.toString().startsWith('DISCONNECT')){
            const receipt_id = getReceiptId(message);
            if(ws)
                disconnect(ws);
        } 
        if(message.toString().startsWith('STOMP')) {
            var version = getVersion(Str(message).lines());
            var username = getUsername(Str(message).lines());
            var password = getPassword(Str(message).lines());
            if (version.includes('1.2') && username != "" && password != "") {
                sendConnect(ws,version);
            } 
        }
    });

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});