import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { parse } from 'url';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({server});
const clientsChat1=[];
const clientsChat2=[];
const clientsChat3=[];

function subscription(ws, message, location) {
    
    switch (location.pathname) {
        case '/chat1':
            clientsChat1.push(ws);
            ws.send('you subscribed to chat 1 with ');
            break;
        case '/chat2':
            clientsChat2.push(ws);
            ws.send('you subscribed to chat 2 with ');
            break;
        case '/chat3':
            clientsChat3.push(ws);
            ws.send('you subscribed to chat 3 with ');
            break;
        default:
            break;
    }
}

function unsubscribe(ws, message, location) {
    switch (location.pathname) {
        case '/chat1':
            for(var i = 0; i < clientsChat1.length; i++) {
                if (clientsChat1[i] === ws) {
                    clientsChat1.splice(i, 1);
                }
            }
            ws.send('you unsubscribed of chat 1 with ');
            break;
        case '/chat2':
            for(var i = 0; i < clientsChat2.length; i++) {
                if (clientsChat2[i] === ws) {
                    clientsChat2.splice(i, 1);
                }
            }
            ws.send('you unsubscribed of chat 2 with ');
            break;
        case '/chat3':
            for(var i = 0; i < clientsChat3.length; i++) {
                if (clientsChat3[i] === ws) {
                    clientsChat3.splice(i, 1);
                }
            }
            ws.send('you unsubscribed of chat 3 with ');
            break;
        default:
            break;
    }
}

wss.on('connection', (ws: WebSocket, req) => {

    console.log("New client connected with ip : " + req.socket.remoteAddress);
    const location = parse(req.url, true);

    ws.on('message', (message: string) => {

        console.log('received :\n' + message);
        const location = parse(req.url, true);
        
        if (message.toString().startsWith('SUBSCRIBE')) {
            /*
            Ajouter les parametres nécessaires pas encore utilisés
            */
            subscription(ws, message, location);
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            unsubscribe(ws, message, location);
        }
        if (message.toString().startsWith('SEND')) { 
            /*
            A améliorer : 
            utiliser tous les parametres necessaire de la frame SEND
            vérifier que le sender a bien subscribe au topic avant envoie
            envoyer le message au bon topic grâce aux listes
            */
            var stringMessage = message.toString();
            stringMessage = stringMessage.substring(stringMessage.indexOf("\n") + 1);
            stringMessage = stringMessage.substring(stringMessage.lastIndexOf("\n") + 1, -1 );
            if (location.pathname == '/chat1') {
                clientsChat1.forEach(element => {
                    element.send(stringMessage);
                });
            }
        }

        wss.clients.forEach(function(client) {
            //client.send(message.toString());
            });
        });

});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});