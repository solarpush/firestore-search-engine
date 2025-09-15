import type { SearchEngineInstanceConfig } from "./CloudFunctionsManager";

/**
 * Utilitaire de debug pour les configurations
 */
export class ConfigDebugger {
  /**
   * Valide et affiche des informations de debug sur la configuration
   */
  static debugConfig(
    instancesConfig: any,
    context: string = "Configuration"
  ): SearchEngineInstanceConfig[] {
    console.log(`🔍 Debug ${context}:`);
    console.log(`  - Type: ${typeof instancesConfig}`);
    console.log(`  - Est un tableau: ${Array.isArray(instancesConfig)}`);
    console.log(`  - Valeur: ${JSON.stringify(instancesConfig, null, 2)}`);

    if (!instancesConfig) {
      throw new Error(`${context}: Configuration manquante`);
    }

    if (!Array.isArray(instancesConfig)) {
      console.error(`❌ ${context}: instancesConfig n'est pas un tableau`);
      console.error(`   Type reçu: ${typeof instancesConfig}`);
      console.error(`   Valeur: ${JSON.stringify(instancesConfig)}`);

      // Tentative de récupération si c'est un objet avec la bonne structure
      if (instancesConfig && typeof instancesConfig === "object") {
        // Si c'est probablement le résultat d'un loadConfig
        if (
          instancesConfig.instancesConfig &&
          Array.isArray(instancesConfig.instancesConfig)
        ) {
          console.warn(
            `⚠️ ${context}: Récupération automatique de instancesConfig`
          );
          return instancesConfig.instancesConfig;
        }

        // Si c'est directement searchEngines
        if (instancesConfig.searchEngines) {
          console.warn(
            `⚠️ ${context}: Conversion de searchEngines en instancesConfig`
          );
          return Object.entries(instancesConfig.searchEngines).map(
            ([instanceId, config]: [string, any]) => ({
              instanceId,
              ...config,
            })
          );
        }
      }

      throw new Error(
        `${context}: instancesConfig doit être un tableau. ` +
          `Reçu: ${typeof instancesConfig}. ` +
          `Utilisez loadConfigFromTS() ou passez directement un tableau d'instances.`
      );
    }

    if (instancesConfig.length === 0) {
      console.warn(`⚠️ ${context}: Tableau vide`);
      return instancesConfig;
    }

    // Validation de chaque instance
    instancesConfig.forEach((instance: any, index: number) => {
      if (!instance || typeof instance !== "object") {
        throw new Error(
          `${context}: Instance ${index} invalide: ${JSON.stringify(instance)}`
        );
      }

      if (!instance.instanceId) {
        throw new Error(
          `${context}: Instance ${index} manque instanceId: ${JSON.stringify(
            instance
          )}`
        );
      }

      if (!instance.collection) {
        throw new Error(
          `${context}: Instance "${instance.instanceId}" manque collection`
        );
      }

      console.log(
        `  ✅ Instance ${index}: ${instance.instanceId} (${instance.collection})`
      );
    });

    console.log(
      `✅ ${context}: ${instancesConfig.length} instance(s) valide(s)`
    );
    return instancesConfig;
  }

  /**
   * Aide à identifier le problème dans le chargement de configuration
   */
  static debugConfigLoading(configResult: any): {
    globalConfig: any;
    instancesConfig: SearchEngineInstanceConfig[];
  } {
    console.log("🔍 Debug chargement de configuration:");
    console.log(`  - Type: ${typeof configResult}`);
    console.log(`  - Keys: ${Object.keys(configResult || {})}`);

    if (!configResult) {
      throw new Error("Résultat de configuration manquant");
    }

    if (typeof configResult !== "object") {
      throw new Error(`Configuration invalide: ${typeof configResult}`);
    }

    const { globalConfig, instancesConfig } = configResult;

    if (!globalConfig) {
      throw new Error("globalConfig manquant dans le résultat");
    }

    const validatedInstancesConfig = this.debugConfig(
      instancesConfig,
      "instancesConfig"
    );

    return {
      globalConfig,
      instancesConfig: validatedInstancesConfig,
    };
  }

  /**
   * Wrapper sécurisé pour generateFunctions
   */
  static safeGenerateFunctions(
    manager: any,
    instancesConfig: any,
    context: string = "generateFunctions"
  ) {
    try {
      const validatedConfig = this.debugConfig(instancesConfig, context);
      return manager.generateFunctions(validatedConfig);
    } catch (error) {
      console.error(`❌ Erreur dans ${context}:`, error);
      console.error("💡 Suggestions:");
      console.error(
        "   1. Vérifiez que vous passez bien un tableau d'instances"
      );
      console.error(
        "   2. Utilisez loadConfigFromTS() pour charger depuis un fichier"
      );
      console.error("   3. Vérifiez la structure de votre configuration");
      throw error;
    }
  }

  /**
   * Wrapper sécurisé pour generateAutoExports
   */
  static safeGenerateAutoExports(
    manager: any,
    instancesConfig: any,
    context: string = "generateAutoExports"
  ) {
    try {
      const validatedConfig = this.debugConfig(instancesConfig, context);
      return manager.generateAutoExports(validatedConfig);
    } catch (error) {
      console.error(`❌ Erreur dans ${context}:`, error);
      throw error;
    }
  }
}
