# Board projet, visualisateur 3D

Le Board projet Theodo présenté comme un objet manipulable, dans l'esprit des
visualisateurs produit des sites e-commerce. On fait tourner le panneau à la
souris, on zoome, on clique sur une feuille pour ouvrir son standard.

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
constantes et mise en page, utilitaires Canvas, texture d'une feuille, texture
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
  errors: [],
  misconceptions: [{ misconception, reframe }],
  goodBoard: [],
};
```

### Champs d'un standard

| Champ | Usage |
|---|---|
| `id` | Identifiant unique, sert à placer la feuille sur le board. Obligatoire |
| `boardTitle` | Titre imprimé sur la feuille, comme sur le board physique |
| `title` | Titre exact de la page Notion, affiché dans le panneau s'il diffère |
| `cadence` | Badge de rythme sur la feuille, `Daily`, `Weekly`, `Monthly`. Facultatif |
| `intent` | Bloc Intent du standard. Affiché en exergue dans le panneau |
| `bullets` | Puces imprimées sur la feuille. 6 lignes au maximum, voir ci-dessous |
| `details` | Sections `{ heading, items }` affichées dans le panneau, sans limite |
| `note` | Précision affichée sous l'intention. Facultatif |
| `notionUrl` | Lien ouvert par le bouton en bas du panneau. Absent de cette version publique |

### Régler la longueur des textes

Les feuilles n'affichent que l'essentiel, le détail va dans le panneau HTML.

- **`bullets`** : 6 lignes au maximum, et le rendu réduit encore ce budget si la
  feuille est petite. Une puce trop longue est coupée sur 2 lignes puis
  tronquée. Visez 60 caractères par puce.
- **`intent`** : pas de limite, le panneau défile.
- **`misconceptions`** : le tableau du verso ajuste automatiquement son corps de
  texte pour tenir dans le panneau. Ajouter des lignes réduit la taille du
  texte, en dessous de huit lignes environ il devient difficile à lire de loin.
- **`errors`** et **`goodBoard`** : gardez des phrases courtes, le panneau du
  verso ne s'adapte pas en hauteur.

## Ajouter ou retirer une feuille

Deux étapes.

**1. Le contenu.** Ajoutez un objet dans `standards` du pilier concerné, dans
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

Chaque bloc pilier est une liste de colonnes, chaque colonne une liste d'id de
haut en bas. La règle de mise en page est simple :

> Dans un bloc, **chaque colonne remplit toute la hauteur disponible**. La
> largeur de la colonne découle de la hauteur de ses feuilles, au format A4
> paysage.

Une colonne à une seule feuille donne donc une grande feuille, c'est ce qui
produit le grand Kanban. Une colonne à trois feuilles donne trois feuilles plus
petites. Si le bloc déborde en largeur, tout est réduit proportionnellement,
la mise en page ne casse jamais.

Conséquences pratiques :

- Ajouter une feuille dans une colonne existante rétrécit toutes les feuilles
  de cette colonne. Au delà de trois par colonne le texte devient petit.
- Ajouter une colonne au bloc rétrécit les colonnes voisines.
- Retirer une feuille agrandit automatiquement celles qui restent.
- Un `id` présent dans `content.js` mais absent de `BLOCKS` est placé
  automatiquement dans la colonne la plus courte du bloc, avec un message dans
  la console.
- Un `id` présent dans `BLOCKS` mais absent de `content.js` est ignoré sans
  erreur.

### Ajouter un pilier

Ajoutez l'objet dans `pillars`, puis une entrée dans `BLOCKS` avec un `row`
(`a` ou `b`) et un `col` (`l` ou `r`). Les quatre emplacements sont occupés par
les quatre piliers actuels, un cinquième pilier demande de revoir la grille
`LAYOUT.rows` et `LAYOUT.cols`, section 1 de `main.js`.

## Réglages du rendu

En tête de `main.js` :

| Constante | Effet |
|---|---|
| `BOARD_RATIO` | Ratio du panneau. `3 / 2` par défaut, mettez `4 / 3` pour coller aux proportions du board physique |
| `BOARD_W`, `BOARD_D` | Largeur et épaisseur du panneau, en mètres |
| `SHEET_LIFT` | Hauteur de soulèvement d'une feuille au survol |
| `PALETTE` | Couleurs du panneau, des bandeaux et des étiquettes |
| `LAYOUT` | Grille du recto, hauteurs de bandeaux, gouttières |
| `IDLE_DELAY` | Délai d'inactivité avant la rotation automatique, 8 s |

Les couleurs de pilier, définies dans `content.js`, ne servent qu'à
l'interaction : liseré au survol, accent du panneau, anneau de focus. Les
bandeaux imprimés restent orange, comme sur le board physique.

## Interactions

| Action | Comment |
|---|---|
| Tourner | Glisser à la souris, 360 degrés à l'horizontale, plus ou moins 75 degrés à la verticale |
| Zoomer | Molette, ou pincement sur mobile |
| Survoler | La feuille se soulève, prend le liseré de son pilier, une infobulle suit la souris |
| Ouvrir | Clic ou touche Entrée, la caméra cadre la feuille en 700 ms et le panneau s'ouvre |
| Revenir | Bouton Retour au board, touche Échap, ou clic dans le vide |
| Naviguer au clavier | Tab entre les 8 feuilles, Entrée pour ouvrir. Le focus est dessiné sur la feuille en 3D |

## Choix techniques à connaître

- **Feuilles en A4 paysage.** Le board physique utilise des feuilles paysage,
  pas portrait. Les textures sont donc en paysage, dimensionnées à partir de la
  largeur réelle de chaque feuille, environ 7 pixels par millimètre, plafonnées
  à 2400 pixels de large.
- **Typographie en millimètres.** `makeSheetTexture` dessine en millimètres
  réels de la feuille. Le texte garde ainsi la même taille physique sur toutes
  les feuilles, y compris sur le grand Kanban.
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
  projection écran des feuilles à chaque frame. Ils sont en `pointer-events:
  none`, la souris est gérée uniquement par le canvas.

## Sources du contenu

Cette version est publique. Les liens vers les pages Notion internes ont été
retirés de `content.js`, seuls les titres de standards restent. Pour une
diffusion interne, réajoutez une clé `notionUrl` sur un standard et le bouton
"Ouvrir le standard dans Notion" réapparaît dans le panneau.

Les intentions des 8 standards proviennent du bloc Intent de leur page Notion
Theodo Academy. Les erreurs types, les misconceptions et les repères d'un bon
board proviennent de la page Board projet, dans Theodo Obeya.

Un point à connaître : **User Stories Takt** n'a pas de page Notion dédiée,
c'est une section du standard **Daily Mail**. La feuille porte le titre du
board, le panneau affiche le titre Notion et l'intention du Daily Mail.

La bande d'en-tête, nom de projet, promesse, équipe et Single Point of
Accountability, contient des valeurs génériques. Remplacez-les dans
`content.js`, clé `header`.
