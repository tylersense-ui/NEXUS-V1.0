/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Server Manager                    ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/server-manager.js
 * @version     0.5.1
 * @description Achat ET upgrade automatique des serveurs
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const MAX_SERVERS = 25;
    const MAX_RAM = 1048576; // 1 PB
    const CHECK_INTERVAL = 30000; // 30s
    const MIN_RAM = 8; // Démarrer avec 8GB
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   🖥️  NEXUS SERVER MANAGER (Buy + Upgrade)                ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        const servers = ns.getPurchasedServers();
        
        ns.print(`💰 Argent: $${ns.formatNumber(money)}`);
        ns.print(`🖥️  Serveurs: ${servers.length}/${MAX_SERVERS}`);
        ns.print('');
        
        // ═══════════════════════════════════════════════════════════
        // PHASE 1 : ACHETER NOUVEAUX SERVEURS
        // ═══════════════════════════════════════════════════════════
        
        if (servers.length < MAX_SERVERS) {
            const buyRam = MIN_RAM;
            const buyCost = ns.getPurchasedServerCost(buyRam);
            
            if (money > buyCost * 2) {
                const hostname = `nexus-${servers.length}`;
                const purchased = ns.purchaseServer(hostname, buyRam);
                
                if (purchased) {
                    ns.print(`✅ ACHAT: ${purchased} (${ns.formatRam(buyRam)}) - $${ns.formatNumber(buyCost)}`);
                    ns.print('');
                    continue; // Retour immédiat pour acheter le suivant
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
        // PHASE 2 : UPGRADER SERVEURS EXISTANTS
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
        
        // Stats finales
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