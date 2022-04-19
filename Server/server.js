"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server, path: "/stomp" });
wss.on('connection', function (ws, req) {
    console.log("New client connected.");
    ws.send('You joined chat');
    ws.on('message', function (message) {
        console.log('received :' + message);
        console.log(req.headers);
        wss.clients.forEach(function (client) {
            client.send(message.toString());
        });
    });
});
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});
