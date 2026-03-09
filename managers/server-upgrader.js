/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Server Upgrader                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/server-upgrader.js
 * @version     0.5.0
 * @description Upgrade automatique des serveurs achetés au max
 * 
 * @usage
 * run /managers/server-upgrader.js
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🔧 NEXUS SERVER UPGRADER                                ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    const MAX_RAM = 1048576; // 1 PB (max possible)
    const CHECK_INTERVAL = 30000; // 30s
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   🔧 NEXUS SERVER UPGRADER                                ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        const servers = ns.getPurchasedServers();
        
        ns.print(`💰 Argent disponible: $${ns.formatNumber(money)}`);
        ns.print(`🖥️  Serveurs: ${servers.length}/25`);
        ns.print('');
        
        if (servers.length === 0) {
            ns.print('⚠️  Aucun serveur acheté');
            ns.print('');
            ns.print('Lance /managers/server-manager.js pour acheter des serveurs');
            await ns.sleep(CHECK_INTERVAL);
            continue;
        }
        
        // Analyser les serveurs
        let totalUpgraded = 0;
        let totalSpent = 0;
        
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('SERVEUR           RAM ACTUELLE    PROCHAINE      COÛT');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        for (const server of servers) {
            const currentRam = ns.getServerMaxRam(server);
            const nextRam = currentRam * 2;
            
            if (nextRam > MAX_RAM) {
                const ramStr = ns.formatRam(currentRam).padEnd(15);
                ns.print(`${server.padEnd(17)} ${ramStr} MAX ✅`);
                continue;
            }
            
            const upgradeCost = ns.getPurchasedServerUpgradeCost(server, nextRam);
            
            if (upgradeCost === Infinity || upgradeCost < 0) {
                const ramStr = ns.formatRam(currentRam).padEnd(15);
                ns.print(`${server.padEnd(17)} ${ramStr} MAX ✅`);
                continue;
            }
            
            const currentRamStr = ns.formatRam(currentRam).padEnd(15);
            const nextRamStr = ns.formatRam(nextRam).padEnd(12);
            const costStr = `$${ns.formatNumber(upgradeCost)}`;
            
            if (money > upgradeCost * 1.5) {
                // Upgrade !
                if (ns.upgradePurchasedServer(server, nextRam)) {
                    ns.print(`${server.padEnd(17)} ${currentRamStr} → ${nextRamStr} ✅ ${costStr}`);
                    totalUpgraded++;
                    totalSpent += upgradeCost;
                } else {
                    ns.print(`${server.padEnd(17)} ${currentRamStr} → ${nextRamStr} ❌ ÉCHEC`);
                }
            } else {
                ns.print(`${server.padEnd(17)} ${currentRamStr} → ${nextRamStr} ⏳ ${costStr}`);
            }
        }
        
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('');
        
        if (totalUpgraded > 0) {
            ns.print(`✅ ${totalUpgraded} serveurs upgradés`);
            ns.print(`💸 Dépensé: $${ns.formatNumber(totalSpent)}`);
            ns.print('');
        }
        
        // Calculer RAM totale
        let totalRam = 0;
        for (const server of servers) {
            totalRam += ns.getServerMaxRam(server);
        }
        
        ns.print(`📊 RAM totale réseau: ${ns.formatRam(totalRam)}`);
        ns.print(`📊 RAM max possible: ${ns.formatRam(MAX_RAM * servers.length)}`);
        
        const progress = (totalRam / (MAX_RAM * servers.length)) * 100;
        ns.print(`📈 Progression: ${progress.toFixed(2)}%`);
        ns.print('');
        
        ns.print(`⏱️  Prochaine vérification dans ${CHECK_INTERVAL / 1000}s...`);
        
        await ns.sleep(CHECK_INTERVAL);
    }
}