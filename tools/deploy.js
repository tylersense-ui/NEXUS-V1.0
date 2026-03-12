/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.11.1 - Deploy Tool (FIX COMMENTAIRES)           ║
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
    ns.print('║   🚀 NEXUS DEPLOYMENT SYSTEM v0.11.1                      ║');
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
        
        // ✅ FIX v0.11.1 : SKIP lignes vides ET lignes commentaires (#)
        files = manifestContent.split('\n')
            .map(line => line.trim())                    // Trim whitespace
            .filter(line => line.length > 0)             // Skip lignes vides
            .filter(line => !line.startsWith('#'));      // Skip commentaires
        
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
    } else {
        ns.print('');
        ns.print(`⚠️  ${failed} fichier(s) ont échoué`);
    }
}

function getFallbackFiles() {
    return [
        '/boot.js',
        '/core/orchestrator.js',
        '/core/batcher.js',
        '/core/port-handler.js',
        '/core/ram-manager.js',
        '/core/dashboard.js',
        '/hack/controller.js',
        '/lib/constants.js',
        '/lib/logger.js',
        '/lib/network.js',
        '/lib/capabilities.js',
        '/lib/utils.js',
        '/lib/formulas-helper.js',
        '/lib/state-manager.js',
        '/workers/hack.js',
        '/workers/grow.js',
        '/workers/weaken.js',
        '/managers/server-manager.js',
        '/managers/stock-manager.js',
        '/tools/deploy.js',
        '/tools/global-kill.js',
        '/tools/network-audit.js',
        '/tools/liquidate.js',
        '/tools/target-analyzer.js',
        '/tools/aug-speedrun.js',
        '/tools/aug-planner.js',
        '/tools/version-checker.js',
        '/tools/log-action.js',
        '/tools/telemetry-daemon.js'
    ];
}
