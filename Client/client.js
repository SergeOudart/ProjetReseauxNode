const net = require('net');
import * as WebSocket from 'ws';
globalThis.socket = new WebSocket("ws://localhost:8999/stomp", "v10.stomp");


function sendSubscribe(destination){
    var subscriptionId = Math.floor(Math.random() * 1000);
    var frame = "SUBSCRIBE\n"
    + `id: ${subscriptionId}\n`
    + `destination: ${destination}\n`
    + "^@";
socket.send(frame);
return subscriptionId;
}

function sendMessage(destination){
    var message = document.getElementById('userMessage').value;
    var destination = document.getElementById('listeDestination').value;

    var frame = "SEND\n"
    + `destination:${destination}\n`
    + `content-type:text/plain\n`
    + '\n'
    + `${message}\n`
    + '^@';

    socket.send(frame);
    return frame;


}

function unSubscribe(subscriptionId){


    var frame = "UNSUBSCRIBE\n"
    + `id:${subscriptionId}\n`
    +"\n"
    +"^@";


    socket.send(frame);
    return frame;

}




