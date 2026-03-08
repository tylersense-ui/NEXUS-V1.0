/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    while (true) {
        ns.clearLog();
        
        // Lecture sécurisée des états
        let worldState = null;
        let strategyState = null;
        let progressState = null;
        
        try {
            const worldData = ns.read('/state/world-state.txt');
            if (worldData) worldState = JSON.parse(worldData);
        } catch (e) {
            // Fichier non lisible
        }
        
        try {
            const strategyData = ns.read('/state/strategy-state.txt');
            if (strategyData) strategyState = JSON.parse(strategyData);
        } catch (e) {
            // Fichier non lisible
        }
        
        try {
            const progressData = ns.read('/state/progress-state.txt');
            if (progressData) progressState = JSON.parse(progressData);
        } catch (e) {
            // Fichier non lisible
        }
        
        const money = ns.getServerMoneyAvailable('home');
        const hackLevel = ns.getHackingLevel();
        
        ns.print('╔════════════════════════════════════╗');
        ns.print('║      NEXUS v0.1-bootstrap          ║');
        ns.print('╚════════════════════════════════════╝');
        ns.print('');
        ns.print(`💰 Argent: $${formatMoney(money)}`);
        ns.print(`🎯 Niveau Hack: ${hackLevel}`);
        ns.print('');
        
        if (worldState && worldState.servers) {
            ns.print(`🌐 Serveurs découverts: ${worldState.servers.length}`);
            ns.print(`🔓 Serveurs rootés: ${worldState.rooted ? worldState.rooted.length : 0}`);
        } else {
            ns.print(`🌐 Serveurs découverts: scan en cours...`);
        }
        
        if (strategyState && strategyState.target) {
            ns.print('');
            ns.print(`🎯 Cible actuelle: ${strategyState.target}`);
            const target = strategyState.target;
            
            try {
                const current = ns.getServerMoneyAvailable(target);
                const max = ns.getServerMaxMoney(target);
                const percent = max > 0 ? ((current / max) * 100).toFixed(1) : 0;
                ns.print(`💵 Argent cible: $${formatMoney(current)} / $${formatMoney(max)} (${percent}%)`);
            } catch (e) {
                ns.print(`💵 Cible non accessible`);
            }
        } else {
            ns.print('');
            ns.print(`🎯 Cible: recherche en cours...`);
        }
        
        if (progressState && progressState.startTime) {
            const runtime = Date.now() - progressState.startTime;
            ns.print('');
            ns.print(`⏱️  Temps écoulé: ${formatTime(runtime)}`);
        }
        
        await ns.sleep(1000);
    }
}

function formatMoney(money) {
    if (money >= 1e12) return `${(money / 1e12).toFixed(2)}t`;
    if (money >= 1e9) return `${(money / 1e9).toFixed(2)}b`;
    if (money >= 1e6) return `${(money / 1e6).toFixed(2)}m`;
    if (money >= 1e3) return `${(money / 1e3).toFixed(2)}k`;
    return `${money.toFixed(2)}`;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}