/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    ns.tprint('╔════════════════════════════════════════╗');
    ns.tprint('║  🚨 EMERGENCY ZOMBIE CLEANUP          ║');
    ns.tprint('╚════════════════════════════════════════╝');
    ns.tprint('');
    
    // Kill orchestrator/batcher/controller
    ns.tprint('[1/4] Arrêt système NEXUS...');
    ns.scriptKill('/core/orchestrator.js', 'home');
    ns.scriptKill('/core/batcher.js', 'home');
    ns.scriptKill('/hack/controller.js', 'home');
    await ns.sleep(1000);
    
    // Find all servers
    const servers = getAllServers(ns);
    
    // Kill all workers
    ns.tprint('[2/4] Recherche workers zombies...');
    let totalKilled = 0;
    
    for (const server of servers) {
        const processes = ns.ps(server);
        
        for (const proc of processes) {
            if (proc.filename.includes('workers/') && proc.threads > 100000) {
                ns.kill(proc.pid);
                totalKilled++;
                ns.tprint(`  ✓ Killed ${proc.filename} (${ns.formatNumber(proc.threads)}t) on ${server}`);
            }
        }
    }
    
    ns.tprint('');
    ns.tprint(`[3/4] Zombies tués : ${totalKilled}`);
    
    // Clear ports
    ns.tprint('[4/4] Nettoyage ports...');
    for (let i = 1; i <= 10; i++) {
        ns.clearPort(i);
    }
    
    ns.tprint('');
    ns.tprint('✅ SYSTÈME NETTOYÉ');
    ns.tprint('');
    ns.tprint('📋 Vérification :');
    ns.tprint('   run /tools/log-analyzer.js');
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ['home'];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}