/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.8.3 - Server Manager (AUTO-STOP)                 ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const MAX_SERVERS = 25;
    const MAX_RAM = 1048576;
    const CHECK_INTERVAL = 30000;
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   🖥️  NEXUS SERVER MANAGER v0.8.3                         ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        const servers = ns.getPurchasedServers();
        
        ns.print(`💰 Argent: $${ns.formatNumber(money)}`);
        ns.print(`🖥️  Serveurs: ${servers.length}/${MAX_SERVERS}`);
        ns.print('');
        
        // ═══════════════════════════════════════════════════════════
        // VÉRIFIER SI TOUT EST MAX
        // ═══════════════════════════════════════════════════════════
        
        let allMaxed = servers.length === MAX_SERVERS;
        
        if (allMaxed) {
            for (const server of servers) {
                const ram = ns.getServerMaxRam(server);
                if (ram < MAX_RAM) {
                    allMaxed = false;
                    break;
                }
            }
        }
        
        if (allMaxed) {
            ns.print('╔═══════════════════════════════════════════════════════════╗');
            ns.print('║   ✅ MISSION ACCOMPLIE !                                  ║');
            ns.print('║                                                           ║');
            ns.print('║   25/25 serveurs @ 1PB chacun                             ║');
            ns.print('║   Server Manager s\'arrête automatiquement.                ║');
            ns.print('║                                                           ║');
            ns.print('╚═══════════════════════════════════════════════════════════╝');
            return;
        }
        
        // ═══════════════════════════════════════════════════════════
        // ACHAT NOUVEAUX SERVEURS
        // ═══════════════════════════════════════════════════════════
        
        if (servers.length < MAX_SERVERS) {
            const buyRam = 8;
            const buyCost = ns.getPurchasedServerCost(buyRam);
            
            if (money > buyCost * 2) {
                const hostname = `nexus-${servers.length}`;
                const purchased = ns.purchaseServer(hostname, buyRam);
                
                if (purchased) {
                    ns.print(`✅ ACHAT: ${purchased} (${ns.formatRam(buyRam)}) - $${ns.formatNumber(buyCost)}`);
                    ns.print('');
                    continue;
                }
            } else {
                ns.print(`⏳ ACHAT: Besoin $${ns.formatNumber(buyCost)} pour serveur ${servers.length + 1}`);
                ns.print('');
            }
        } else {
            ns.print('✅ ACHAT: 25/25 serveurs achetés');
            ns.print('');
        }
        
        // ═══════════════════════════════════════════════════════════
        // UPGRADE SERVEURS EXISTANTS
        // ═══════════════════════════════════════════════════════════
        
        if (servers.length === 0) {
            ns.print('⚠️  Aucun serveur à upgrader');
            await ns.sleep(CHECK_INTERVAL);
            continue;
        }
        
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
        
        let totalRam = 0;
        for (const server of servers) {
            totalRam += ns.getServerMaxRam(server);
        }
        
        ns.print(`📊 RAM totale: ${ns.formatRam(totalRam)}`);
        ns.print(`📊 RAM max possible: ${ns.formatRam(MAX_RAM * MAX_SERVERS)}`);
        
        const progress = (totalRam / (MAX_RAM * MAX_SERVERS)) * 100;
        ns.print(`📈 Progression: ${progress.toFixed(2)}%`);
        ns.print('');
        ns.print(`⏱️  Prochaine vérification dans ${CHECK_INTERVAL / 1000}s...`);
        
        await ns.sleep(CHECK_INTERVAL);
    }
}