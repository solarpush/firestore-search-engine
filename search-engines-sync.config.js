// @ts-check

// @ts-check

/**
 * Configuration synchrone - Version CommonJS compatible
 * Pas d'import ES modules, pas d'async, fonctionne avec require()
 *
 * @type {import('./src/ConfigTypes').SearchEnginesInputConfig}
 * En production: import('firestore-search-engine').SearchEnginesInputConfig
 */

// Export pour CommonJS et ES moduleseck

/**
 * Configuration synchrone - Version CommonJS compatible
 * Pas d'import ES modules, pas d'async, fonctionne avec require()
 *
 * @type {import('./src/ConfigTypes').SearchEnginesConfig}
 * En production: import('firestore-search-engine').SearchEnginesConfig
 */

// Export pour CommonJS et ES modules
const config = {
  globalConfig: {
    // Pas de dépendances Firebase ici - elles seront injectées
    functionPrefix: "search",
    defaultRegion: "europe-west3",
    defaultConfig: {
      wordMinLength: 3,
      wordMaxLength: 50,
      distanceThreshold: 0.2,
    },

    // Configuration de l'API de recherche
    searchApi: {
      enabled: true,
      basePath: "/search",
      instanceParam: "type",
      region: "europe-west3",
      allowedInstances: ["residence"],

      // Callback d'authentification personnalisé
      authCallback: async (auth) => {
        // Logique d'authentification simple
        console.log(
          "🔐 Auth check:",
          auth?.uid ? "✅ Connecté" : "❌ Non connecté"
        );
        return !!auth?.uid;
      },

      // Configuration Express avec middlewares
      express: {
        // Middleware de logging
        loggingMiddleware: (req, res, next) => {
          console.log(
            `📝 ${req.method} ${req.path} - ${new Date().toISOString()}`
          );
          next();
        },

        // CORS simple
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

        // Middleware de validation personnalisé
        validationMiddleware: (req, res, next) => {
          // Validation basique des paramètres
          const method = req.method;
          const hasSearchValue =
            method === "GET"
              ? req.query?.searchValue || req.query?.query
              : req.body?.searchValue || req.body?.query;

          if (!hasSearchValue) {
            console.log("⚠️ Paramètre de recherche manquant");
          }

          next();
        },

        // Middlewares personnalisés supplémentaires
        middlewares: [
          // Middleware de rate limiting basique
          (req, res, next) => {
            // Simulation d'un rate limiter simple
            console.log("🚥 Rate limit check passed");
            next();
          },

          // Middleware de sécurité
          async (req, res, next) => {
            // Vérifications de sécurité
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            next();
          },
        ],

        // Routes personnalisées
        customRoutes: {
          "/health": (req, res) => {
            res.json({
              status: "healthy",
              timestamp: new Date().toISOString(),
              service: "search-residences",
            });
          },

          "/info": (req, res) => {
            res.json({
              endpoint: "/search?type=residence&searchValue=<query>",
              instances: ["residence"],
              parameters: {
                type: "Instance (residence)",
                searchValue: "Texte à rechercher",
                limit: "Nombre de résultats (défaut: 10)",
              },
              middlewares: [
                "cors",
                "logging",
                "validation",
                "rateLimit",
                "security",
              ],
            });
          },
        },
      },

      // Réponses d'erreur
      errorResponses: {
        badRequest: { status: 400, message: "Requête invalide" },
        unauthorized: { status: 401, message: "Authentification requise" },
        notFound: { status: 404, message: "Instance non trouvée" },
        serverError: { status: 500, message: "Erreur serveur" },
      },
    },
  },

  searchEngines: {
    residence: {
      collection: "residences_search_index",
      wordMaxLength: 200,
      documentConfig: {
        indexedKey: "name",
        returnedKeys: [
          "address",
          "city",
          "postalCode",
          "price",
          "bedrooms",
          "bathrooms",
          "surface",
          "description",
        ],
        documentsPath: "residences/{residenceId}",
      },
      endpoints: {
        search: {
          enabled: true,
          path: "/residences/search",
          // Pas d'auth requise pour la recherche de résidences
          authCallback: async () => true,
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
      },
      eventHandlerOptions: {
        region: "europe-west3",
        memory: "512MiB",
      },
    },
  },
};

// Export compatible CommonJS et ES modules
module.exports = config;
module.exports.default = config;
