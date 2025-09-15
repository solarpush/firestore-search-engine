// @ts-check
/**
 * Exemple de configuration multi-champs avec vectorisation en batch
 * @type {import('./src/ConfigTypes').SearchEnginesInputConfig}
 */

const config = {
  globalConfig: {
    functionPrefix: "search",
    defaultRegion: "europe-west3",
    defaultConfig: {
      wordMinLength: 3,
      wordMaxLength: 50,
      distanceThreshold: 0.2,
    },

    searchApi: {
      enabled: true,
      basePath: "/search",
      instanceParam: "type",
      region: "europe-west3",
      allowedInstances: ["residence", "user"],

      authCallback: async (auth) => {
        console.log(
          "🔐 Auth check:",
          auth?.uid ? "✅ Connecté" : "❌ Non connecté"
        );
        return !!auth?.uid;
      },

      express: {
        loggingMiddleware: (req, res, next) => {
          console.log(
            `📝 ${req.method} ${req.path} - ${new Date().toISOString()}`
          );
          next();
        },

        corsMiddleware: (req, res, next) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
          );
          if (req.method === "OPTIONS") {
            res.status(200).end();
            return;
          }
          next();
        },

        customRoutes: {
          "/health": (req, res) => {
            res.json({
              status: "healthy",
              timestamp: new Date().toISOString(),
              service: "multi-field-search",
            });
          },
          "/fields": (req, res) => {
            res.json({
              residence: {
                searchableFields: ["name", "description", "address"],
                vectorFields: [
                  "_vector_name",
                  "_vector_description",
                  "_vector_address",
                ],
              },
              user: {
                searchableFields: ["name", "bio", "skills"],
                vectorFields: ["_vector_name", "_vector_bio", "_vector_skills"],
              },
            });
          },
        },
      },

      errorResponses: {
        badRequest: { status: 400, message: "Requête invalide" },
        unauthorized: { status: 401, message: "Authentification requise" },
        notFound: { status: 404, message: "Instance non trouvée" },
        serverError: { status: 500, message: "Erreur serveur" },
      },
    },
  },

  searchEngines: {
    // Exemple avec indexation multi-champs pour les résidences
    residence: {
      collection: "residences_search_index",
      wordMaxLength: 200,

      // Configuration pour l'indexation multi-champs
      documentConfig: {
        // Indexer plusieurs champs avec des poids différents
        indexedKeys: {
          name: { weight: 2.0, fuzzySearch: true }, // Titre principal, poids élevé
          description: { weight: 1.0, fuzzySearch: true }, // Description
          address: { weight: 1.5, fuzzySearch: false }, // Adresse, pas de fuzzy
          amenities: { weight: 0.8, fuzzySearch: true }, // Équipements, poids faible
        },

        returnedKeys: [
          "name",
          "description",
          "address",
          "amenities",
          "city",
          "postalCode",
          "price",
          "bedrooms",
          "bathrooms",
          "surface",
          "imageUrl",
        ],
        documentsPath: "residences/{residenceId}",

        // Configuration pour le stockage des vecteurs
        vectorStorage: {
          prefix: "_vector_", // Préfixe pour les champs vectorisés
          batchSize: 10, // Nombre de documents à vectoriser en batch
          fields: ["name", "description", "address", "amenities"],
        },
      },

      endpoints: {
        search: {
          enabled: true,
          path: "/residences/search",
          authCallback: async () => true,

          // Support pour la recherche multi-champs
          searchConfig: {
            defaultFields: ["name", "description"], // Champs par défaut
            allowedFields: ["name", "description", "address", "amenities"],
            fieldWeights: {
              name: 2.0,
              description: 1.0,
              address: 1.5,
              amenities: 0.8,
            },
          },
        },
        callable: {
          enabled: true,
          authCallback: async () => true,
        },
      },

      triggers: {
        onCreate: true,
        onUpdate: true,
        onDelete: true,
        documentsPath: "residences/{residenceId}",

        // Configuration pour la re-vectorisation automatique
        reindexConfig: {
          autoReindex: true,
          batchReindex: true,
          fieldsToWatch: ["name", "description", "address", "amenities"],
        },
      },

      eventHandlerOptions: {
        region: "europe-west3",
        memory: "1GiB", // Plus de mémoire pour le batch processing
      },
    },

    // Exemple pour les utilisateurs avec recherche de profils
    user: {
      collection: "users_search_index",
      wordMaxLength: 150,

      documentConfig: {
        indexedKeys: {
          name: { weight: 2.0, fuzzySearch: true },
          bio: { weight: 1.0, fuzzySearch: true },
          skills: { weight: 1.5, fuzzySearch: false }, // Skills exactes
          location: { weight: 0.8, fuzzySearch: false },
        },

        returnedKeys: [
          "name",
          "bio",
          "skills",
          "location",
          "profileImage",
          "experience",
          "rating",
        ],
        documentsPath: "users/{userId}",

        vectorStorage: {
          prefix: "_vector_",
          batchSize: 15,
          fields: ["name", "bio", "skills", "location"],
        },
      },

      endpoints: {
        search: {
          enabled: true,
          path: "/users/search",
          authCallback: async () => true,

          searchConfig: {
            defaultFields: ["name", "skills"],
            allowedFields: ["name", "bio", "skills", "location"],
            fieldWeights: {
              name: 2.0,
              bio: 1.0,
              skills: 1.5,
              location: 0.8,
            },
          },
        },
        callable: {
          enabled: true,
          authCallback: async () => true,
        },
      },

      triggers: {
        onCreate: true,
        onUpdate: true,
        onDelete: true,
        documentsPath: "users/{userId}",

        reindexConfig: {
          autoReindex: true,
          batchReindex: true,
          fieldsToWatch: ["name", "bio", "skills", "location"],
        },
      },

      eventHandlerOptions: {
        region: "europe-west3",
        memory: "1GiB",
      },
    },
  },
};

// Export compatible CommonJS et ES modules
module.exports = config;
module.exports.default = config;
