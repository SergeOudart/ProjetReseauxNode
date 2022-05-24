# CHAT STOMP
Bienvenue sur le Chat par STOMP réalisé par Guillaume Reinert, Matthieu Jacquinet et Serge Oudart.
Ce système de chat implémente STOMP en version 1.2.

# Installation 
Une fois ce projet cloné, veuillez installer les packages nécessaires au fonctionnement du système :
```
npm install
```

# Lancement
Pour lancer ce projet, 2 scripts sont présents dans le répertoire principal :
 - launch.bat
 - launch.sh 

Lancement sur Windows : 
Dirigez-vous dans le répertoire principal du projet et lancez le script launch.bat
```
./launch.bat
```

Lancement sur Linux/Mac
Dirigez-vous dans le répertoire principal du projet et lancez le script launch.bat
```
./launch.sh
```
Si le script ne se lance pas essayez d'ajouter les droits d'exécutions sur les scripts grâce à la commande : sudo chmod +x launch.sh

# Fonctionnement
Le client va envoyer des requêtes STOMP au serveur (lancé grâce au script de lancement) et ce dernier va répondre en renvoyant les informations associées
à la frame envoyée.
Il faut donc pour ce faire : 
 - Se connecter au serveur grâce à identifiant et mot de passe
 - Choisir le chat sur lequel discuter
 - S'abonner grâce au bouton
 - Envoyer des messages grâce au champ d'entrée
