07.07.20

Créé avec NodeJs, socket.io, pug, exclusivement en Javascript 
--------------------------------------------------------------
Lancer une partie :
#Installe les modules :

npm install

#Lance le serveur :

node server.js

#Dans le navigateur écrire :

localhost:3000

OU
https://a-mazze.herokuapp.com/

/!\ : Vous ne pouvez pas lancer une partie sans un autre joueur, il suffit d'ouvrir un autre onglet et taper localhost:3000, puis rejoindre le salon créé précédemment.

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
- Roles de trapper et explorer entièrements fonctionnels
- Scores et classement
- Gestion des collisions avec l'environement
- Maitre de room, seul lui peut lancer une partie, il est automatiquement remplacé par qq d'autre si il part
- Impossible de rejoindre une partie en cours
- Feedback visuel quand un piege et une recompense sont validés par le serveur + indication qu'il faut poser 1 de chaque pour que ce soit valide
- Joueur (et ses entités) disparaissent de la partie quand il quitte la partie
- Chronomètre de partie
- Ecran de fin de partie
- Couleur de personnage différente des ennemis
- L'image du joueur adaptée à la direction du mouvement
- Animations des entités
- Affichage du nom des autres joueurs sur le plateau, en jeu
- Map générée aléatoirement
- Taunt automatique par le serveur (bruitages, recompenses et pieges)
- Salon privé/public
- Mesures anti-triche (anonymisation des entités pour le role explorer, déplacements impossibles)

AMELIORATIONS POSSIBLES:
--------------------------------------------------------------
- Optimisation du code
- Mesure anti-triche pour la fonction Darken()


