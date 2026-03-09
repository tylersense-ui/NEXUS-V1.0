/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Deploy Tool                       ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const GITHUB_USER = 'tylersense-ui';
    const GITHUB_REPO = 'NEXUS-V1.0';
    const GITHUB_BRANCH = 'main';
    
    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🚀 NEXUS DEPLOYMENT SYSTEM v0.5-PROMETHEUS              ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print(`Source: ${GITHUB_USER}/${GITHUB_REPO}`);
    ns.print('');
    
    ns.print('[INIT] Téléchargement du manifest...');
    const manifestUrl = baseUrl + '/manifest.txt';
    const manifestDownloaded = await ns.wget(manifestUrl, '/tmp/manifest.txt');
    
    let files = [];
    
    if (manifestDownloaded) {
        ns.print('  ✓ Manifest téléchargé');
        const manifestContent = ns.read('/tmp/manifest.txt');
        files = manifestContent.split('\n').filter(line => line.trim().length > 0);
        
        if (files.length === 0) {
            ns.print('  ⚠️  Manifest vide, utilisation du fallback');
            files = getFallbackFiles();
        } else {
            ns.print(`  → ${files.length} fichiers détectés`);
        }
    } else {
        ns.print('  ✗ Manifest introuvable, utilisation du fallback');
        files = getFallbackFiles();
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
    ns.print('═══════════════════════════════════════════════════════════');
    ns.print(`✓ Succès: ${success}/${files.length}`);
    ns.print(`✗ Échecs: ${failed}`);
    ns.print('═══════════════════════════════════════════════════════════');
    
    if (failed === 0) {
        ns.print('');
        ns.print('🚀 DÉPLOIEMENT RÉUSSI !');
        ns.print('');
        ns.print('Commandes disponibles:');
        ns.print('  run /boot.js                    (démarrage système)');
        ns.print('  run /core/dashboard.js          (dashboard visuel)');
        ns.print('  run /managers/server-manager.js (achat + upgrade serveurs)');
        ns.print('  run /tools/global-kill.js       (arrêt total)');
    } else {
        ns.print('');
        ns.print(`⚠️  ${failed} fichier(s) ont échoué`);
    }
}

function getFallbackFiles() {
    return [
        '/boot.js',
        '/core/orchestrator.js',
        '/core/dashboard.js',
        '/core/port-handler.js',
        '/core/ram-manager.js',
        '/core/batcher.js',
        '/hack/controller.js',
        '/lib/constants.js',
        '/lib/logger.js',
        '/lib/capabilities.js',
        '/lib/network.js',
        '/lib/utils.js',
        '/workers/hack.js',
        '/workers/grow.js',
        '/workers/weaken.js',
        '/managers/server-manager.js',
        '/tools/cleanup.js',
        '/tools/deploy.js',
        '/tools/global-kill.js'
    ];
}