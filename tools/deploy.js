/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: GitHub Deployment                                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/deploy.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Déploie automatiquement tous les fichiers depuis GitHub.
 * Lit le manifest.txt pour obtenir la liste des fichiers.
 * Fallback sur liste hardcodée si manifest introuvable.
 * 
 * @usage
 * run /tools/deploy.js
 * 
 * @ram
 * 2.20GB
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
    ns.print('║ NEXUS Deployment System v0.2                               ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print(`Source: ${GITHUB_USER}/${GITHUB_REPO}`);
    ns.print('');
    
    // Télécharger le manifest
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
        ns.print('Commandes disponibles :');
        ns.print('  run /core/version.js           (infos version)');
        ns.print('  run /core/bootstrap.js         (init framework)');
        ns.print('  run /tools/rooter.js           (rooter serveurs)');
        ns.print('  run /hack/xp-grind.js          (farmer XP)');
        ns.print('  run /managers/server-manager.js');
        ns.print('  run /managers/deploy-manager.js');
        ns.print('  run /monitor/status-lite.js');
    } else {
        ns.print('');
        ns.print(`⚠️  ${failed} fichier(s) ont échoué`);
    }
}

function getFallbackFiles() {
    return [
        '/core/bootstrap.js',
        '/core/version.js',
        '/lib/scanner.js',
        '/lib/utils.js',
        '/hack/basic-hack.js',
        '/hack/xp-grind.js',
        '/managers/target-manager.js',
        '/managers/server-manager.js',
        '/managers/deploy-manager.js',
        '/monitor/status.js',
        '/monitor/status-lite.js',
        '/tools/deploy.js',
        '/tools/rooter.js'
    ];
}