/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS - Log Analyzer (DETECTIVE MODE)                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Analyse les logs pour identifier :
 * - Zombies (workers qui ne terminent jamais)
 * - Goulots d'étranglement
 * - Batches qui échouent
 * - RAM perdue
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    ns.tprint("╔═══════════════════════════════════════════════════════════╗");
    ns.tprint("║   🔍 NEXUS LOG ANALYZER                                   ║");
    ns.tprint("╚═══════════════════════════════════════════════════════════╝");
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // ANALYSE BATCHER
    // ════════════════════════════════════════════════════
    
    if (ns.fileExists("/logs/batcher.txt")) {
        ns.tprint("📊 ANALYSE BATCHER");
        ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        const batcherLog = ns.read("/logs/batcher.txt");
        const lines = batcherLog.split('\n');
        
        // Compter les batches HWGW
        const hwgwLines = lines.filter(l => l.includes("HWGW("));
        const hwgwCount = hwgwLines.length;
        
        // Analyser les threads
        let totalThreads = 0;
        let zeroThreadBatches = 0;
        
        const threadPattern = /= (\d+) threads/;
        
        for (const line of hwgwLines) {
            const match = line.match(threadPattern);
            if (match) {
                const threads = parseInt(match[1]);
                totalThreads += threads;
                
                if (threads === 0) {
                    zeroThreadBatches++;
                }
            }
        }
        
        ns.tprint(`  Batches HWGW lancés : ${hwgwCount}`);
        ns.tprint(`  Threads totaux      : ${ns.formatNumber(totalThreads)}`);
        ns.tprint(`  Batches à 0 threads : ${zeroThreadBatches} (${((zeroThreadBatches/hwgwCount)*100).toFixed(1)}%)`);
        
        if (zeroThreadBatches > hwgwCount * 0.5) {
            ns.tprint(`  🔴 PROBLÈME : >50% des batches à 0 threads !`);
        }
        
        // Analyser pipelineDepth
        const depthPattern = /d=(\d+)/;
        const depths = [];
        
        for (const line of hwgwLines) {
            const match = line.match(depthPattern);
            if (match) {
                depths.push(parseInt(match[1]));
            }
        }
        
        if (depths.length > 0) {
            const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
            const maxDepth = Math.max(...depths);
            
            ns.tprint(`  Pipeline depth moyen: ${avgDepth.toFixed(0)}`);
            ns.tprint(`  Pipeline depth max  : ${maxDepth}`);
            
            if (maxDepth > 5000) {
                ns.tprint(`  🟡 ATTENTION : Pipeline depth très élevé (${maxDepth})`);
                ns.tprint(`     → Risque de growThreads explosion`);
            }
        }
        
        ns.tprint("");
    }
    
    // ════════════════════════════════════════════════════
    // ANALYSE CONTROLLER
    // ════════════════════════════════════════════════════
    
    if (ns.fileExists("/logs/controller.txt")) {
        ns.tprint("🎮 ANALYSE CONTROLLER");
        ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        const controllerLog = ns.read("/logs/controller.txt");
        const lines = controllerLog.split('\n');
        
        // Compter succès/échecs
        const successLines = lines.filter(l => l.includes("SUCCESS"));
        const failLines = lines.filter(l => l.includes("FAILED"));
        
        const total = successLines.length + failLines.length;
        const successRate = total > 0 ? (successLines.length / total) * 100 : 0;
        
        ns.tprint(`  Jobs exécutés : ${total}`);
        ns.tprint(`  Succès        : ${successLines.length} (${successRate.toFixed(1)}%)`);
        ns.tprint(`  Échecs        : ${failLines.length}`);
        
        if (successRate < 80) {
            ns.tprint(`  🔴 PROBLÈME : Taux de succès < 80% !`);
        }
        
        ns.tprint("");
    }
    
    // ════════════════════════════════════════════════════
    // DÉTECTION ZOMBIES (via ps)
    // ════════════════════════════════════════════════════
    
    ns.tprint("👻 DÉTECTION ZOMBIES");
    ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const servers = getAllServers(ns);
    const zombies = [];
    
    for (const server of servers) {
        const processes = ns.ps(server);
        
        for (const proc of processes) {
            // Worker avec >100k threads = suspect
            if (proc.filename.includes("workers/") && proc.threads > 100000) {
                zombies.push({
                    server: server,
                    filename: proc.filename,
                    threads: proc.threads,
                    pid: proc.pid,
                    ram: proc.threads * 1.75
                });
            }
        }
    }
    
    if (zombies.length > 0) {
        ns.tprint(`  🚨 ${zombies.length} ZOMBIES DÉTECTÉS :`);
        
        for (const zombie of zombies) {
            ns.tprint(`     PID ${zombie.pid}: ${zombie.filename} (${ns.formatNumber(zombie.threads)}t, ${ns.formatRam(zombie.ram * 1e9)})`);
            ns.tprint(`     Serveur: ${zombie.server}`);
            ns.tprint(`     Commande: kill ${zombie.pid}`);
            ns.tprint("");
        }
    } else {
        ns.tprint(`  ✅ Aucun zombie détecté`);
    }
    
    ns.tprint("");
    
    // ════════════════════════════════════════════════════
    // RECOMMANDATIONS
    // ════════════════════════════════════════════════════
    
    ns.tprint("💡 RECOMMANDATIONS");
    ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (zombies.length > 0) {
        ns.tprint("  1. Tuer les zombies détectés ci-dessus");
    }
    
    ns.tprint("  2. Vérifier les logs détaillés avec:");
    ns.tprint("     run /tools/log-viewer.js batcher 200");
    ns.tprint("  3. Relancer l'analyse après corrections");
    
    ns.tprint("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
        
        servers.push(current);
    }
    
    return servers;
}