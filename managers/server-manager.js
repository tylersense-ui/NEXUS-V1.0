/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const minServerRam = 8; // Commencer avec 8GB
    const maxServers = 25; // Limite du jeu
    const prefix = 'nexus-';
    
    while (true) {
        const money = ns.getServerMoneyAvailable('home');
        const ownedServers = ns.getPurchasedServers();
        
        // Acheter un nouveau serveur si on a l'argent
        if (ownedServers.length < maxServers) {
            const cost = ns.getPurchasedServerCost(minServerRam);
            
            if (money > cost * 2) { // Garder une marge
                const hostname = `${prefix}${ownedServers.length}`;
                const purchased = ns.purchaseServer(hostname, minServerRam);
                
                if (purchased) {
                    ns.print(`✓ Serveur acheté: ${purchased} (${minServerRam}GB)`);
                    
                    // Déployer le hack dessus
                    await deployHack(ns, purchased);
                }
            }
        }
        
        // Upgrader les serveurs existants si on a beaucoup d'argent
        if (money > 10000000) { // 10m+
            for (const server of ownedServers) {
                const currentRam = ns.getServerMaxRam(server);
                const nextRam = currentRam * 2;
                
                if (nextRam <= 1048576) { // Max RAM possible
                    const upgradeCost = ns.getPurchasedServerUpgradeCost(server, nextRam);
                    
                    if (upgradeCost > 0 && money > upgradeCost * 3) {
                        if (ns.upgradePurchasedServer(server, nextRam)) {
                            ns.print(`↑ Upgrade: ${server} → ${nextRam}GB`);
                            await deployHack(ns, server);
                        }
                    }
                }
            }
        }
        
        await ns.sleep(10000); // Check toutes les 10s
    }
}

async function deployHack(ns, server) {
    const script = '/hack/basic-hack.js';
    
    // Copier le script
    await ns.scp(script, server);
    
    // Trouver la meilleure cible
    let target = 'foodnstuff';
    try {
        const strategyData = ns.read('/state/strategy-state.txt');
        if (strategyData) {
            const strategy = JSON.parse(strategyData);
            if (strategy.target) target = strategy.target;
        }
    } catch (e) {
        // Utiliser foodnstuff par défaut
    }
    
    // Lancer avec tous les threads disponibles
    const ram = ns.getServerMaxRam(server);
    const scriptRam = ns.getScriptRam(script);
    const threads = Math.floor(ram / scriptRam);
    
    if (threads > 0) {
        ns.killall(server);
        ns.exec(script, server, threads, target);
        ns.print(`  → ${threads} threads sur ${target}`);
    }
}