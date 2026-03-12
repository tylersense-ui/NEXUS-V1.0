/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS - Version Checker v1.1 (PATHS CORRIGÉS)             ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/version-checker.js
 * @version     1.1.0
 * @description Vérifier versions de tous les fichiers NEXUS
 * 
 * CHANGEMENTS v1.1 :
 * - ✅ CORRIGÉ : controller.js → /hack/controller.js (pas /core)
 * - ✅ CORRIGÉ : port-handler.js → /core/ (pas /lib)
 * - ✅ CORRIGÉ : ram-manager.js → /core/ (pas /lib)
 * - ✅ CORRIGÉ : dashboard.js → /core/ (pas /tools)
 * - ✅ AJOUTÉ : Section WORKERS
 * 
 * USAGE:
 * run /tools/version-checker.js
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    ns.clearLog();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🔍 NEXUS VERSION CHECKER v1.1                           ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const files = [
        // CORE
        { path: '/boot.js', expectedVersion: '0.9.1' },
        { path: '/core/orchestrator.js', expectedVersion: '0.9.1-DYNAMIC' },
        { path: '/core/batcher.js', expectedVersion: '0.10.0' },
        { path: '/core/port-handler.js', expectedVersion: '0.8.0' },
        { path: '/core/ram-manager.js', expectedVersion: '0.10.1' },  // HOTFIX
        { path: '/core/dashboard.js', expectedVersion: '0.9.0' },
        
        // HACK
        { path: '/hack/controller.js', expectedVersion: '0.8.0' },
        
        // LIB
        { path: '/lib/constants.js', expectedVersion: '0.10.1' },  // HOTFIX
        { path: '/lib/logger.js', expectedVersion: '0.8.0' },
        { path: '/lib/network.js', expectedVersion: '0.10.0' },
        { path: '/lib/capabilities.js', expectedVersion: '0.8.0' },
        { path: '/lib/utils.js', expectedVersion: '0.8.0' },
        { path: '/lib/formulas-helper.js', expectedVersion: '0.8.0' },
        
        // WORKERS
        { path: '/workers/hack.js', expectedVersion: '0.8.0' },
        { path: '/workers/grow.js', expectedVersion: '0.8.0' },
        { path: '/workers/weaken.js', expectedVersion: '0.8.0' },
        
        // MANAGERS
        { path: '/managers/stock-manager.js', expectedVersion: '0.9.1' },
        { path: '/managers/server-manager.js', expectedVersion: '0.9.0' },
        
        // TOOLS
        { path: '/tools/deploy.js', expectedVersion: '0.5' },
        { path: '/tools/global-kill.js', expectedVersion: '0.8.0' },
        { path: '/tools/network-audit.js', expectedVersion: '0.8.3' },
        { path: '/tools/liquidate.js', expectedVersion: '0.8.0' },
        { path: '/tools/target-analyzer.js', expectedVersion: '0.10.0' },
        { path: '/tools/aug-speedrun.js', expectedVersion: '1.1' },  // HOTFIX
        { path: '/tools/aug-planner.js', expectedVersion: '1.3.0' },
        { path: '/tools/version-checker.js', expectedVersion: '1.1.0' },  // CETTE VERSION
    ];
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS CORE');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let coreFiles = files.filter(f => f.path.startsWith('/core') || f.path === '/boot.js');
    for (const file of coreFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS HACK');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let hackFiles = files.filter(f => f.path.startsWith('/hack'));
    for (const file of hackFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS LIB');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let libFiles = files.filter(f => f.path.startsWith('/lib'));
    for (const file of libFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS WORKERS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let workerFiles = files.filter(f => f.path.startsWith('/workers'));
    for (const file of workerFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS MANAGERS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let managerFiles = files.filter(f => f.path.startsWith('/managers'));
    for (const file of managerFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('FICHIERS TOOLS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let toolFiles = files.filter(f => f.path.startsWith('/tools'));
    for (const file of toolFiles) {
        checkFile(ns, file);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Summary
    const totalFiles = files.length;
    const existingFiles = files.filter(f => ns.fileExists(f.path)).length;
    const matchingVersions = files.filter(f => {
        if (!ns.fileExists(f.path)) return false;
        const content = ns.read(f.path);
        return content.includes(f.expectedVersion);
    }).length;
    
    ns.print('');
    ns.print(`📊 RÉSUMÉ:`);
    ns.print(`   Fichiers total: ${totalFiles}`);
    ns.print(`   Fichiers présents: ${existingFiles}/${totalFiles}`);
    ns.print(`   Versions correctes: ${matchingVersions}/${existingFiles}`);
    ns.print('');
    
    if (matchingVersions === existingFiles && existingFiles === totalFiles) {
        ns.print('✅ TOUTES LES VERSIONS SONT À JOUR !');
    } else {
        ns.print('⚠️  CERTAINS FICHIERS NÉCESSITENT UNE MISE À JOUR');
    }
    
    ns.print('');
    ns.print('💡 TIP: Fichiers manquants = normaux si pas encore déployés');
    ns.print('    Versions différentes = à mettre à jour via deploy.js');
}

function checkFile(ns, file) {
    const exists = ns.fileExists(file.path);
    
    if (!exists) {
        const name = file.path.padEnd(40);
        ns.print(`❌ ${name}  MANQUANT`);
        return;
    }
    
    const content = ns.read(file.path);
    const hasVersion = content.includes(file.expectedVersion);
    const size = content.length;
    const sizeStr = formatSize(size);
    
    const name = file.path.padEnd(40);
    const ver = file.expectedVersion.padEnd(15);
    const sizeFormatted = sizeStr.padStart(8);
    
    if (hasVersion) {
        ns.print(`🟢 ${name}  v${ver}  ${sizeFormatted}`);
    } else {
        ns.print(`🟡 ${name}  v${ver}  ${sizeFormatted}  (VERSION DIFFÉRENTE)`);
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}
