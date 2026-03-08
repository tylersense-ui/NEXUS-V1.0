/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    while (true) {
        ns.clearLog();
        
        const money = ns.getServerMoneyAvailable('home');
        const hackLevel = ns.getHackingLevel();
        const servers = ns.getPurchasedServers();
        
        ns.print('╔══════════════════════════╗');
        ns.print('║   NEXUS v0.1-lite        ║');
        ns.print('╚══════════════════════════╝');
        ns.print('');
        ns.print(`💰 ${formatMoney(money)}`);
        ns.print(`🎯 Hack lvl ${hackLevel}`);
        ns.print(`🖥️  Serveurs: ${servers.length}`);
        
        // Calculer revenu total
        let totalThreads = 0;
        for (const s of servers) {
            const procs = ns.ps(s);
            for (const p of procs) {
                totalThreads += p.threads;
            }
        }
        
        if (totalThreads > 0) {
            ns.print(`⚡ ${totalThreads} threads actifs`);
        }
        
        await ns.sleep(2000);
    }
}

function formatMoney(m) {
    if (m >= 1e9) return `$${(m/1e9).toFixed(2)}b`;
    if (m >= 1e6) return `$${(m/1e6).toFixed(2)}m`;
    if (m >= 1e3) return `$${(m/1e3).toFixed(2)}k`;
    return `$${m.toFixed(0)}`;
}