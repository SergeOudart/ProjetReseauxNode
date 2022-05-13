globalThis.socket = new WebSocket("ws://localhost:8999/stomp", "v10.stomp");
globalThis.connected = false;
globalThis.subscriptionGlobal;

socket.addEventListener('open', (event) => {
    console.log('Connexion avec le serveur établie');
});

socket.addEventListener('message', (event) => {
    console.log(event.data);
    if(event.data.includes('CONNECTED')){
        connected = true;
    }
    if (event.data.includes('MESSAGE')) {
        traitementMessage(event.data);
    }
    if (event.data.includes('UNSUBSCRIBED')) {
        var unsubChat = document.getElementById("listeDestination").value;
        alert("Vous vous êtes désabonné du " + unsubChat);
    }
    if (event.data.includes('ERROR')) {
        
    }
});

/*socket.addEventListener('close', function(event){
    deconnexion();
});*/


function sendSubscribe(){
    if (connected) {
        var subscriptionId = Math.floor(Math.random() * 1000);
        subscriptionGlobal = subscriptionId;
        var destination = document.getElementById("listeDestination").value;
        var frame = "SUBSCRIBE\n"
        + `id:${subscriptionId}\n`
        + `destination:${destination}\n`
        + "^@";

        socket.send(frame);
        return subscriptionId;
    } else {
        alert("Vous n'êtes pas connecté !");
    }
}

function sendMessage(){
    var message = document.getElementById('userMessage').value;
    var destination = document.getElementById("listeDestination").value;

    var frame = "SEND\n"
    + `destination:${destination}\n`
    + `content-type:text/plain\n`
    + '\n'
    + `${message}\n`
    + '^@';

    socket.send(frame);
    return frame;
}


//Fonction connect si version STOMP 1.2 avec login et mdp
function connect(){
    var login;
    var password;
    var login = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if(login === "" && password === ""){
        alert("Saisir un nom d'utilisateur et un mot de passe");
        
    }else{
        var frame_stomp = "STOMP\n"
        + "accept-version:1.2\n"
        + "host://localhost:8999/stomp\n"
        +`login:${login}\n`
        +`password:${password}\n`
        +"\n"
        +"^@";

        socket.send(frame_stomp);
    }
}

function traitementMessage(message) {
    var destination = getQueueMessage(message.split("\n"));
    var subscription = getSubscriptionMessage(message.split("\n"));

    if ((subscription = subscriptionGlobal) && (getContenTypeMessage(message.split("\n")) == "text/plain")) {
        var realMessage = getMessage(message.split("\n"));
        switch (destination) {
            case "/chat1":
                document.getElementById("chatArea1").value += "\n" + realMessage; 
                break;

            case "/chat2":
                document.getElementById("chatArea2").value += "\n" + realMessage; 
                break;

            case "/chat3":
                document.getElementById("chatArea3").value += "\n" + realMessage; 
                break;
        
            default:
                break;
        }
    }
}

function unsubscribe() {
    var frame = "UNSUBSCRIBE\n"
    + `id:${subscriptionGlobal}\n`
    + `\n`
    + "^@";

    socket.send(frame);
}

function getQueueMessage(lines){
    return lines[3].toString().replace('destination:', '');
}

function getSubscriptionMessage(lines){
    return lines[1].toString().replace('subscription:', '');
}

function getContenTypeMessage(lines) {
    return lines[4].toString().replace('content-type:', '');
}

function getMessage(lines) {
    var result = [];
    for (var i = 6;i<lines.length;i++) {
        if (!lines[i].includes("^@")) {
            result.push(lines[i]);
        }
    }
    var realResult = result.join(' ');
    return realResult;
}







