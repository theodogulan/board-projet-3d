/**
 * Contenu du Board projet.
 *
 * Ce fichier est le seul à modifier pour changer les textes. Aucun code 3D ici.
 * Voir le README pour ajouter ou retirer une feuille sans casser la mise en page.
 *
 * Version publique. Les liens `notionUrl` vers les pages Notion internes ont
 * été retirés, seuls les titres de standards restent. Pour une diffusion
 * interne, réajoutez une clé `notionUrl` sur un standard et le bouton
 * "Ouvrir le standard dans Notion" réapparaît dans le panneau.
 *
 * Les intentions des standards sont reprises du bloc "Intent" de chaque page
 * Notion Theodo Academy.
 *
 * `boardTitle` est le titre imprimé sur la feuille, traduit en français.
 * `title` reste le titre officiel du standard dans Notion, en anglais, et
 * s'affiche dans le panneau quand il diffère. Ne traduisez pas `title`, c'est
 * lui qui fait le lien avec la source.
 */

export const board = {
  title: "Board projet",

  intention:
    "Utiliser un support physique de visual management commun pour rendre les problèmes visibles plus tôt, apprendre plus vite ensemble autour des standards clés du Lean Tech, afin d'aider les équipes projet à mieux décider.",

  subtitle:
    "Rendre visibles pour l'équipe les problèmes qui vont l'empêcher de livrer la promesse, puis les analyser pour prendre de meilleures décisions.",

  /**
   * Bande d'en-tête du recto. Contenu volontairement générique.
   * Remplacez les valeurs par celles de votre projet.
   */
  header: {
    promise: {
      label: "Project Name / Promise",
      project: "Nom du projet",
      text: "La promesse faite au client, avec son périmètre, son niveau de qualité, sa date et son budget.",
    },
    team: {
      label: "Team",
      members: ["PM", "TL", "Dev", "Dev", "Design"],
    },
    spa: {
      label: "Single Point of Accountability",
      members: ["SPA"],
    },
  },

  /**
   * Les 4 piliers du Lean Tech Manifesto.
   * `color` sert uniquement d'accent d'interaction, survol, focus et panneau.
   * Les bandeaux imprimés sur le board restent orange, comme l'objet physique.
   */
  pillars: [
    {
      id: "value",
      label: "Value for the Customer",
      color: "#3E7BFA",
      objectives: ["Rendre visible la compréhension de la valeur créée pour le client."],
      standards: [
        {
          id: "questionnaire",
          boardTitle: "Questionnaire",
          title: "Questionnaire",
          cadence: "Weekly",
          intent:
            "Rituel pour apprendre les préférences et les frustrations du client, afin d'identifier des opportunités d'amélioration et d'augmenter sa satisfaction.",
          bullets: [
            "Écouter les préférences et les frustrations du client",
            "Questions ouvertes, écoute active, silences respectés",
            "Noter les verbatim entre guillemets, sans les analyser",
            "Un répondant à la fois, jamais en groupe",
            "Analyser le retour, quelle que soit la note",
          ],
          details: [
            {
              heading: "Erreurs types",
              items: [
                "Dérouler les questions de façon mécanique au lieu d'être dans l'échange.",
                "Demander comment s'améliorer au lieu de comprendre ce qui n'a pas plu. Un bon questionnaire porte sur le passé, pas sur le futur.",
                "Réagir à chaud aux retours au lieu d'écouter l'impact du problème pour le client.",
                "Interroger plusieurs personnes en même temps, elles s'influencent.",
                "Reprendre les sujets déjà traités en revue, le client a l'impression de se répéter.",
              ],
            },
            {
              heading: "Mode opératoire",
              items: [
                "Avant, expliquer l'intention, caler un créneau régulier, avoir en tête les préférences clés du client.",
                "Pendant, pratiquer l'écoute active, poser des questions ouvertes, utiliser le mirroring.",
                "Après, relire les notes, distinguer les verbatim des interprétations, supprimer le superflu.",
                "Analyser le questionnaire et enregistrer l'analyse.",
              ],
            },
          ],
        },
        {
          id: "product-architecture",
          boardTitle: "Architecture produit",
          title: "Product architecture",
          cadence: "Monthly",
          intent:
            "Construire un diagramme d'architecture produit est un moyen pour le product manager de négocier avec les parties prenantes où mettre l'énergie de l'équipe, pour atteindre l'adoption et les objectifs business du produit.",
          bullets: [
            "Niveau 1, Product Radar",
            "Niveau 2, Quality Function Deployment",
            "Négocier où mettre l'énergie de l'équipe",
            "Segmenter par profil, on sait ce qui compte et pour qui",
            "Préférences clés et performances critiques, pas des features",
          ],
          details: [
            {
              heading: "Erreurs types",
              items: [
                "Rétro-concevoir l'architecture produit à partir du backlog de features.",
                "Attendre d'avoir parlé aux utilisateurs pour ébaucher une architecture produit. La discovery sert à casser ses idées reçues, pas à savoir quoi faire.",
                "Écrire les préférences clés comme des features ou comme une accroche marketing.",
                "Lister toutes les préférences d'un profil, 10 préférences pour un seul profil.",
                "Ne pas segmenter, on ne sait plus ce qui est important pour qui.",
                "Traiter les performances critiques comme un résultat et non comme un moyen.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "rft-jit",
      label: "Right-first-time and Just-in-time",
      color: "#1FA97A",
      objectives: [
        "Rendre visible l'avancement du travail.",
        "Détecter plus tôt les dérives, blocages ou défauts de flux.",
        "Soutenir un delivery plus fluide et plus fiable.",
      ],
      standards: [
        {
          id: "user-stories-takt",
          boardTitle: "Takt des user stories",
          title: "Daily Mail",
          cadence: "Daily",
          note:
            "Le takt des user stories est suivi à l'intérieur du standard Daily Mail, qui n'a pas de page Notion dédiée.",
          intent:
            "Construire la confiance avec le client en montrant que l'équipe Theodo livre de la valeur vite, ou en expliquant clairement comment elle traite les blocages de façon proactive.",
          bullets: [
            "Envoyé par le Product Manager, propriétaire du delivery du sprint",
            "Les 4 premières semaines, les 4 dernières, autour des jalons",
            "Aussi en cas de crise de satisfaction client",
            "Court et net, pour situer où en est le projet",
            "Pas de surprise dans la boîte mail, un impact roadmap s'annonce par téléphone",
          ],
          details: [
            {
              heading: "Mise en pratique",
              items: [
                "Anticiper, si un ticket n'est pas terminé en fin de journée, faire le DPS tout de suite pour que les apprentissages soient prêts.",
                "Rester court et précis, l'objectif est de construire la confiance et de montrer où en est le projet.",
                "Penser comme le client, seules les bonnes surprises arrivent par mail.",
                "S'améliorer en continu, une réponse du client indique ce qui a fonctionné.",
              ],
            },
          ],
        },
        {
          id: "defects-visualization",
          boardTitle: "Visualisation des défauts",
          title: "Defect Visualization",
          cadence: "Weekly",
          intent:
            "Rendre visibles les défauts chroniques et fréquents pour concentrer l'équipe sur les parties les plus fragiles du système, et créer des moments de kaizen.",
          bullets: [
            "Rendre visibles les défauts chroniques et fréquents",
            "Repérer les parties les plus fragiles du système",
            "Créer des moments de kaizen à partir des défauts",
            "Alimente le Weak Point Management",
          ],
          details: [
            {
              heading: "Ce que la feuille montre",
              items: [
                "Les défauts regroupés par zone du système.",
                "Leur fréquence et leur caractère chronique.",
                "Les zones qui concentrent le plus de défauts, cibles prioritaires de kaizen.",
              ],
            },
          ],
        },
        {
          id: "feature-kanban",
          boardTitle: "Kanban",
          title: "The feature kanban",
          intent:
            "Faire ressortir clairement les problèmes de travail d'équipe qui nous empêchent de livrer les features plus vite.",
          bullets: [
            "Une colonne par équipe, avec ses membres",
            "Work in Progress, points de contrôle qualité",
            "Ready for Next Team, puis Done",
            "La courbe d'avancement des features dans le temps",
            "Sert à voir les problèmes, pas à suivre l'activité",
          ],
          details: [
            {
              heading: "Pratiquer",
              items: [
                "Simulateur 1, OK ou KO.",
                "Simulateur 2, choisir ses colonnes.",
                "Simulateur 3, la pratique de management.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "network-of-teams",
      label: "Tech-enabled Network of Teams",
      color: "#F0803C",
      objectives: [
        "Rendre visible la qualité des conditions de travail techniques.",
        "Aider l'équipe à progresser sur les conditions qui permettent une meilleure qualité technique et un delivery plus rapide.",
      ],
      standards: [
        {
          id: "tech-working-conditions",
          boardTitle: "Conditions de travail techniques",
          title: "Tech Working Conditions",
          intent:
            "Engager l'équipe à maintenir le bon environnement de travail technique pour être efficace sur toute la boucle d'ingénierie, Build, Observe et Ship.",
          bullets: [
            "Build, Observe, Ship, la boucle complète d'ingénierie",
            "L'équipement et les accès pour être efficace au quotidien",
            "Une boucle de feedback locale quasi instantanée",
            "De la visibilité sur la production, des incidents traités avec méthode",
            "Le code mergé part en production sans friction ni attente",
          ],
          details: [
            {
              heading: "Build",
              items: [
                "L'équipe a l'équipement et les accès nécessaires au quotidien. Place fixe, écrans, wifi stable, accès aux postes client, VPN. Ère agentique, les développeurs ont accès aux meilleurs modèles.",
                "La boucle de feedback locale est quasi instantanée. Hot reload sous 150 ms, debug au point d'arrêt, lint et typage immédiats dans l'IDE. Ère agentique, un agent installe le projet, lance les tests et lit les erreurs seul.",
                "Le code reste lisible, cohérent et sans régression. Style uniforme, couverture de tests suffisante, tests fiables et rapides. Ère agentique, les standards de code alimentent les agents de revue.",
              ],
            },
            {
              heading: "Observe",
              items: [
                "L'équipe voit la production et enquête facilement. Logs exploitables, impact traçable, dashboards à jour. Ère agentique, logs et métriques accessibles aux agents via MCP ou une API dédiée.",
                "Les incidents sont détectés et traités avec méthode. Alertes configurées, pas de fatigue d'alerte, méthode de traitement définie. Ère agentique, des logs structurés et interrogeables permettent à un agent de poser un diagnostic.",
              ],
            },
            {
              heading: "Ship",
              items: [
                "Le code mergé arrive en production sans friction ni attente. CI/CD rapide, déploiement au moins hebdomadaire, rollback possible. Ère agentique, la CI accepte les contributions d'agents.",
                "Ce qui part en production a été testé dans un environnement proche de la production, avec des données fidèles au réel. Ère agentique, l'environnement de test est déclenchable par un agent, avec des données anonymisées.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "learning-organization",
      label: "Building a Learning Organization",
      color: "#8B5CF6",
      objectives: [
        "Faire du projet un lieu d'apprentissage structuré.",
        "Rendre visibles les problèmes, les contre-mesures et les points faibles à traiter.",
      ],
      standards: [
        {
          id: "dantotsu",
          boardTitle: "Dantotsu et résolution de problèmes",
          title: "Dantotsu and Problem Solving",
          intent:
            "Utiliser les petits problèmes du quotidien pour renforcer la connaissance de l'équipe sur les conditions qui permettent une meilleure qualité et un delivery plus rapide.",
          bullets: [
            "Partir des petits problèmes du quotidien",
            "Date et source, défaut, causes, contre-mesures, statut",
            "Une ligne par problème, tenue à jour",
            "Renforcer la connaissance de l'équipe, pas clore un ticket",
          ],
          details: [
            {
              heading: "Colonnes de la feuille",
              items: [
                "Date et source du problème.",
                "Défaut constaté.",
                "Causes identifiées.",
                "Contre-mesures décidées.",
                "Statut d'avancement.",
              ],
            },
          ],
        },
        {
          id: "weak-point-management",
          boardTitle: "Gestion des points faibles",
          title: "Weak Point Management",
          intent:
            "Détecter les points faibles récurrents issus de Defect Visualization, comprendre pourquoi les défauts persistent malgré les contre-mesures, et traiter les causes racines en répétant la question pourquoi, jusqu'à ce que le défaut ne réapparaisse plus.",
          bullets: [
            "Détecter les points faibles récurrents",
            "Partir des défauts rendus visibles",
            "Comprendre pourquoi ils persistent malgré les contre-mesures",
            "Remonter aux causes racines par des pourquoi répétés",
            "Jusqu'à ce que le défaut ne réapparaisse plus",
          ],
          details: [
            {
              heading: "Lien avec les autres standards",
              items: [
                "Entrée, les défauts chroniques rendus visibles par Defect Visualization.",
                "Sortie, des causes racines traitées et des apprentissages partagés avec l'équipe.",
              ],
            },
          ],
        },
      ],
    },
  ],

  /** Verso 1 */
  errors: [
    "L'équipe a réinventé le format et les standards visuels.",
    "Le board est posé par terre ou loin de la table de l'équipe.",
    "L'équipe a rempli les 8 feuilles séparément, sans vision d'ensemble.",
    "Il y a un doublon digital, ce qui empêche l'équipe d'utiliser pleinement le board.",
  ],

  /** Verso 2 */
  misconceptions: [
    {
      misconception: "Il faut le remplir pour faire du reporting au management",
      reframe: "Le management a d'autres outils pour le reporting, comme le kanban des promesses",
    },
    {
      misconception: "C'est un outil pour toute l'équipe",
      reframe:
        "Toute l'équipe est amenée à le remplir, mais c'est d'abord un outil pour le lead PM et le tech lead",
    },
    {
      misconception: "C'est un outil pour organiser le quotidien",
      reframe:
        "C'est un outil de prise de recul sur les problèmes qui pourraient nous empêcher de tenir la promesse",
    },
    {
      misconception: "C'est l'outil que j'utilise pour communiquer au client",
      reframe:
        "C'est un outil interne. Selon la maturité du client, on peut le partager, en sachant qu'il n'a pas vocation à suivre nos problèmes de fonctionnement",
    },
    {
      misconception: "Remplir le board, c'est fait pour être facile",
      reframe:
        "Remplir le board pose des questions difficiles à l'équipe, parce qu'il lui demande de regarder le projet avec 15 ans d'expérience supplémentaires",
    },
    {
      misconception: "C'est un outil qui permet aux managers de prendre des décisions sur le projet",
      reframe:
        "C'est un outil qui montre ce que le tech lead et le lead PM ont encore à apprendre pour décider de manière autonome",
    },
  ],

  /** Repères affichés dans le panneau d'accueil */
  goodBoard: [
    "Il n'est pas surchargé, il reste lisible et va droit au but.",
    "Il fait ressortir visuellement les 2 ou 3 problèmes principaux du projet.",
    "Il est vivant, l'équipe partage ses émotions dessus, un meme, un emoji, un dessin.",
  ],
};
