07.07.20

Créé avec NodeJs, socket.io, pug, exclusivement en Javascript 
--------------------------------------------------------------
Pour lancer une partie :
#Installer les modules :

npm install

#Lance le serveur :

node server.js

#Dans le navigateur écrire :

localhost:3000

OU
Version live : https://a-mazze.herokuapp.com/

/!\ : Vous ne pouvez pas lancer une partie sans un autre joueur. Pour cela, il suffit d'ouvrir un autre onglet et de taper localhost:3000, puis de rejoindre le salon créé précédemment.

Touches :
Déplacement avec ZQSD

But du jeu :
--------------------------------------------------------------
2 Rôles : Trapper et Explorer

Explorer : Vous vous aventurez dans un labyrinthe dont vous ne pouvez voir qu'une partie. Vous devez trouver des récompenses... mais attention, 
        il y a également des pièges posés par d'autres joueurs et vous ne pouvez pas les distinguer. 
        Si vous récupérez une récompense, vous gagnez 1 point.
        Si vous marchez sur un piège, vous devenez Trapper

Trapper : Vous voyez le labyrinthe dans son intégralité.
        Vous voyez où sont les pièges et les récompenses.
        Vous pouvez placer autant de pièges, que de récompenses sur le terrain (dans le limite de 4 de chaque)
        Si quelqu'un marche sur vos pièges, vous devenez explorer et gagnez 1 point
        (info : si vous redevenez explorer et que certains de vos pièges sont encore sur le terrain ils vous rapporteront des points si quelqu'un marche dessus)

FEATURES:
--------------------------------------------------------------
- Système de gestion de salons (suppression, ajout, mis à jour en temps réel, connexion/deconnexion, menu de salons, etc...)
- Rôles de trapper et explorer entièrement fonctionnels
- Scores et classement
- Gestion des collisions avec l'environement
- Maitre de salon, seul lui peut lancer une partie, il est automatiquement remplacé par quelqu'un d'autre si il part
- Impossible de rejoindre une partie en cours
- Feedback visuel quand un piège et une récompense sont validés par le serveur. Indication visuel qu'il faut poser un de chaque pour que ce soit valide
- Le joueur (et ses entités) disparaissent de la partie quand il quitte la partie
- Chronomètre de partie
- Ecran de fin de partie
- Couleur de personnage différente des ennemis
- L'image du joueur est adaptée à la direction du mouvement
- Les entités sont animées
- Affichage du nom des autres joueurs sur le plateau, en jeu
- Map générée aléatoirement
- Taunt automatique par le serveur (bruitages, récompenses et pièges)
- Salon privé/public
- Mesures anti-triche (anonymisation des entités pour le role explorer, bloquage des déplacements impossibles...)

AMELIORATIONS POSSIBLES:
--------------------------------------------------------------
- Optimisation du code
- Mesure anti-triche pour la fonction Darken()


