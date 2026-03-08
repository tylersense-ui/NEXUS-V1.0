/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Cleanup Tool                      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/cleanup.js
 * @version     0.5.0
 * @description Nettoie home des anciens fichiers NEXUS v0.1-0.4
 * 
 * @usage
 * run /tools/cleanup.js
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Cleanup Tool                                        ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Liste des anciens fichiers à supprimer (v0.1-0.4)
    const oldFiles = [
        // Core old
        '/core/bootstrap.js',
        '/core/version.js',
        '/core/hwgw-controller.js',
        '/core/controller-pool.js',
        '/core/target-selector.js',
        
        // Lib old
        '/lib/scanner.js',
        '/lib/formulas.js',
        
        // Hack old
        '/hack/basic-hack.js',
        '/hack/xp-grind.js',
        
        // Managers old
        '/managers/target-manager.js',
        '/managers/deploy-manager.js',
        
        // Monitor old
        '/monitor/status.js',
        '/monitor/status-lite.js',
        
        // Tools old
        '/tools/rooter.js',
        '/tools/casino.js',
        
        // Workers old
        '/workers/hwgw.js',
        
        // Kernel old
        '/kernel/orchestrator.js',
        
        // States old
        '/state/world-state.txt',
        '/state/strategy-state.txt',
        '/state/progress-state.txt',
        '/state/telemetry-state.txt'
    ];
    
    let deleted = 0;
    let notFound = 0;
    
    ns.print('[SCAN] Recherche des anciens fichiers...');
    ns.print('');
    
    for (const file of oldFiles) {
        if (ns.fileExists(file, 'home')) {
            try {
                ns.rm(file, 'home');
                ns.print(`✓ Supprimé: ${file}`);
                deleted++;
            } catch (e) {
                ns.print(`✗ Erreur: ${file} - ${e}`);
            }
        } else {
            notFound++;
        }
    }
    
    ns.print('');
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print(`✓ Fichiers supprimés: ${deleted}`);
    ns.print(`  Déjà absents: ${notFound}`);
    ns.print(`  Total: ${oldFiles.length} fichiers vérifiés`);
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print('');
    ns.print('✅ Nettoyage terminé !');
    ns.print('');
    ns.print('Prochaine étape : run /boot.js');
}