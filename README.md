29.06.20

pour lancer partie

node.js server.js

localhost:3000


FEATURES:
- Création, rejoindre lobby, partie individuel (basic)
- Trapper : poser des pieges et recompenses (obligation de poser 1 piege et 1 recompenses pour que ce soit valide, devient explorer quand qq a marché sur son piege
- explorer: cercle autour de lui, recupere 1 point par recompenses devient trapper quand marche sur piege
- scores
- collisions avec environment superbement fonctionnels
- Suppression de lobby automatique quand plus de joueurs
- Maitre de room, seul lui peut lancer une partie, il est automatiquement remplacé par qq d'autre si il part
- Impossible de rejoindre une partie en cours

essayer d'avoir socket id en clé et non dans player

FEATURES TO COME:
- enlever lobby du menu quand en jeu
- faire disparaitre joueur quand qq quitte prematurement + ne peut avoir que un seul trapper
- rajouter une feed back visuel quand piege et recompense validés par le serveur + indiquer qu'il faut poser 1 de chaque pour que ce soit valide
- pseudo
- score list
- affichage nom autre joueur au dessus personnage en jeu
- genere map aléatoirement
- partie avec bot
- taunt automatique par le serveur encourage joueurs meilleurs et se moque joueurs nul
