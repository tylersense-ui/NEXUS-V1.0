/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Cleanup Tool                      ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Cleanup Tool                                        ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const oldFiles = [
        '/workers/hwgw.js',
        '/core/bootstrap.js',
        '/core/version.js',
        '/core/hwgw-controller.js',
        '/core/controller-pool.js',
        '/core/target-selector.js',
        '/lib/scanner.js',
        '/lib/formulas.js',
        '/hack/basic-hack.js',
        '/hack/xp-grind.js',
        '/managers/target-manager.js',
        '/managers/deploy-manager.js',
        '/monitor/status.js',
        '/monitor/status-lite.js',
        '/tools/rooter.js',
        '/tools/casino.js',
        '/kernel/orchestrator.js'
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
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print('');
    ns.print('✅ Nettoyage terminé !');
}