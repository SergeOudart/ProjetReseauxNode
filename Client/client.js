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


//Fonction connect si version STOMP 1.2 avec login et mdp
function connect(login,password){
   
    if(!login === "" && mdp === ""){
        alert("Saisir un nom d'utilisateur et un mot de passe");
    }else{
        var login = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var frame_connect = "CONNECT\n"
        + "accept-version:1.2\n"
        +"host://localhost:8999/stomp\n"
        +"\n"
        +"^@";
    
        var frame_stomp = "STOMP\n"
        + "accept-version:1.2\n"
        + "host://localhost:8999/stomp\n"
        +`login:${login}\n`
        +`password:${paswword}\n`
        +"heart-beat:\n"
        +"session:\n"
        +"server:\n"
        +"\n"
        +"^@";

    }
   
}



