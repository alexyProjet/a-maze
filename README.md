01.07.20

Créé avec NodeJs, socket.io, pug, exclusivement en Javascript 
--------------------------------------------------------------
pour lancer une partie :
node.js server.js
localhost:3000

But du jeu :
--------------------------------------------------------------
2 Rôles : Trapper et Explorer

Explorer : Vous vous aventurez dans un labyrinthe dont vous ne pouvez voir qu'une partie. Vous devez trouver des récompenses... mais attention, 
        il y a également des pièges posés par d'autres joueurs et vous ne pouvez pas les distinguer. 
        Si vous récupérez une récompense, vous gagnez 1 point.
        Si vous marchez sur une piège, vous devenez Trapper

Trapper : Vous voyez le labyrinthe dans son intégralité.
        Vous voyez où sont les pièges et les récompenses.
        Vous pouvez placer autant de pièges que de récompenses sur le terrain (dans le limite de 4 de chaque)
        Si quelqu'un marche sur vos pièges, vous devenez explorer et gagnez 1 point
        (info : si vous redevenez explorer et que certains de vos pièges sont encore sur le terrain ils vous rapporteront des points si quelqu'un marche dessus)

A corriger:
--------------------------------------------------------------

- darken bug de rayon selon tailel de fenêtre

FEATURES:
--------------------------------------------------------------
- Système complet de salons et gestion de salons (suppression, ajout, mis à jour en temps réel, connexion/deconnexion, menu de salons, etc...)
- Roles de trapper et explorer entièrement fonctionnels
- Scores et classement
- Gestion des collisions avec environment
- Maitre de room, seul lui peut lancer une partie, il est automatiquement remplacé par qq d'autre si il part
- Impossible de rejoindre une partie en cours
- Feedback visuel quand un piege et une recompense sont validés par le serveur + indication qu'il faut poser 1 de chaque pour que ce soit valide
- Joueur (et ses entités) disparaissent de la partie quand il quitte la partie
- Chronomètre de partie
- Ecran de fin de partie
- Couleur de personnage différente des ennemis
- L'image du joueur dynamique en fonction de la direction
- Animation de piege

FEATURES TO COME:
--------------------------------------------------------------
- affichage nom autre joueur au dessus personnage en jeu
- genere map aléatoirement
- partie avec bot
- taunt automatique par le serveur encourage joueurs meilleurs et se moque joueurs nul (bruitages recompenses et pieges)
- redesign des icons de pieges recompenses et anonymes
