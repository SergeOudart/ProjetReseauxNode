"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var url_1 = require("url");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
var clientsChat1 = [];
var clientsChat2 = [];
var clientsChat3 = [];
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
            for (var i = 0; i < clientsChat1.length; i++) {
                if (clientsChat1[i] === ws) {
                    clientsChat1.splice(i, 1);
                }
            }
            ws.send('you unsubscribed of chat 1 with ');
            break;
        case '/chat2':
            for (var i = 0; i < clientsChat2.length; i++) {
                if (clientsChat2[i] === ws) {
                    clientsChat2.splice(i, 1);
                }
            }
            ws.send('you unsubscribed of chat 2 with ');
            break;
        case '/chat3':
            for (var i = 0; i < clientsChat3.length; i++) {
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
wss.on('connection', function (ws, req) {
    console.log("New client connected with ip : " + req.socket.remoteAddress);
    var location = (0, url_1.parse)(req.url, true);
    ws.on('message', function (message) {
        console.log('received :\n' + message);
        var location = (0, url_1.parse)(req.url, true);
        if (message.toString().startsWith('SUBSCRIBE')) {
            subscription(ws, message, location);
        }
        if (message.toString().startsWith('UNSUBSCRIBE')) {
            unsubscribe(ws, message, location);
        }
        if (message.toString().startsWith('SEND')) {
            var stringMessage = message.toString();
            stringMessage = stringMessage.substring(stringMessage.indexOf("\n") + 1);
            stringMessage = stringMessage.substring(stringMessage.lastIndexOf("\n") + 1, -1);
            if (location.pathname == '/chat1') {
                clientsChat1.forEach(function (element) {
                    element.send(stringMessage);
                });
            }
        }
        wss.clients.forEach(function (client) {
            //client.send(message.toString());
        });
    });
});
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});
