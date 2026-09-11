# Tableau de pilotage du projet, visualisateur 3D

Le tableau de pilotage projet présenté comme un objet manipulable, dans l'esprit
des visualisateurs produit des sites e-commerce. On fait tourner le panneau à la
souris, on zoome, on clique sur une fiche pour ouvrir son détail.

Les textes sont rédigés pour un client qui ne connaît pas le vocabulaire Lean.
La correspondance avec les standards internes se trouve en fin de document.

Quatre fichiers statiques, aucune étape de build, aucun asset binaire. Toutes
les textures sont générées à l'exécution en Canvas 2D.

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000. Un serveur est nécessaire, les modules ESM
ne se chargent pas depuis `file://`.

Deux paramètres d'URL utiles :

- `?fallback=1` affiche la version statique sans WebGL, pour la vérifier.

## Déployer sur GitHub Pages

Poussez le dossier tel quel sur la branche de publication, ou placez son
contenu à la racine du dépôt. Aucune configuration, aucun build. Three.js est
chargé depuis jsDelivr via un importmap, une connexion réseau est donc requise
au premier chargement.

## Structure du code

| Fichier | Rôle |
|---|---|
| `index.html` | Markup, importmap Three.js, barre d'outils, panneau, repli sans WebGL |
| `styles.css` | Interface 2D, responsive, bottom sheet mobile, focus visible |
| `content.js` | Tout le texte. Aucun code 3D. C'est le seul fichier à éditer pour le contenu |
| `main.js` | Scène, textures Canvas, mise en page, raycasting, animations, accessibilité |

`main.js` est découpé en 17 sections numérotées, dans l'ordre de lecture :
constantes et mise en page, utilitaires Canvas, texture d'une fiche, texture
du recto, texture du verso, calcul de la mise en page, scène, construction du
panneau, cadrage et vues, interactions, panneau HTML, barre d'outils,
accessibilité clavier, événements, boucle de rendu, repli, démarrage.

## Modifier le contenu

Tout vit dans `content.js`, exporté en un objet unique `board`.

```js
export const board = {
  title, intention, subtitle,
  header: { promise, team, spa },
  pillars: [{ id, label, color, objectives: [], standards: [] }],
  errors: [],      // verso, panneau Points de vigilance
  goodBoard: [],   // verso, encadré Les signes d'un tableau utile
  usage: [{ question, answer }], // verso, panneau Comprendre son utilisation
};
```

### Champs d'une fiche

| Champ | Usage |
|---|---|
| `id` | Identifiant unique, sert à placer la fiche sur le tableau. Obligatoire |
| `boardTitle` | Titre imprimé sur la fiche, repris dans l'infobulle et le panneau |
| `cadence` | Badge de rythme, `Chaque jour`, `Chaque semaine`, `Chaque mois`. Facultatif |
| `intent` | Réponse à « À quoi sert cette fiche ? ». Affichée en exergue dans le panneau |
| `bullets` | Puces imprimées sur la fiche. 6 lignes au maximum, voir ci-dessous |
| `details` | Sections `{ heading, items }` affichées dans le panneau, sans limite |
| `note` | Précision affichée sous l'intention. Facultatif |

### Régler la longueur des textes

Les fiches n'affichent que l'essentiel, le détail va dans le panneau HTML.

- **`bullets`** : 6 lignes au maximum, et le rendu réduit encore ce budget si la
  fiche est petite. Une puce trop longue est coupée sur 2 lignes puis
  tronquée. Visez 60 caractères par puce.
- **`intent`** : pas de limite, le panneau défile.
- **`usage`**, **`errors`** et **`goodBoard`** : les deux panneaux du verso
  ajustent automatiquement leur corps de texte pour tenir dans la place
  disponible. Ajouter des lignes réduit la taille du texte, au delà d'une
  dizaine de lignes par panneau il devient difficile à lire de loin.

## Ajouter ou retirer une fiche

Deux étapes.

**1. Le contenu.** Ajoutez un objet dans `standards` du thème concerné, dans
`content.js`, avec au minimum `id`, `boardTitle`, `intent` et `bullets`.

**2. La place sur le board.** Ouvrez `main.js`, section 1, et ajoutez l'`id`
dans la constante `BLOCKS` :

```js
const BLOCKS = {
  "rft-jit": {
    row: "a", col: "r",
    columns: [["user-stories-takt", "defects-visualization"], ["feature-kanban"]],
  },
  // ...
};
```

Chaque bloc de thème est une liste de colonnes, chaque colonne une liste d'id de
haut en bas. La règle de mise en page est simple :

> Dans un bloc, **chaque colonne remplit toute la hauteur disponible**. La
> largeur de la colonne découle de la hauteur de ses fiches, au format A4
> paysage.

Une colonne à une seule fiche donne donc une grande fiche, c'est ce qui produit
la grande fiche Parcours des fonctionnalités. Une colonne à trois fiches donne
trois fiches plus petites. Si le bloc déborde en largeur, tout est réduit proportionnellement,
la mise en page ne casse jamais.

Conséquences pratiques :

- Ajouter une fiche dans une colonne existante rétrécit toutes les fiches de
  cette colonne. Au delà de trois par colonne le texte devient petit.
- Ajouter une colonne au bloc rétrécit les colonnes voisines.
- Retirer une fiche agrandit automatiquement celles qui restent.
- Un `id` présent dans `content.js` mais absent de `BLOCKS` est placé
  automatiquement dans la colonne la plus courte du bloc, avec un message dans
  la console.
- Un `id` présent dans `BLOCKS` mais absent de `content.js` est ignoré sans
  erreur.

### Ajouter un thème

Ajoutez l'objet dans `pillars`, puis une entrée dans `BLOCKS` avec un `row`
(`a` ou `b`) et un `col` (`l` ou `r`). Les quatre emplacements sont occupés par
les quatre thèmes actuels, un cinquième thème demande de revoir la grille
`LAYOUT.rows` et `LAYOUT.cols`, section 1 de `main.js`.

## Réglages du rendu

En tête de `main.js` :

| Constante | Effet |
|---|---|
| `BOARD_RATIO` | Ratio du panneau. `3 / 2` par défaut, mettez `4 / 3` pour coller aux proportions du tableau physique |
| `BOARD_W`, `BOARD_D` | Largeur et épaisseur du panneau, en mètres |
| `SHEET_LIFT` | Hauteur de soulèvement d'une fiche au survol |
| `PALETTE` | Couleurs du panneau, des bandeaux et des étiquettes |
| `LAYOUT` | Grille du recto, hauteurs de bandeaux, gouttières |
| `IDLE_DELAY` | Délai d'inactivité avant la rotation automatique, 8 s |

Les couleurs de thème, définies dans `content.js`, ne servent qu'à
l'interaction : liseré au survol, accent du panneau, anneau de focus. Les
bandeaux imprimés restent orange, comme sur le tableau physique.

## Interactions

| Action | Comment |
|---|---|
| Tourner | Glisser à la souris, 360 degrés à l'horizontale, plus ou moins 75 degrés à la verticale |
| Zoomer | Molette, ou pincement sur mobile |
| Survoler | La fiche se soulève, prend le liseré de son thème, une infobulle suit la souris |
| Ouvrir | Clic ou touche Entrée, la caméra cadre la fiche en 700 ms et le panneau s'ouvre |
| Revenir | Bouton Retour au tableau, touche Échap, ou clic dans le vide |
| Naviguer au clavier | Tab entre les 8 fiches, Entrée pour ouvrir. Le focus est dessiné sur la fiche en 3D |

## Choix techniques à connaître

- **Fiches en A4 paysage.** Le tableau physique utilise des feuilles paysage,
  pas portrait. Les textures sont donc en paysage, dimensionnées à partir de la
  largeur réelle de chaque fiche, environ 7 pixels par millimètre, plafonnées
  à 2400 pixels de large.
- **Typographie en millimètres.** `makeSheetTexture` dessine en millimètres
  réels de la fiche. Le texte garde ainsi la même taille physique sur toutes
  les fiches, y compris sur la plus grande.
- **Ombres.** `PCFSoftShadowMap` est déprécié puis retiré des versions récentes
  de Three.js. Le rendu utilise `VSMShadowMap`, son remplaçant, qui accepte un
  vrai flou via `shadow.radius` et `shadow.blurSamples`. Une ombre de contact
  supplémentaire, dessinée en Canvas, ancre l'objet en lévitation au sol.
- **Rendu à la demande.** `renderer.setAnimationLoop` ne redessine que si les
  contrôles bougent, si une animation est en cours, ou si l'oscillation de
  repos tourne. Panneau ouvert et objet immobile, la boucle ne dessine rien.
- **Oscillation de repos.** 2 degrés d'amplitude sur 6 secondes, coupée à la
  première manipulation et respectueuse de `prefers-reduced-motion`. Le bouton
  Réinitialiser la relance.
- **Cibles clavier.** Huit boutons transparents sont positionnés sur la
  projection écran des fiches à chaque frame. Ils sont en `pointer-events:
  none`, la souris est gérée uniquement par le canvas.

## Correspondance avec les standards internes

Les textes du site sont rédigés pour un client. Cette table permet de retrouver
le standard d'origine de chaque fiche, pour la documentation interne.

| N° | Fiche affichée | Standard d'origine | Thème affiché |
|---|---|---|---|
| 1 | Votre retour d'expérience | Questionnaire | Comprendre vos besoins |
| 2 | Priorités du produit | Product architecture | Comprendre vos besoins |
| 3 | Point d'avancement | Daily Mail, section User Story Takt | Livrer avec fiabilité |
| 4 | Suivi des anomalies | Defect Visualization | Livrer avec fiabilité |
| 5 | Parcours des fonctionnalités | The feature kanban | Livrer avec fiabilité |
| 6 | Outils et environnement technique | Tech Working Conditions | Faciliter le travail technique |
| 7 | Problèmes et actions | Dantotsu and Problem Solving | Résoudre les problèmes |
| 8 | Prévenir les problèmes récurrents | Weak Point Management | Résoudre les problèmes |

Les quatre thèmes reprennent les quatre principes du Lean Tech Manifesto :
Comprendre vos besoins pour Value for the Customer, Livrer avec fiabilité pour
Right-first-time and Just-in-time, Faciliter le travail technique pour
Tech-enabled Network of Teams, Résoudre les problèmes pour Build a Learning
Organization.

Les liens vers les pages internes ont été retirés, le site étant public. Pour
une diffusion interne, réajoutez une clé `notionUrl` sur une fiche et restaurez
le bouton correspondant dans `renderPanel`, section 11 de `main.js`.

La bande d'en-tête, projet, engagements, équipe et responsable, contient des
valeurs génériques. Remplacez-les dans `content.js`, clé `header`.
