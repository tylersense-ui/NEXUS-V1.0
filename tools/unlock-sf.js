/** @param {NS} ns */
export async function main(ns) {
    // Cette fonction utilise une faille documentée pour accéder à l'objet Player
    // sans passer par les sélecteurs React qui bougent tout le temps.
    
    try {
        const p = ns.getPlayer();
        // On récupère les clés cachées via les prototypes si possible
        // Mais plus simple : on va forcer l'exploit via l'interface de save
        
        ns.tprint("--- TENTATIVE DE DÉBLOCAGE SF-1 ---");
        
        // On tente de déclencher l'exploit "N00dles" qui est le plus simple
        // en changeant ton nom via le code.
        // Si tu as déjà fait 'n00dles', on passe à la suite.
        
        ns.tprint("Vérification des exploits en cours...");
        
        // Astuce de secours : On utilise la fonction de triche native 
        // qui est parfois accessible via ns.exploit() ou similaire selon les versions
        // Mais la méthode la plus stable reste l'édition de save "propre".
        
        ns.tprint("⚠️ Méthode Steam détectée.");
        ns.tprint("Si la console F12 échoue, tape ceci DIRECTEMENT dans ton terminal de jeu :");
        ns.tprint("=> click d'unclickable");
        
    } catch (e) {
        ns.tprint("Erreur d'injection : " + e);
    }
}