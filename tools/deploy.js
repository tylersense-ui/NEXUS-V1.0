/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    // CONFIGURATION - MODIFIE CETTE URL AVEC TON REPO
    const GITHUB_USER = 'tylersense-ui';  // ok
    const GITHUB_REPO = 'NEXUS-V1.0';  // ok
    const GITHUB_BRANCH = 'main';
    
    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
    
    ns.print('=== NEXUS DEPLOYMENT SYSTEM ===');
    ns.print(`Source: ${GITHUB_USER}/${GITHUB_REPO}`);
    ns.print('');
    
    // Liste de tous les fichiers à déployer
    const files = [
        '/core/bootstrap.js',
        '/lib/scanner.js',
        '/lib/utils.js',
        '/hack/basic-hack.js',
        '/managers/target-manager.js',
        '/monitor/status.js',
        '/tools/deploy.js'
    ];
    
    let success = 0;
    let failed = 0;
    
    for (const file of files) {
        try {
            const url = baseUrl + file;
            ns.print(`[DOWNLOAD] ${file}...`);
            
            const result = await ns.wget(url, file);
            
            if (result) {
                ns.print(`  ✓ OK`);
                success++;
            } else {
                ns.print(`  ✗ FAILED`);
                failed++;
            }
            
            await ns.sleep(100);
        } catch (e) {
            ns.print(`  ✗ ERROR: ${e}`);
            failed++;
        }
    }
    
    ns.print('');
    ns.print('═══════════════════════════════');
    ns.print(`✓ Succès: ${success}`);
    ns.print(`✗ Échecs: ${failed}`);
    ns.print('═══════════════════════════════');
    
    if (failed === 0) {
        ns.print('');
        ns.print('🚀 DÉPLOIEMENT RÉUSSI !');
        ns.print('');
        ns.print('Pour démarrer NEXUS :');
        ns.print('  run /core/bootstrap.js');
    } else {
        ns.print('');
        ns.print('⚠️  Certains fichiers ont échoué');
        ns.print('Vérifie que le repo GitHub est PUBLIC');
    }
}