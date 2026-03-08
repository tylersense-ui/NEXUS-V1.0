/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS Framework v0.2-alpha                                 ║
 * ║ Module: Server Manager                                     ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/server-manager.js
 * @version     0.2.0
 * @author      NEXUS AI Architect
 * @created     2026-03-08
 * @modified    2026-03-08
 * 
 * @description
 * Gestionnaire unifié pour l'achat, l'upgrade et la gestion des serveurs.
 * Achète automatiquement des serveurs quand l'argent est disponible.
 * Upgrade les serveurs existants quand rentable.
 * Déploie automatiquement les scripts de hack.
 * 
 * @usage
 * run /managers/server-manager.js
 * 
 * @dependencies
 * - /hack/basic-hack.js (script à déployer)
 * - /state/strategy-state.txt (pour la cible)
 * 
 * @ram
 * 3.50GB
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const CONFIG = {
        minServerRam: 8,          // RAM initiale (8GB)
        maxServers: 25,           // Limite du jeu
        prefix: 'nexus-',         // Préfixe des serveurs
        buyMargin: 2,             // Garder 2x le prix en réserve
        upgradeMargin: 3,         // Garder 3x le prix pour upgrade
        upgradeThreshold: 10000000, // 10m$ minimum pour upgrade
        checkInterval: 10000      // Check toutes les 10s
    };
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║ NEXUS Server Manager v0.2                                 ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    while (true) {
        const money = ns.getServerMoneyAvailable('home');
        const owned = ns.getPurchasedServers();
        
        // PHASE 1: Acheter de nouveaux serveurs
        if (owned.length < CONFIG.maxServers) {
            const cost = ns.getPurchasedServerCost(CONFIG.minServerRam);
            
            if (money > cost * CONFIG.buyMargin) {
                const hostname = `${CONFIG.prefix}${owned.length}`;
                const purchased = ns.purchaseServer(hostname, CONFIG.minServerRam);
                
                if (purchased) {
                    ns.print(`✓ ACHAT: ${purchased} (${CONFIG.minServerRam}GB) - $${formatMoney(cost)}`);
                    await deployHack(ns, purchased);
                }
            }
        }
        
        // PHASE 2: Upgrader les serveurs existants
        if (money > CONFIG.upgradeThreshold) {
            for (const server of owned) {
                const currentRam = ns.getServerMaxRam(server);
                const nextRam = currentRam * 2;
                
                if (nextRam <= 1048576) { // Max RAM = 1PB
                    const upgradeCost = ns.getPurchasedServerUpgradeCost(server, nextRam);
                    
                    if (upgradeCost > 0 && money > upgradeCost * CONFIG.upgradeMargin) {
                        if (ns.upgradePurchasedServer(server, nextRam)) {
                            ns.print(`↑ UPGRADE: ${server} ${currentRam}GB → ${nextRam}GB - $${formatMoney(upgradeCost)}`);
                            await deployHack(ns, server);
                        }
                    }
                }
            }
        }
        
        await ns.sleep(CONFIG.checkInterval);
    }
}

/**
 * Déploie le script de hack sur un serveur
 * @param {NS} ns 
 * @param {string} server 
 */
async function deployHack(ns, server) {
    const script = '/hack/basic-hack.js';
    
    // Trouver la cible
    let target = 'n00dles';
    try {
        const strategyData = ns.read('/state/strategy-state.txt');
        if (strategyData) {
            const strategy = JSON.parse(strategyData);
            if (strategy.target) target = strategy.target;
        }
    } catch (e) {
        // Fallback sur n00dles
    }
    
    // Copier et lancer
    await ns.scp(script, server);
    const ram = ns.getServerMaxRam(server);
    const scriptRam = ns.getScriptRam(script);
    const threads = Math.floor(ram / scriptRam);
    
    if (threads > 0) {
        ns.killall(server);
        ns.exec(script, server, threads, target);
        ns.print(`  → ${threads} threads sur ${target}`);
    }
}

function formatMoney(m) {
    if (m >= 1e9) return `${(m/1e9).toFixed(2)}b`;
    if (m >= 1e6) return `${(m/1e6).toFixed(2)}m`;
    if (m >= 1e3) return `${(m/1e3).toFixed(0)}k`;
    return `${m.toFixed(0)}`;
}