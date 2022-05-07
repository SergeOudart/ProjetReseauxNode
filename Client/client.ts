const net = require('net');
import * as WebSocket from 'ws';


//Node permet de gérer plusieurs clients plus facilement qu'en java
//On peut facilement ajouter des clients sans impacter la performance

//En java à chaque fois qu'on créer un client on créer un thread, donc ça peut poser problème si le PC n'est pas performant

var ws;

var co = function(){
    if(!ws){
        ws = new WebSocket("ws://localhost:8999");
        ws.addEventListener('message');
    }
}


function connectClient(ws,login,mdp){
    if(login === "" || login == null){
        alert("Saisir un nom d'utilisateur");
        return;
    }
    if(mdp === "" || mdp == null){
        alert("Saisir un mot de passe");
        return;
    }
    var frame = "CONNECT\n"
            + `login: ${login}\n`;
            + `passcode: ${mdp}\n `;
            + "\n\n\0";
ws.send(frame);
    const client = new net.client(login,mdp);

    /*client.connect(1337,'127.0.0.1',function(){
    console.info("Connecté au serv");
    client.write("Test");
    })*/

}