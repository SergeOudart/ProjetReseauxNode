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
var listChatDispo = ["/chat1", "/chat2", "/chat3"];
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
// Effectuer la vérification des receipt
function disconnect(ws) {
    ws.on('close', function () {
        clientsChat1["delete"](ws);
        clientsChat2["delete"](ws);
        clientsChat3["delete"](ws);
    });
    ws.close();
}
function error(ws, message, queue) {
    var msg = message.toString().split("\n");
    var verifFrame = false;
    switch (msg[0].toString()) {
        case "SEND":
            verifFrame = msg[1].includes("destination:") && listChatDispo.includes(queue) && msg[2].toString() == "content-type:text/plain" && message.toString().includes("^@");
            break;
        case "SUBSCRIBE": //Vérifier que le nombre après id: n'est pas vide
            verifFrame = msg[1].includes("id:") && msg[2].includes("destination:") && listChatDispo.includes(queue) && message.toString().includes("^@");
            console.log(verifFrame);
            break;
        case "UNSUBSCRIBE": //Vérifier que le nombre après id: n'est pas vide
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
            break;
        default:
            ws.send("D\u00E9sol\u00E9, vous n'\u00EAtes pas inscrit \u00E0 ce topic");
            break;
    }
}
/**
 * Ajouter le message à envoyer dans la frame LOL
 */
function body(message, subscriptionId, messageId) {
    var stringReq = Str(message).lines();
    var frame = "MESSAGE\n"
        + "subscription: ".concat(subscriptionId, "\n")
        + "messageid: ".concat(messageId, "\n")
        + "destination: ".concat(getQueueSend(stringReq), "\n")
        + "content-type: text/plain"
        + "\n\n\0";
    return frame;
}
function sendMessage(ws, message, location, type) {
    var messageId = Math.floor(Math.random() * 1000);
    if (clientsChat1.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat1'))) {
        clientsChat1.forEach(function (value, key) {
            var frame = body(message, value, messageId);
            key.send(frame);
        });
    }
    else if (clientsChat2.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat2'))) {
        clientsChat2.forEach(function (value, key) {
            var frame = body(message, value, messageId);
            key.send(frame);
        });
    }
    else if (clientsChat3.has(ws) && (type.toString().includes('text/plain') && location.toString().includes('/chat3'))) {
        clientsChat3.forEach(function (value, key) {
            var frame = body(message, value, messageId);
            key.send(frame);
        });
    }
    else {
        var frame = "ERROR\n"
            + "content-type:text/plain\n"
            + "content-length:\n"
            + "message: malformed frame received\n"
            + "^@";
        ws.send(frame);
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
function getQueueSubscribe(lines) {
    return lines[2].toString().replace('destination:', '');
}
function getQueueSend(lines) {
    return lines[1].toString().replace('destination:', '');
}
function getType(lines) {
    return lines[2].toString().replace('content-type:', '');
}
function getReceiptId(lines) {
    return lines[1].toString().replace('receipt-id:', '');
}
wss.on('connection', function (ws, req) {
    console.log("New client connected with ip : " + req.socket.remoteAddress);
    ws.on('message', function (message) {
        if (message.toString().startsWith('SUBSCRIBE')) {
            var stringReq = Str(message).lines();
            var location_1 = getQueueSubscribe(stringReq);
            if (error(ws, message, location_1))
                subscription(ws, message, location_1, stringReq[1].replace('id:', ''));
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            /**
             * Supprimer le client connecté en vérifiant que l'id est le même
             */
            var location_2 = getQueue(Str(message).lines());
            if (error(ws, message, location_2))
                unsubscribe(ws, message, location_2);
        }
        if (message.toString().startsWith('SEND')) {
            var location_3 = getQueueSend(Str(message).lines());
            var stringMessage = message.toString();
            var type = getType(Str(message).lines());
            if (error(ws, message, location_3))
                sendMessage(ws, stringMessage, location_3, type);
        }
        if (message.toString().startsWith('DISCONNECT')) {
            var receipt_id = getReceiptId(message);
            if (ws)
                disconnect(ws);
        }
    });
});
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});
