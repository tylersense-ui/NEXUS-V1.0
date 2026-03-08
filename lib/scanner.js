/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    
    const servers = scanNetwork(ns);
    
    // Sauvegarder l'état
    const worldState = {
        version: '0.1',
        lastScan: Date.now(),
        servers: servers,
        rooted: servers.filter(s => ns.hasRootAccess(s.hostname))
    };
    
    ns.write('/state/world-state.txt', JSON.stringify(worldState, null, 2), 'w');
    
    ns.tprint(`[SCAN] ${servers.length} serveurs découverts`);
    ns.tprint(`[SCAN] ${worldState.rooted.length} serveurs rootés`);
}

function scanNetwork(ns) {
    const visited = new Set();
    const servers = [];
    const queue = ['home'];
    
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
        
        if (current === 'home') continue;
        
        const server = {
            hostname: current,
            hasRoot: ns.hasRootAccess(current),
            requiredHackLevel: ns.getServerRequiredHackingLevel(current),
            numOpenPortsRequired: ns.getServerNumPortsRequired(current),
            maxMoney: ns.getServerMaxMoney(current),
            minSecurityLevel: ns.getServerMinSecurityLevel(current),
            maxRam: ns.getServerMaxRam(current)
        };
        
        servers.push(server);
    }
    
    return servers;
}

export { scanNetwork };