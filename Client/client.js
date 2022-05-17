globalThis.socket = new WebSocket("ws://localhost:8999/stomp", "v10.stomp");
globalThis.connected = false;
globalThis.subscriptionGlobal;
globalThis.username;

socket.addEventListener('open', (event) => {
    console.log('Connexion avec le serveur établie');
    document.getElementById("sendMessage").style.display = "none";
    document.getElementById("chat1").style.display = "none";
    document.getElementById("chat2").style.display = "none";
    document.getElementById("chat3").style.display = "none";
    document.getElementById("subPart").style.display = "none";
});


socket.addEventListener('message', (event) => {
    console.log(event.data);
    if(event.data.includes('CONNECTED')){
        connected = true;
        document.getElementById("connect").innerHTML = "Connecté";
        document.getElementById("sendMessage").style.display = "block";
        document.getElementById("subPart").style.display = "block";
    }
    if (event.data.includes('MESSAGE')) {
        traitementMessage(event.data);
    }
    if (event.data.includes('UNSUBSCRIBED')) {
        var unsubChat = document.getElementById("listeDestination").value;
        if (unsubChat == "/chat1") {
            document.getElementById("chat1").style.display = "none";
        } else if(unsubChat == "/chat2") {
            document.getElementById("chat1").style.display = "none";
        } else {
            document.getElementById("chat1").style.display = "none";
        }
    }
    if (event.data.includes('ERROR')) {
        var errorMessage = getMessageError(event.data.split("\n"));
        alert(errorMessage);
    }
    if (event.data.includes('SUBSCRIBED')) {
        var subChat = document.getElementById("listeDestination").value;
        console.log(subChat);
        if (subChat == "/chat1") {
            document.getElementById("chat1").style.display = "block";
        } else if(subChat == "/chat2") {
            document.getElementById("chat2").style.display = "block";
        } else {
            document.getElementById("chat3").style.display = "block";
        }
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
    + `username:${username}\n`
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

    username = login;

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
        var username = getUsername(message.split("\n"));
        switch (destination) {
            case "/chat1":
                document.getElementById("chatArea1").value += "\n" + username + " : " + realMessage; 
                break;

            case "/chat2":
                document.getElementById("chatArea2").value += "\n" + username + " : " + realMessage; 
                break;

            case "/chat3":
                document.getElementById("chatArea3").value += "\n" + username + " : " + realMessage;
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

function getMessageError(lines) {
    return lines[3].toString().replace('message:', '');
}

function getUsername(lines) {
    return lines[5].toString().replace('username:', '');
}

function getMessage(lines) {
    var result = [];
    for (var i = 7;i<lines.length;i++) {
        if (!lines[i].includes("^@")) {
            result.push(lines[i]);
        }
    }
    var realResult = result.join(' ');
    return realResult;
}
