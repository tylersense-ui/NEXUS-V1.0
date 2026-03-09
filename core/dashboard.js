/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.5-PROMETHEUS - Dashboard Ultimate                ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/dashboard.js
 * @version     0.5.5
 * @description Dashboard temps réel ultra-visuel ULTIME
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const UPDATE_INTERVAL = 1000;
    const HISTORY_SIZE = 20;
    
    const moneyHistory = [];
    const incomeHistory = [];
    
    let lastMoney = ns.getServerMoneyAvailable('home');
    let lastTime = Date.now();
    
    while (true) {
        ns.clearLog();
        
        const now = Date.now();
        const currentMoney = ns.getServerMoneyAvailable('home');
        const moneyDelta = currentMoney - lastMoney;
        const timeDelta = (now - lastTime) / 1000;
        const incomePerSec = timeDelta > 0 ? moneyDelta / timeDelta : 0;
        
        moneyHistory.push(currentMoney);
        if (moneyHistory.length > HISTORY_SIZE) moneyHistory.shift();
        
        incomeHistory.push(incomePerSec);
        if (incomeHistory.length > HISTORY_SIZE) incomeHistory.shift();
        
        lastMoney = currentMoney;
        lastTime = now;
        
        // ═══════════════════════════════════════════════════════════
        // STATS SYSTÈME
        // ═══════════════════════════════════════════════════════════
        
        const hackLevel = ns.getHackingLevel();
        const homeRam = ns.getServerMaxRam('home');
        const homeUsedRam = ns.getServerUsedRam('home');
        
        // BitNode et playtime
        const player = ns.getPlayer();
        const bitnode = player.bitNodeN || 1;
        const playtime = player.totalPlaytime || 0; // En millisecondes
        
        // Heure réelle
        const realTime = new Date();
        const hours = String(realTime.getHours()).padStart(2, '0');
        const minutes = String(realTime.getMinutes()).padStart(2, '0');
        const seconds = String(realTime.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        
        const purchasedServers = ns.getPurchasedServers();
        let totalPurchasedRam = 0;
        for (const s of purchasedServers) {
            totalPurchasedRam += ns.getServerMaxRam(s);
        }
        
        let totalThreads = 0;
        const allServers = ['home', ...purchasedServers];
        for (const s of allServers) {
            const procs = ns.ps(s);
            for (const p of procs) {
                totalThreads += p.threads;
            }
        }
        
        // Détecter les actions en cours par cible
        const targetActions = new Map(); // target → {hack, grow, weaken}
        
        for (const s of allServers) {
            const procs = ns.ps(s);
            for (const p of procs) {
                const target = p.args[0];
                if (!target) continue;
                
                if (!targetActions.has(target)) {
                    targetActions.set(target, {
                        hack: 0,
                        grow: 0,
                        weaken: 0
                    });
                }
                
                const actions = targetActions.get(target);
                
                if (p.filename.includes('hack.js')) {
                    actions.hack += p.threads;
                } else if (p.filename.includes('grow.js')) {
                    actions.grow += p.threads;
                } else if (p.filename.includes('weaken.js')) {
                    actions.weaken += p.threads;
                }
            }
        }
        
        // ═══════════════════════════════════════════════════════════
        // HEADER AMÉLIORÉ
        // ═══════════════════════════════════════════════════════════
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print(`║   🔥 NEXUS DASHBOARD v0.5   BN${bitnode} | Lvl ${hackLevel} | ${timeStr}   ║`);
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        // ───────────────────────────────────────────────────────────
        // ARGENT & REVENUS
        // ───────────────────────────────────────────────────────────
        
        ns.print('💰 ARGENT & REVENUS');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const moneyStr = `$${ns.formatNumber(currentMoney)}`;
        const incomeStr = `$${ns.formatNumber(incomePerSec)}/s`;
        const incomeColor = incomePerSec > 0 ? '🟢' : '🔴';
        
        ns.print(`💵 Total: ${moneyStr}`);
        ns.print(`${incomeColor} Revenu: ${incomeStr}`);
        
        const moneySparkline = generateSparkline(moneyHistory);
        ns.print(`📈 Tendance: ${moneySparkline}`);
        ns.print('');
        
        // ───────────────────────────────────────────────────────────
        // HACKING
        // ───────────────────────────────────────────────────────────
        
        ns.print('🎯 HACKING');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        ns.print(`🎓 Niveau: ${hackLevel}`);
        ns.print(`⚡ Threads actifs: ${ns.formatNumber(totalThreads)}`);
        ns.print(`🎯 Cibles: ${targetActions.size}`);
        
        // Barres de progression avec actions
        const targetList = Array.from(targetActions.keys()).slice(0, 5);
        for (const target of targetList) {
            const currentTargetMoney = ns.getServerMoneyAvailable(target);
            const maxTargetMoney = ns.getServerMaxMoney(target);
            const currentSec = ns.getServerSecurityLevel(target);
            const minSec = ns.getServerMinSecurityLevel(target);
            
            const moneyPercent = maxTargetMoney > 0 ? (currentTargetMoney / maxTargetMoney) * 100 : 0;
            const secReady = currentSec < minSec + 5;
            const moneyReady = moneyPercent > 90;
            const isReady = secReady && moneyReady;
            
            const bar = generateProgressBar(moneyPercent, 20);
            const percentStr = moneyPercent.toFixed(1).padStart(5);
            
            // Icônes actions
            const actions = targetActions.get(target);
            let actionIcon = '';
            
            if (actions.hack > 0) actionIcon = '💰';
            else if (actions.grow > 0) actionIcon = '🌱';
            else if (actions.weaken > 0) actionIcon = '🔧';
            
            // Status ready
            const statusIcon = isReady ? '🟢' : '🔴';
            
            ns.print(`  ${target.padEnd(20)} ${statusIcon}${actionIcon} ${bar} ${percentStr}%`);
        }
        ns.print('');
        
        // ───────────────────────────────────────────────────────────
        // RAM & SERVEURS
        // ───────────────────────────────────────────────────────────
        
        ns.print('💾 RAM & SERVEURS');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const homeRamPercent = (homeUsedRam / homeRam) * 100;
        const homeBar = generateProgressBar(homeRamPercent, 20);
        
        ns.print(`🏠 Home: ${ns.formatRam(homeUsedRam)} / ${ns.formatRam(homeRam)}`);
        ns.print(`   ${homeBar} ${homeRamPercent.toFixed(1)}%`);
        ns.print('');
        
        ns.print(`🖥️  Serveurs achetés: ${purchasedServers.length}/25`);
        ns.print(`📊 RAM totale: ${ns.formatRam(totalPurchasedRam)}`);
        
        const maxPossibleRam = 1048576 * 25;
        const upgradePercent = (totalPurchasedRam / maxPossibleRam) * 100;
        const upgradeBar = generateProgressBar(upgradePercent, 20);
        
        ns.print(`🔧 Upgrade: ${upgradeBar} ${upgradePercent.toFixed(2)}%`);
        ns.print('');
        
        // ───────────────────────────────────────────────────────────
        // FOOTER AMÉLIORÉ
        // ───────────────────────────────────────────────────────────
        
        const playtimeFormatted = formatPlaytime(playtime);
        ns.print(`⏱️  Playtime: ${playtimeFormatted} | 🔄 Update: ${UPDATE_INTERVAL / 1000}s`);
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

function generateProgressBar(percent, width) {
    const filled = Math.floor((percent / 100) * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    if (percent >= 80) return `🟢 ${bar}`;
    if (percent >= 50) return `🟡 ${bar}`;
    if (percent >= 20) return `🟠 ${bar}`;
    return `🔴 ${bar}`;
}

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

function formatPlaytime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    
    const days = totalDays;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
}