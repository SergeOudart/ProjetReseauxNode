"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var Str = require("@supercharge/strings");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
var clientsChat1 = new Map();
var clientsChat2 = new Map();
var clientsChat3 = new Map();
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
            ws.send("D\u00E9sol\u00E9, ce topic n'\u00E9xiste pas");
            break;
    }
}
function unsubscribe(ws, message, location) {
    switch (location) {
        case '/chat1':
            clientsChat1["delete"](ws);
            ws.send('you unsubscribed of chat 1 with ');
            break;
        case '/chat2':
            clientsChat2["delete"](ws);
            ws.send('you unsubscribed of chat 2 with ');
            break;
        case '/chat3':
            clientsChat3["delete"](ws);
            ws.send('you unsubscribed of chat 3 with ');
            clientsChat3.forEach(function (value, key) {
                console.log(value);
            });
            break;
        default:
            ws.send("D\u00E9sol\u00E9, vous n'\u00EAtes pas inscrit \u00E0 ce topic");
            break;
    }
}
function sendMessage(ws, message, location) {
    var arrayMessage = message.substring(message.indexOf("\n") + 1);
    for (var i = 0; i < 2; i++) {
        arrayMessage = arrayMessage.substring(arrayMessage.indexOf("\n") + 1);
    }
    arrayMessage = arrayMessage.substring(arrayMessage.lastIndexOf("\n") + 1, -1);
    if ((location == '/chat1') && (clientsChat1.has(ws))) {
        clientsChat1.forEach(function (value, key) {
            key.send(arrayMessage);
        });
    }
    else if ((location == '/chat2') && (clientsChat2.has(ws))) {
        clientsChat2.forEach(function (value, key) {
            key.send(arrayMessage);
        });
    }
    else if ((location == '/chat3') && (clientsChat3.has(ws))) {
        clientsChat3.forEach(function (value, key) {
            key.send(arrayMessage);
        });
    }
    else {
        ws.send("Impossible d'envoyer votre message, vous n'\u00EAtes pas insrit \u00E0 ce topic");
    }
}
function getQueue(lines) {
    if (lines[0] == 'SEND') {
        return lines[1].replace('destination:', '');
    }
    else if (lines[0] == 'SUBSCRIBE') {
        return lines[2].replace('destination:', '');
    }
}
wss.on('connection', function (ws, req) {
    console.log("New client connected with ip : " + req.socket.remoteAddress);
    ws.on('message', function (message) {
        console.log('received :\n' + message);
        if (message.toString().startsWith('SUBSCRIBE')) {
            /*
            Ajouter ^@ à la fin de la requête et traiter cet indicateur (fin de requête)
            */
            var stringReq = Str(message).lines();
            var location_1 = getQueue(stringReq);
            subscription(ws, message, location_1, stringReq[1].replace('id:', ''));
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            var location_2 = getQueue(Str(message).lines());
            unsubscribe(ws, message, location_2);
        }
        if (message.toString().startsWith('SEND')) {
            var location_3 = getQueue(Str(message).lines());
            var stringMessage = message.toString();
            sendMessage(ws, stringMessage, location_3);
        }
    });
});
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});
