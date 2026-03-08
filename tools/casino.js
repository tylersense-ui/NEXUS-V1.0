/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    const target = ns.args[0] || 200000; // 200k par défaut
    
    ns.print('=== NEXUS CASINO EXPLOIT ===');
    ns.print(`Objectif: $${(target / 1000).toFixed(0)}k`);
    ns.print('');
    
    let totalWon = 0;
    let attempts = 0;
    const maxBet = 1000000; // 1m max bet
    
    while (totalWon < target) {
        const currentMoney = ns.getServerMoneyAvailable('home');
        
        // Miser 10% de notre argent ou 1m max
        let bet = Math.min(currentMoney * 0.1, maxBet);
        bet = Math.max(bet, 1); // Au moins 1$
        
        // Jouer au blackjack (meilleure cote)
        const won = ns.casino.roulette(bet, 'red');
        
        if (won > 0) {
            totalWon += won;
            ns.print(`✓ Gagné: $${won.toFixed(0)} | Total: $${totalWon.toFixed(0)}`);
        }
        
        attempts++;
        
        if (attempts % 10 === 0) {
            ns.print(`Tentatives: ${attempts} | Gagné: $${totalWon.toFixed(0)}`);
        }
        
        await ns.sleep(100);
        
        // Sécurité : arrêter après 1000 tentatives
        if (attempts > 1000) {
            ns.print('⚠️  Limite de tentatives atteinte');
            break;
        }
    }
    
    ns.print('');
    ns.print('=== TERMINÉ ===');
    ns.print(`Total gagné: $${totalWon.toFixed(0)}`);
    ns.print(`Argent final: $${ns.getServerMoneyAvailable('home').toFixed(0)}`);
}