/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS - Log Viewer (PRODUCTION)                          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Usage: run /tools/log-viewer.js [component] [lines]
 * 
 * Exemples:
 *   run /tools/log-viewer.js orchestrator 100
 *   run /tools/log-viewer.js batcher 50
 *   run /tools/log-viewer.js all 200
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    const component = ns.args[0] || "all";
    const lines = ns.args[1] || 100;
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║   📋 NEXUS LOG VIEWER                                     ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
    const logFiles = {
        orchestrator: "/logs/orchestrator.txt",
        batcher: "/logs/batcher.txt",
        controller: "/logs/controller.txt",
        system: "/logs/system.txt"
    };
    
    // Déterminer quels logs afficher
    const filesToShow = component === "all" 
        ? Object.values(logFiles)
        : [logFiles[component] || logFiles.orchestrator];
    
    for (const logFile of filesToShow) {
        if (!ns.fileExists(logFile)) {
            ns.tprint(`⚠️  ${logFile} n'existe pas encore`);
            ns.tprint("");
            continue;
        }
        
        const content = ns.read(logFile);
        const allLines = content.split('\n').filter(l => l.trim());
        
        // Prendre les N dernières lignes
        const displayLines = allLines.slice(-lines);
        
        ns.tprint(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        ns.tprint(`📄 ${logFile} (${displayLines.length}/${allLines.length} lignes)`);
        ns.tprint(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        for (const line of displayLines) {
            // Coloriser selon le niveau
            if (line.includes("[ERROR]")) {
                ns.tprint(`🔴 ${line}`);
            } else if (line.includes("[WARN]")) {
                ns.tprint(`🟡 ${line}`);
            } else if (line.includes("[DEBUG]")) {
                ns.tprint(`🔵 ${line}`);
            } else {
                ns.tprint(`   ${line}`);
            }
        }
        
        ns.tprint("");
    }
    
    ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    ns.tprint("💡 COMMANDES:");
    ns.tprint("   run /tools/log-viewer.js orchestrator 200");
    ns.tprint("   run /tools/log-viewer.js batcher 100");
    ns.tprint("   run /tools/log-viewer.js all 500");
    ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}