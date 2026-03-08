/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    // CONFIGURATION
    const GITHUB_USER = 'tylersense-ui';
    const GITHUB_REPO = 'NEXUS-V1.0';
    const GITHUB_BRANCH = 'main';
    
    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
    
    ns.print('=== NEXUS DEPLOYMENT SYSTEM v2 ===');
    ns.print(`Source: ${GITHUB_USER}/${GITHUB_REPO}`);
    ns.print('');
    
    // Télécharger le manifest en premier
    ns.print('[INIT] Téléchargement du manifest...');
    const manifestUrl = baseUrl + '/manifest.txt';
    const manifestDownloaded = await ns.wget(manifestUrl, '/tmp/manifest.txt');
    
    let files = [];
    
    if (manifestDownloaded) {
        ns.print('  ✓ Manifest téléchargé');
        const manifestContent = ns.read('/tmp/manifest.txt');
        files = manifestContent.split('\n').filter(line => line.trim().length > 0);
        ns.print(`  → ${files.length} fichiers à déployer`);
    } else {
        ns.print('  ✗ Manifest introuvable, utilisation de la liste par défaut');
        // Fallback sur liste hardcodée
        files = [
            '/core/bootstrap.js',
            '/lib/scanner.js',
            '/lib/utils.js',
            '/hack/basic-hack.js',
            '/managers/target-manager.js',
            '/managers/server-manager.js',
            '/monitor/status.js',
            '/monitor/status-lite.js',
            '/tools/deploy.js',
            '/tools/casino.js'
        ];
    }
    
    ns.print('');
    
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
    ns.print(`✓ Succès: ${success}/${files.length}`);
    ns.print(`✗ Échecs: ${failed}`);
    ns.print('═══════════════════════════════');
    
    if (failed === 0) {
        ns.print('');
        ns.print('🚀 DÉPLOIEMENT RÉUSSI !');
        ns.print('');
        ns.print('Commandes disponibles :');
        ns.print('  run /tools/casino.js 200000');
        ns.print('  run /managers/server-manager.js');
        ns.print('  run /monitor/status-lite.js');
    } else {
        ns.print('');
        ns.print(`⚠️  ${failed} fichier(s) ont échoué`);
    }
}