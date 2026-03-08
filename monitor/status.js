import { readState, formatMoney, formatTime } from '/lib/utils.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    while (true) {
        ns.clearLog();
        
        const worldState = readState(ns, 'world');
        const strategyState = readState(ns, 'strategy');
        const progressState = readState(ns, 'progress');
        
        const money = ns.getServerMoneyAvailable('home');
        const hackLevel = ns.getHackingLevel();
        
        ns.print('╔════════════════════════════════════╗');
        ns.print('║      NEXUS v0.1-bootstrap          ║');
        ns.print('╚════════════════════════════════════╝');
        ns.print('');
        ns.print(`💰 Argent: ${formatMoney(money)}`);
        ns.print(`🎯 Niveau Hack: ${hackLevel}`);
        ns.print('');
        
        if (worldState) {
            ns.print(`🌐 Serveurs découverts: ${worldState.servers.length}`);
            ns.print(`🔓 Serveurs rootés: ${worldState.rooted.length}`);
        }
        
        if (strategyState && strategyState.target) {
            ns.print('');
            ns.print(`🎯 Cible actuelle: ${strategyState.target}`);
            const target = strategyState.target;
            const current = ns.getServerMoneyAvailable(target);
            const max = ns.getServerMaxMoney(target);
            const percent = max > 0 ? ((current / max) * 100).toFixed(1) : 0;
            ns.print(`💵 Argent cible: ${formatMoney(current)} / ${formatMoney(max)} (${percent}%)`);
        }
        
        if (progressState) {
            const runtime = Date.now() - progressState.startTime;
            ns.print('');
            ns.print(`⏱️  Temps écoulé: ${formatTime(runtime)}`);
        }
        
        await ns.sleep(1000);
    }
}
```

---

# INSTRUCTIONS POUR L'OPÉRATEUR

**ÉTAPE 1 : Copier tous les fichiers**

Copie chaque fichier ci-dessus dans Visual Studio Code en respectant exactement l'arborescence :
```
/core/bootstrap.js
/lib/scanner.js
/lib/utils.js
/hack/basic-hack.js
/managers/target-manager.js
/monitor/status.js