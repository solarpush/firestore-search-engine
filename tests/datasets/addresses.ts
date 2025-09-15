export const addresses = [
  // adresses exactement identiques
  {
    a: "123 Rue de la Paix, 75001 Paris",
    b: "123 Rue de la Paix, 75001 Paris",
    score: 5,
  },
  {
    a: "45 Avenue des Champs-Élysées, 75008 Paris",
    b: "45 Avenue des Champs-Élysées, 75008 Paris",
    score: 5,
  },
  {
    a: "10 Place de la République, 69001 Lyon",
    b: "10 Place de la République, 69001 Lyon",
    score: 5,
  },
  {
    a: "78 Boulevard Saint-Germain, 75005 Paris",
    b: "78 Boulevard Saint-Germain, 75005 Paris",
    score: 5,
  },
  {
    a: "156 Rue du Faubourg Saint-Honoré, 75008 Paris",
    b: "156 Rue du Faubourg Saint-Honoré, 75008 Paris",
    score: 5,
  },

  // variations d'écriture des types de voies
  { a: "123 Rue de la Paix", b: "123 R. de la Paix", score: 4 },
  { a: "45 Avenue Victor Hugo", b: "45 Av. Victor Hugo", score: 4 },
  { a: "10 Boulevard Haussmann", b: "10 Bd Haussmann", score: 4 },
  { a: "78 Place de la Bastille", b: "78 Pl. de la Bastille", score: 4 },
  { a: "156 Impasse des Lilas", b: "156 Imp. des Lilas", score: 4 },
  { a: "89 Allée des Roses", b: "89 All. des Roses", score: 4 },

  // fautes de frappe mineures
  { a: "123 Rue de la Paix", b: "123 Rue de la Paxi", score: 4 },
  { a: "45 Avenue des Champs", b: "45 Avenue des Chamsp", score: 4 },
  { a: "10 Place République", b: "10 Place Republique", score: 4 },
  { a: "78 Boulevard Voltaire", b: "78 Boulevard Voltare", score: 4 },
  { a: "156 Rue Montmartre", b: "156 Rue Montmatre", score: 4 },

  // différences de formatage
  { a: "123, Rue de la Paix", b: "123 Rue de la Paix", score: 4 },
  {
    a: "45 avenue des Champs-Élysées",
    b: "45 Avenue des Champs-Élysées",
    score: 4,
  },
  { a: "10 PLACE DE LA RÉPUBLIQUE", b: "10 Place de la République", score: 4 },
  { a: "78 Bd Saint-Germain", b: "78 Boulevard Saint-Germain", score: 4 },

  // avec/sans code postal et ville
  { a: "123 Rue de la Paix", b: "123 Rue de la Paix, 75001 Paris", score: 3 },
  {
    a: "45 Avenue Victor Hugo",
    b: "45 Avenue Victor Hugo, 75016 Paris",
    score: 3,
  },
  {
    a: "10 Place de la République",
    b: "10 Place de la République, Lyon",
    score: 3,
  },
  { a: "78 Boulevard Voltaire", b: "78 Boulevard Voltaire, 75011", score: 3 },

  // même rue, numéro différent
  { a: "123 Rue de la Paix", b: "125 Rue de la Paix", score: 3 },
  { a: "45 Avenue Victor Hugo", b: "47 Avenue Victor Hugo", score: 3 },
  { a: "10 Place de la République", b: "12 Place de la République", score: 3 },
  { a: "78 Boulevard Voltaire", b: "80 Boulevard Voltaire", score: 3 },
  { a: "156 Rue Montmartre", b: "158 Rue Montmartre", score: 3 },

  // même ville, rue différente
  {
    a: "123 Rue de la Paix, Paris",
    b: "45 Avenue Victor Hugo, Paris",
    score: 2,
  },
  {
    a: "10 Place de la République, Lyon",
    b: "78 Rue de la Part-Dieu, Lyon",
    score: 2,
  },
  {
    a: "89 Boulevard Canebière, Marseille",
    b: "156 Rue Saint-Ferréol, Marseille",
    score: 2,
  },
  {
    a: "234 Avenue Jean Médecin, Nice",
    b: "67 Promenade des Anglais, Nice",
    score: 2,
  },

  // villes similaires
  {
    a: "123 Rue de la Paix, Paris",
    b: "123 Rue de la Paix, Paray-le-Monial",
    score: 2,
  },
  {
    a: "45 Avenue Victor Hugo, Lyon",
    b: "45 Avenue Victor Hugo, Lyons-la-Forêt",
    score: 2,
  },
  {
    a: "10 Place République, Marseille",
    b: "10 Place République, Marseillan",
    score: 2,
  },

  // noms de rues partiellement similaires
  { a: "123 Rue de la Liberté", b: "123 Rue de la Paix", score: 2 },
  { a: "45 Avenue Jean Jaurès", b: "45 Avenue Jean Moulin", score: 2 },
  { a: "10 Place Victor Hugo", b: "10 Place Victor Emmanuel", score: 2 },
  { a: "78 Boulevard Saint-Michel", b: "78 Boulevard Saint-Germain", score: 2 },

  // erreurs de numéro importantes
  { a: "123 Rue de la Paix", b: "823 Rue de la Paix", score: 2 },
  { a: "45 Avenue Victor Hugo", b: "545 Avenue Victor Hugo", score: 2 },
  { a: "10 Place de la République", b: "110 Place de la République", score: 2 },

  // adresses avec appartements/étages
  { a: "123 Rue de la Paix", b: "123 Rue de la Paix, Apt 4B", score: 3 },
  {
    a: "45 Avenue Victor Hugo, 3ème étage",
    b: "45 Avenue Victor Hugo",
    score: 3,
  },
  {
    a: "10 Place République, Bât A",
    b: "10 Place République, Bât B",
    score: 3,
  },

  // inversions dans l'ordre
  { a: "Paris, 123 Rue de la Paix", b: "123 Rue de la Paix, Paris", score: 4 },
  {
    a: "75001, 45 Avenue Victor Hugo",
    b: "45 Avenue Victor Hugo, 75001",
    score: 4,
  },
  { a: "Lyon, 10 Place République", b: "10 Place République, Lyon", score: 4 },

  // adresses complètement différentes - même ville
  {
    a: "123 Rue de la Paix, Paris",
    b: "789 Boulevard Montparnasse, Paris",
    score: 1,
  },
  { a: "45 Avenue Victor Hugo, Lyon", b: "234 Rue Garibaldi, Lyon", score: 1 },
  {
    a: "10 Place République, Marseille",
    b: "567 Avenue du Prado, Marseille",
    score: 1,
  },

  // adresses totalement différentes
  { a: "123 Rue de la Paix, Paris", b: "456 Main Street, New York", score: 0 },
  {
    a: "45 Avenue Victor Hugo, Lyon",
    b: "789 Oxford Street, London",
    score: 0,
  },
  {
    a: "10 Place République, Marseille",
    b: "321 Unter den Linden, Berlin",
    score: 0,
  },
  { a: "78 Boulevard Voltaire, Paris", b: "654 Via del Corso, Rome", score: 0 },
  { a: "156 Rue Montmartre, Paris", b: "987 La Rambla, Barcelona", score: 0 },
  { a: "234 Avenue Jean Médecin, Nice", b: "135 Red Square, Moscow", score: 0 },
  {
    a: "89 Boulevard Canebière, Marseille",
    b: "246 Times Square, New York",
    score: 0,
  },
  {
    a: "67 Promenade des Anglais, Nice",
    b: "579 Shibuya Crossing, Tokyo",
    score: 0,
  },

  // codes postaux incorrects
  {
    a: "123 Rue de la Paix, 75001 Paris",
    b: "123 Rue de la Paix, 75002 Paris",
    score: 3,
  },
  {
    a: "45 Avenue Victor Hugo, 69001 Lyon",
    b: "45 Avenue Victor Hugo, 69002 Lyon",
    score: 3,
  },
  {
    a: "10 Place République, 13001 Marseille",
    b: "10 Place République, 13002 Marseille",
    score: 3,
  },

  // variations internationales
  { a: "123 Rue de la Paix", b: "123 Peace Street", score: 1 },
  { a: "45 Avenue Victor Hugo", b: "45 Victor Hugo Avenue", score: 2 },
  { a: "10 Place de la République", b: "10 Republic Square", score: 1 },

  // abréviations et acronymes
  {
    a: "123 Rue du Général de Gaulle",
    b: "123 Rue du Gal de Gaulle",
    score: 4,
  },
  { a: "45 Avenue du Président Kennedy", b: "45 Av. du Pdt Kennedy", score: 4 },
  { a: "10 Place Saint-Étienne", b: "10 Place St-Étienne", score: 4 },
  { a: "78 Boulevard Maréchal Foch", b: "78 Bd Mal Foch", score: 4 },

  // numéros bis, ter, quater
  { a: "123 Rue de la Paix", b: "123 bis Rue de la Paix", score: 3 },
  { a: "45 Avenue Victor Hugo", b: "45 ter Avenue Victor Hugo", score: 3 },
  { a: "10 Place République", b: "10 quater Place République", score: 3 },

  // erreurs de transcription courantes
  { a: "123 Rue des Martyrs", b: "123 Rue des Martirs", score: 4 },
  { a: "45 Avenue Kléber", b: "45 Avenue Kleber", score: 4 },
  { a: "10 Place Château d'Eau", b: "10 Place Chateau d'Eau", score: 4 },
  { a: "78 Rue François Ier", b: "78 Rue Francois 1er", score: 4 },

  // adresses avec arrondissements
  {
    a: "123 Rue de la Paix, 1er arrondissement",
    b: "123 Rue de la Paix, 75001",
    score: 4,
  },
  {
    a: "45 Avenue Victor Hugo, 16ème",
    b: "45 Avenue Victor Hugo, 75016",
    score: 4,
  },
  { a: "10 Place République, 3e", b: "10 Place République, 75003", score: 4 },
];
