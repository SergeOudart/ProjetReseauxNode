npm install pour les dépendances

Channel subscribe : 
    Permettre à l'utilisateur de subscribe (https://stomp.github.io/stomp-specification-1.2.html#SUBSCRIBE) à des topics (ou en créer)
        LE serveur valide ou refuse l'accès à ce topic.
    Ensuite l'utilisateur peut envoyer des frames send pour envoyer des messages sur les topics voulus. Chaque topic est représenté par un / différent (https://stomp.github.io/stomp-specification-1.2.html#SEND)