/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Dashboard                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/dashboard.js
 * @version     0.5.0
 * @description Dashboard temps réel ultra-visuel
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const UPDATE_INTERVAL = 1000; // 1s
    const HISTORY_SIZE = 20;
    
    // Historique pour sparklines
    const moneyHistory = [];
    const incomeHistory = [];
    
    let lastMoney = ns.getServerMoneyAvailable('home');
    let lastTime = Date.now();
    
    while (true) {
        ns.clearLog();
        
        // ═══════════════════════════════════════════════════════════════
        // COLLECTE DE DONNÉES
        // ═══════════════════════════════════════════════════════════════
        
        const now = Date.now();
        const currentMoney = ns.getServerMoneyAvailable('home');
        const moneyDelta = currentMoney - lastMoney;
        const timeDelta = (now - lastTime) / 1000; // secondes
        const incomePerSec = timeDelta > 0 ? moneyDelta / timeDelta : 0;
        
        // Mise à jour historique
        moneyHistory.push(currentMoney);
        if (moneyHistory.length > HISTORY_SIZE) moneyHistory.shift();
        
        incomeHistory.push(incomePerSec);
        if (incomeHistory.length > HISTORY_SIZE) incomeHistory.shift();
        
        lastMoney = currentMoney;
        lastTime = now;
        
        // Stats générales
        const hackLevel = ns.getHackingLevel();
        const homeRam = ns.getServerMaxRam('home');
        const homeUsedRam = ns.getServerUsedRam('home');
        
        // Serveurs achetés
        const purchasedServers = ns.getPurchasedServers();
        let totalPurchasedRam = 0;
        for (const s of purchasedServers) {
            totalPurchasedRam += ns.getServerMaxRam(s);
        }
        
        // Threads actifs
        let totalThreads = 0;
        const allServers = ['home', ...purchasedServers];
        for (const s of allServers) {
            const procs = ns.ps(s);
            for (const p of procs) {
                totalThreads += p.threads;
            }
        }
        
        // Targets actifs
        const activeTargets = new Set();
        for (const s of allServers) {
            const procs = ns.ps(s);
            for (const p of procs) {
                if (p.args[0]) activeTargets.add(p.args[0]);
            }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // AFFICHAGE DASHBOARD
        // ═══════════════════════════════════════════════════════════════
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   🔥 NEXUS DASHBOARD v0.5-PROMETHEUS                      ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        // ───────────────────────────────────────────────────────────────
        // ARGENT & REVENUS
        // ───────────────────────────────────────────────────────────────
        
        ns.print('💰 ARGENT & REVENUS');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const moneyStr = `$${ns.formatNumber(currentMoney)}`;
        const incomeStr = `$${ns.formatNumber(incomePerSec)}/s`;
        const incomeColor = incomePerSec > 0 ? '🟢' : '🔴';
        
        ns.print(`💵 Total: ${moneyStr}`);
        ns.print(`${incomeColor} Revenu: ${incomeStr}`);
        
        // Sparkline argent
        const moneySparkline = generateSparkline(moneyHistory);
        ns.print(`📈 Tendance: ${moneySparkline}`);
        ns.print('');
        
        // ───────────────────────────────────────────────────────────────
        // HACKING
        // ───────────────────────────────────────────────────────────────
        
        ns.print('🎯 HACKING');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        ns.print(`🎓 Niveau: ${hackLevel}`);
        ns.print(`⚡ Threads actifs: ${ns.formatNumber(totalThreads)}`);
        ns.print(`🎯 Cibles: ${activeTargets.size}`);
        
        // Barres de progression des cibles
        const targetList = Array.from(activeTargets).slice(0, 5);
        for (const target of targetList) {
            const currentTargetMoney = ns.getServerMoneyAvailable(target);
            const maxTargetMoney = ns.getServerMaxMoney(target);
            const percent = maxTargetMoney > 0 ? (currentTargetMoney / maxTargetMoney) * 100 : 0;
            
            const bar = generateProgressBar(percent, 20);
            const percentStr = percent.toFixed(1).padStart(5);
            
            ns.print(`  ${target.padEnd(20)} ${bar} ${percentStr}%`);
        }
        ns.print('');
        
        // ───────────────────────────────────────────────────────────────
        // RAM & SERVEURS
        // ───────────────────────────────────────────────────────────────
        
        ns.print('💾 RAM & SERVEURS');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const homeRamPercent = (homeUsedRam / homeRam) * 100;
        const homeBar = generateProgressBar(homeRamPercent, 20);
        
        ns.print(`🏠 Home: ${ns.formatRam(homeUsedRam)} / ${ns.formatRam(homeRam)}`);
        ns.print(`   ${homeBar} ${homeRamPercent.toFixed(1)}%`);
        ns.print('');
        
        ns.print(`🖥️  Serveurs achetés: ${purchasedServers.length}/25`);
        ns.print(`📊 RAM totale: ${ns.formatRam(totalPurchasedRam)}`);
        
        // Barre de progression upgrade serveurs
        const maxPossibleRam = 1048576 * 25; // 1 PB * 25
        const upgradePercent = (totalPurchasedRam / maxPossibleRam) * 100;
        const upgradeBar = generateProgressBar(upgradePercent, 20);
        
        ns.print(`🔧 Upgrade: ${upgradeBar} ${upgradePercent.toFixed(2)}%`);
        ns.print('');
        
        // ───────────────────────────────────────────────────────────────
        // FOOTER
        // ───────────────────────────────────────────────────────────────
        
        const uptime = formatUptime(ns.getScriptRuntime());
        ns.print(`⏱️  Uptime: ${uptime} | 🔄 Update: ${UPDATE_INTERVAL / 1000}s`);
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

/**
 * Génère une barre de progression visuelle
 * @param {number} percent - Pourcentage (0-100)
 * @param {number} width - Largeur de la barre
 * @returns {string} Barre de progression
 */
function generateProgressBar(percent, width) {
    const filled = Math.floor((percent / 100) * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    // Couleurs selon pourcentage
    if (percent >= 80) return `🟢 ${bar}`;
    if (percent >= 50) return `🟡 ${bar}`;
    if (percent >= 20) return `🟠 ${bar}`;
    return `🔴 ${bar}`;
}

/**
 * Génère une sparkline (mini-graphique)
 * @param {Array<number>} data - Données historiques
 * @returns {string} Sparkline
 */
function generateSparkline(data) {
    if (data.length === 0) return '';
    
    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    if (range === 0) return chars[0].repeat(data.length);
    
    return data.map(value => {
        const normalized = (value - min) / range;
        const index = Math.floor(normalized * (chars.length - 1));
        return chars[index];
    }).join('');
}

/**
 * Formate le uptime
 * @param {number} ms - Millisecondes
 * @returns {string} Uptime formaté
 */
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}