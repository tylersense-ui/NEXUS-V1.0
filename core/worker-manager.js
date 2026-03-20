/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    const CLEANUP_INTERVAL_MS = 10000; // Check every 10s
    const MAX_WORKER_LIFETIME_MS = 300000; // 5 minutes max
    
    ns.print('[WORKER-MANAGER] Démarrage...');
    
    while (true) {
        try {
            const servers = getAllServers(ns);
            let cleaned = 0;
            
            for (const server of servers) {
                const processes = ns.ps(server);
                const now = Date.now();
                
                for (const proc of processes) {
                    // Only target workers
                    if (!proc.filename.startsWith('workers/')) continue;
                    
                    const lifetime = now - proc.onlineRunningTime;
                    
                    // Kill if too old
                    if (lifetime > MAX_WORKER_LIFETIME_MS) {
                        ns.kill(proc.pid);
                        cleaned++;
                        ns.print(`Cleaned zombie: ${proc.filename} PID ${proc.pid} on ${server}`);
                    }
                }
            }
            
            if (cleaned > 0) {
                ns.print(`[WORKER-MANAGER] Cleaned ${cleaned} zombies`);
            }
            
        } catch (error) {
            ns.print(`[WORKER-MANAGER] ERROR: ${error}`);
        }
        
        await ns.sleep(CLEANUP_INTERVAL_MS);
    }
}

function getAllServers(ns) {
    const servers = new Set();
    const queue = ['home'];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (servers.has(current)) continue;
        
        servers.add(current);
        const neighbors = ns.scan(current);
        queue.push(...neighbors);
    }
    
    return Array.from(servers);
}