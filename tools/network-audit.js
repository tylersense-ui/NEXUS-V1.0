/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.8.3 - Network Audit Tool                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/network-audit.js
 * @version     0.8.3
 * @description Analyser l'utilisation du réseau complet
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🔍 NEXUS NETWORK AUDIT v0.8.3                           ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const allServers = scanAll(ns);
    
    ns.print(`📊 TOTAL SERVEURS DÉTECTÉS: ${allServers.length}`);
    ns.print('');
    
    // Catégorisation
    const rooted = [];
    const notRooted = [];
    const withWorkers = [];
    const withoutWorkers = [];
    const tooLowRam = [];
    
    for (const server of allServers) {
        const hasRoot = ns.hasRootAccess(server);
        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        const reqLevel = ns.getServerRequiredHackingLevel(server);
        const procs = ns.ps(server);
        
        const workerProcs = procs.filter(p => 
            p.filename.includes('hack.js') || 
            p.filename.includes('grow.js') || 
            p.filename.includes('weaken.js')
        );
        
        if (hasRoot) {
            rooted.push({
                name: server,
                maxRam: maxRam,
                usedRam: usedRam,
                workers: workerProcs.length,
                reqLevel: reqLevel
            });
            
            if (workerProcs.length > 0) {
                withWorkers.push({
                    name: server,
                    maxRam: maxRam,
                    workers: workerProcs.length
                });
            } else if (maxRam >= 2) {
                withoutWorkers.push({
                    name: server,
                    maxRam: maxRam
                });
            } else {
                tooLowRam.push({
                    name: server,
                    maxRam: maxRam
                });
            }
        } else {
            notRooted.push({
                name: server,
                reqLevel: reqLevel
            });
        }
    }
    
    // RAPPORT
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('STATUT ROOT');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`✅ Rootés: ${rooted.length}`);
    ns.print(`❌ Non-rootés: ${notRooted.length}`);
    
    if (notRooted.length > 0) {
        ns.print('');
        ns.print('Serveurs NON-ROOTÉS:');
        for (const s of notRooted) {
            ns.print(`  • ${s.name.padEnd(20)} (req lvl ${s.reqLevel})`);
        }
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('UTILISATION WORKERS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`🟢 AVEC workers: ${withWorkers.length}`);
    ns.print(`⚠️  SANS workers (RAM ≥2GB): ${withoutWorkers.length}`);
    ns.print(`🔴 RAM trop faible (<2GB): ${tooLowRam.length}`);
    
    if (withoutWorkers.length > 0) {
        ns.print('');
        ns.print('Serveurs ROOTÉS SANS WORKERS (RAM ≥2GB):');
        for (const s of withoutWorkers.slice(0, 15)) {
            ns.print(`  • ${s.name.padEnd(20)} ${ns.formatRam(s.maxRam).padStart(10)}`);
        }
        if (withoutWorkers.length > 15) {
            ns.print(`  ... et ${withoutWorkers.length - 15} autres`);
        }
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('TOP 10 SERVEURS PAR WORKERS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    withWorkers.sort((a, b) => b.workers - a.workers);
    
    for (const s of withWorkers.slice(0, 10)) {
        const ramStr = ns.formatRam(s.maxRam).padStart(10);
        const workersStr = String(s.workers).padStart(6);
        ns.print(`  ${s.name.padEnd(20)} ${ramStr}  ${workersStr} workers`);
    }
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('RAM TOTALE');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalRam = 0;
    let usedRam = 0;
    
    for (const s of rooted) {
        totalRam += s.maxRam;
        usedRam += s.usedRam;
    }
    
    const ramPercent = (usedRam / totalRam) * 100;
    
    ns.print(`📊 Total RAM réseau: ${ns.formatRam(totalRam)}`);
    ns.print(`⚡ RAM utilisée: ${ns.formatRam(usedRam)} (${ramPercent.toFixed(1)}%)`);
    ns.print(`💤 RAM disponible: ${ns.formatRam(totalRam - usedRam)}`);
    
    ns.print('');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const purchasedServers = ns.getPurchasedServers();
    let purchasedRam = 0;
    
    for (const s of purchasedServers) {
        purchasedRam += ns.getServerMaxRam(s);
    }
    
    ns.print(`🖥️  Serveurs achetés: ${purchasedServers.length}/25`);
    ns.print(`📊 RAM achetée: ${ns.formatRam(purchasedRam)}`);
    ns.print(`🌐 RAM réseau (autres): ${ns.formatRam(totalRam - purchasedRam)}`);
}

function scanAll(ns) {
    const visited = new Set();
    const queue = ['home'];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
        }
        
        servers.push(current);
    }
    
    return servers;
}