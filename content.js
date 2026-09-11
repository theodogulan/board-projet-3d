/**
 * Contenu du Tableau de pilotage du projet.
 *
 * Ce fichier est le seul à modifier pour changer les textes. Aucun code 3D ici.
 * Voir le README pour ajouter ou retirer une fiche sans casser la mise en page.
 *
 * Version destinée au client. Les intitulés internes et les références aux
 * standards Lean Tech ne sont pas affichés, la table de correspondance entre
 * les 8 fiches et les standards d'origine se trouve dans le README.
 */

export const board = {
  title: "Tableau de pilotage du projet",

  intention:
    "Ce tableau aide notre équipe à suivre vos priorités, l'avancement du projet et la qualité du produit. Il permet de repérer les difficultés tôt et de décider des actions nécessaires pour tenir nos engagements.",

  subtitle: "Repérer les risques, résoudre les problèmes et tenir nos engagements.",

  /**
   * Bande d'en-tête du recto. Contenu à renseigner pour chaque projet.
   * `members` contient les initiales dessinées dans les pastilles.
   */
  header: {
    promise: {
      label: "Projet et engagements",
      project: "Nom du projet",
      text: "Le résultat attendu, les fonctionnalités prévues, le niveau de qualité, la date de livraison et le budget convenus avec vous.",
    },
    team: {
      label: "Équipe projet",
      // Responsable produit, responsable technique, développeurs, designer
      members: ["RP", "RT", "D1", "D2", "DS"],
    },
    spa: {
      label: "Responsable des engagements",
      // Personne responsable du respect des engagements du projet
      members: ["PN"],
    },
  },

  /**
   * Les 4 thèmes du tableau.
   * `color` sert uniquement d'accent d'interaction, survol, focus et panneau.
   * Les bandeaux imprimés restent orange, comme l'objet physique.
   */
  pillars: [
    {
      id: "value",
      label: "Comprendre vos besoins",
      color: "#3E7BFA",
      objectives: [
        "Comprendre ce qui compte pour vous et pour les utilisateurs, afin de concentrer les efforts sur les améliorations les plus utiles.",
      ],
      standards: [
        {
          id: "questionnaire",
          boardTitle: "Votre retour d'expérience",
          cadence: "Chaque semaine",
          intent:
            "Recueillir votre avis sur ce que vous avez vécu : ce qui vous a satisfait, ce qui vous a gêné et ce qui compte le plus pour vous. Ces échanges nous aident à choisir les améliorations à apporter.",
          bullets: [
            "Comprendre ce qui vous satisfait ou vous gêne.",
            "Poser des questions ouvertes et laisser le temps de répondre.",
            "Noter vos mots exacts, sans les interpréter.",
            "Échanger avec une personne à la fois.",
            "Analyser chaque retour, quelle que soit la note donnée.",
          ],
          details: [
            {
              heading: "Points de vigilance",
              items: [
                "Enchaîner les questions sans laisser place à la discussion.",
                "Demander des idées de solution avant d'avoir compris une expérience concrète.",
                "Justifier immédiatement une difficulté au lieu d'écouter ses conséquences pour vous.",
                "Interroger plusieurs personnes ensemble, au risque qu'elles influencent leurs réponses.",
                "Faire répéter des sujets déjà abordés lors d'un point projet, sans question nouvelle.",
              ],
            },
            {
              heading: "Comment l'équipe s'y prend",
              items: [
                "Avant l'échange, expliquer son objectif, convenir d'un rendez-vous régulier et relire vos priorités connues.",
                "Pendant l'échange, poser des questions ouvertes, laisser des silences et reprendre certains de vos mots pour vous inviter à préciser votre pensée.",
                "Après l'échange, distinguer vos propos exacts des interprétations de l'équipe et conserver les éléments utiles.",
                "Analyser les retours et garder une trace des conclusions.",
              ],
            },
          ],
        },
        {
          id: "product-architecture",
          boardTitle: "Priorités du produit",
          cadence: "Chaque mois",
          intent:
            "Relier les attentes des utilisateurs aux objectifs de votre entreprise pour décider où concentrer les efforts. Cette vue aide à choisir les priorités d'un produit utile, que les utilisateurs auront envie d'adopter.",
          bullets: [
            "Une vue d'ensemble des attentes prioritaires.",
            "Le lien entre ces attentes et les exigences du produit.",
            "Des priorités discutées avec les personnes concernées.",
            "Des besoins distingués selon les profils d'utilisateurs.",
            "Ce que le produit doit permettre de réussir et les critères pour le vérifier.",
          ],
          details: [
            {
              heading: "Points de vigilance",
              items: [
                "Partir uniquement de la liste des fonctionnalités déjà prévues pour en déduire les besoins.",
                "Attendre les entretiens utilisateurs pour formuler les premières hypothèses : celles-ci servent de point de départ, puis sont confrontées aux retours du terrain.",
                "Décrire une attente par une solution déjà choisie ou par une formule publicitaire trop vague.",
                "Accumuler les attentes sans faire ressortir les quelques priorités de chaque profil.",
                "Mélanger les profils d'utilisateurs, au point de ne plus savoir ce qui compte pour qui.",
                "Prendre une performance technique pour un objectif en soi, sans expliquer à quel besoin elle répond.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "rft-jit",
      label: "Livrer avec fiabilité",
      color: "#1FA97A",
      objectives: [
        "Suivre ce qui avance, détecter les retards et les anomalies, et faciliter le travail entre les équipes pour livrer au rythme prévu avec la qualité attendue.",
      ],
      standards: [
        {
          id: "user-stories-takt",
          boardTitle: "Point d'avancement",
          cadence: "Chaque jour",
          note:
            "Ce suivi s'appuie sur un court message quotidien pendant les périodes qui nécessitent une information rapprochée.",
          intent:
            "Vous donner une vision claire de ce qui est terminé, de ce qui bloque et des actions engagées. L'objectif est que vous sachiez où en est le projet et comment l'équipe traite les difficultés.",
          bullets: [
            "Un point envoyé par le responsable produit, chargé des livraisons prévues sur la période.",
            "Un suivi quotidien durant les quatre premières et les quatre dernières semaines, ainsi qu'autour des étapes clés.",
            "Un suivi renforcé également en cas d'insatisfaction importante.",
            "Un message court : ce qui est terminé, ce qui bloque, ce que l'équipe fait pour avancer.",
            "Tout impact sur le calendrier est annoncé de vive voix avant l'envoi du message.",
          ],
          details: [
            {
              heading: "Comment l'équipe s'y prend",
              items: [
                "Dès qu'un travail prévu reste inachevé en fin de journée, en analyser les raisons et préparer les actions à engager.",
                "Résumer les faits utiles pour comprendre l'avancement du projet.",
                "Vous contacter directement lorsqu'une difficulté remet en cause les engagements ou le calendrier.",
                "Tenir compte de vos réponses pour améliorer la clarté et l'utilité des points suivants.",
              ],
            },
          ],
        },
        {
          id: "defects-visualization",
          boardTitle: "Suivi des anomalies",
          cadence: "Chaque semaine",
          intent:
            "Repérer les anomalies fréquentes ou persistantes et les parties du produit les plus touchées. L'équipe peut ainsi concentrer ses efforts là où la qualité doit progresser en priorité.",
          bullets: [
            "Recenser les anomalies fréquentes ou persistantes.",
            "Repérer les parties du produit les plus fragiles.",
            "Choisir les améliorations prioritaires à partir des faits.",
            "Transmettre les problèmes récurrents à la fiche « Prévenir les problèmes récurrents ».",
          ],
          details: [
            {
              heading: "Ce que montre la fiche",
              items: [
                "Les anomalies regroupées par partie du produit ou du système technique.",
                "Leur fréquence et leur répétition dans le temps.",
                "Les zones les plus touchées, à traiter en priorité.",
              ],
            },
          ],
        },
        {
          id: "feature-kanban",
          boardTitle: "Parcours des fonctionnalités",
          intent:
            "Voir comment chaque fonctionnalité progresse d'une équipe à l'autre, où elle attend et ce qui la bloque. Cette vue aide les équipes à mieux se coordonner pour réduire les délais de livraison.",
          bullets: [
            "Une colonne par équipe, avec les personnes concernées.",
            "Les travaux en cours et les contrôles qualité à réaliser.",
            "Des étapes claires : « Prêt pour l'équipe suivante » et « Terminé ».",
            "Une courbe de l'avancement des fonctionnalités au fil du temps.",
            "Les attentes et les blocages qui ralentissent les livraisons.",
          ],
          details: [
            {
              heading: "Exercices pratiques",
              items: [
                "Exercice 1 : reconnaître un tableau qui aide à repérer les problèmes.",
                "Exercice 2 : choisir les colonnes adaptées au travail des équipes.",
                "Exercice 3 : utiliser le tableau pour décider des actions à engager.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "network-of-teams",
      label: "Faciliter le travail technique",
      color: "#F0803C",
      objectives: [
        "Vérifier que l'équipe dispose des outils et des conditions nécessaires pour développer, vérifier et mettre en ligne le produit efficacement.",
      ],
      standards: [
        {
          id: "tech-working-conditions",
          boardTitle: "Outils et environnement technique",
          intent:
            "Réduire les pertes de temps et les risques techniques à chaque étape : développer le produit, surveiller son fonctionnement et mettre les évolutions à disposition des utilisateurs.",
          bullets: [
            "De bonnes conditions pour développer, surveiller et mettre en ligne le produit.",
            "Le matériel, les outils et les accès nécessaires au quotidien.",
            "Une vérification rapide des modifications pendant le développement.",
            "Une visibilité sur le produit en service et une méthode de traitement des incidents.",
            "Des mises en ligne rapides et fiables une fois les modifications validées.",
          ],
          details: [
            {
              heading: "Développer efficacement",
              items: [
                "Disposer d'un poste de travail adapté, d'une connexion stable et des accès nécessaires aux outils du projet et aux systèmes du client. Si l'équipe utilise des assistants d'IA, disposer des outils adaptés aux tâches à réaliser.",
                "Voir rapidement l'effet d'une modification et repérer les erreurs pendant le développement. Si des assistants d'IA interviennent, leur permettre de préparer le projet, de lancer les tests et d'en lire les résultats.",
                "Garder un code compréhensible et cohérent, avec des tests fiables et rapides qui détectent les effets indésirables des changements. Fournir les mêmes règles de qualité aux développeurs et aux assistants d'IA utilisés pour vérifier le code.",
              ],
            },
            {
              heading: "Surveiller le produit en service",
              items: [
                "Disposer d'informations à jour pour comprendre le fonctionnement du produit et l'impact d'un problème sur les utilisateurs. Les outils d'analyse, y compris les assistants d'IA utilisés par l'équipe, doivent pouvoir exploiter les informations nécessaires au diagnostic.",
                "Détecter les incidents grâce à des alertes utiles et suivre une méthode claire pour les traiter. Conserver des informations structurées pour faciliter la recherche de leur origine.",
              ],
            },
            {
              heading: "Mettre les évolutions en ligne",
              items: [
                "Pouvoir mettre en ligne les modifications validées sans attente inutile, au moins chaque semaine, et revenir à une version précédente si nécessaire. Soumettre les modifications produites avec l'aide d'une IA aux contrôles de qualité du projet.",
                "Vérifier les évolutions dans un environnement proche du produit en service, avec des données représentatives de l'usage réel. Si ces vérifications sont confiées à un assistant d'IA, lui permettre de les lancer avec des données anonymisées.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "learning-organization",
      label: "Résoudre les problèmes",
      color: "#8B5CF6",
      objectives: [
        "Comprendre les difficultés rencontrées, suivre les actions décidées et partager ce que l'équipe apprend pour améliorer durablement la qualité et les délais.",
      ],
      standards: [
        {
          id: "dantotsu",
          boardTitle: "Problèmes et actions",
          intent:
            "Traiter les difficultés du quotidien en comprenant leurs causes, en décidant d'actions concrètes et en vérifiant leurs effets. Chaque problème traité aide l'équipe à mieux travailler.",
          bullets: [
            "Partir d'un problème concret rencontré par l'équipe.",
            "Noter la date, le problème, ses causes, les actions et leur avancement.",
            "Tenir à jour une ligne par problème.",
            "Vérifier l'effet des actions et partager ce qui a été appris.",
          ],
          details: [
            {
              heading: "Colonnes de la fiche",
              items: [
                "Date et origine du signalement.",
                "Problème constaté.",
                "Causes identifiées.",
                "Actions décidées.",
                "Avancement des actions.",
              ],
            },
          ],
        },
        {
          id: "weak-point-management",
          boardTitle: "Prévenir les problèmes récurrents",
          intent:
            "Lorsqu'un problème revient malgré les actions déjà menées, approfondir l'analyse pour comprendre ce qui le provoque. L'objectif est d'agir sur son origine et de vérifier dans le temps qu'il ne réapparaît plus.",
          bullets: [
            "Repérer les problèmes qui reviennent.",
            "S'appuyer sur les faits recensés dans le suivi des anomalies.",
            "Comprendre pourquoi les premières actions n'ont pas suffi.",
            "Demander « pourquoi ? » à chaque étape et vérifier les explications avec des faits.",
            "Traiter les causes à l'origine du problème et suivre le résultat dans le temps.",
          ],
          details: [
            {
              heading: "Lien avec les autres fiches",
              items: [
                "Point de départ : les anomalies fréquentes ou persistantes repérées dans « Suivi des anomalies ».",
                "Résultat recherché : des causes traitées, une amélioration vérifiée dans le temps et des enseignements partagés avec l'équipe.",
              ],
            },
          ],
        },
      ],
    },
  ],

  /** Verso, panneau de gauche */
  errors: [
    "Modifier le format commun et ses repères visuels, au risque de rendre le tableau plus difficile à comprendre.",
    "Placer le tableau au sol ou loin de l'équipe, ce qui limite son utilisation au quotidien.",
    "Remplir les huit fiches séparément, sans relier les informations ni regarder le projet dans son ensemble.",
    "Tenir un second tableau numérique en parallèle, au risque de disperser les informations et de moins utiliser le tableau commun.",
  ],

  /** Verso, encadré en pied du panneau de gauche */
  goodBoard: [
    "Il reste lisible et se concentre sur l'essentiel.",
    "Les deux ou trois principaux problèmes du projet se repèrent immédiatement.",
    "Il reflète la vie de l'équipe : un dessin, un emoji ou une image peuvent exprimer un ressenti.",
  ],

  /** Verso, panneau de droite */
  usage: [
    {
      question: "Comment ce tableau s'articule-t-il avec les autres suivis ?",
      answer:
        "Il aide l'équipe à comprendre les difficultés et à choisir les actions à mener. Le suivi destiné à la direction dispose de ses propres supports pour présenter les engagements et leurs résultats.",
    },
    {
      question: "Qui le renseigne et l'utilise ?",
      answer:
        "Toute l'équipe contribue. Les responsables produit et technique s'en servent en priorité pour analyser la situation et orienter les décisions.",
    },
    {
      question: "Comment aide-t-il à piloter le projet ?",
      answer:
        "Il permet de prendre du recul sur les difficultés qui pourraient compromettre les fonctionnalités prévues, la qualité, les délais ou le budget. Il complète les outils d'organisation du travail quotidien.",
    },
    {
      question: "Qu'est-ce qui est partagé avec vous ?",
      answer:
        "Le tableau sert d'abord au travail interne de l'équipe. Les éléments utiles à votre compréhension du projet et à vos décisions peuvent être partagés lors de nos échanges.",
    },
    {
      question: "Pourquoi certaines fiches demandent-elles un travail d'analyse ?",
      answer:
        "Les renseigner oblige l'équipe à vérifier ses hypothèses, à expliquer les écarts et à préciser ce qu'elle doit encore comprendre. Ce travail l'aide à anticiper les difficultés.",
    },
    {
      question: "Qui prend les décisions à partir de ce tableau ?",
      answer:
        "Il aide les responsables produit et technique à décider à partir de faits et à identifier les sujets sur lesquels ils ont besoin d'aide. Leurs responsables peuvent s'appuyer sur ces éléments pour les accompagner.",
    },
  ],
};
