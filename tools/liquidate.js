/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.0 - Stock Liquidation (URGENCE)                ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/liquidate.js
 * @version     0.9.0
 * @description Vendre TOUTES les positions en bourse IMMÉDIATEMENT
 * 
 * @usage
 * run /tools/liquidate.js
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   🚨 LIQUIDATION URGENCE - VENTE TOTALE                   ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    
    // Vérifier accès bourse
    if (!ns.stock.hasWSEAccount()) {
        ns.print('❌ Pas d\'accès à la bourse');
        return;
    }
    
    if (!ns.stock.hasTIXAPIAccess()) {
        ns.print('❌ Pas d\'API TIX');
        return;
    }
    
    const symbols = ns.stock.getSymbols();
    
    let totalValue = 0;
    let totalProfit = 0;
    let positionsSold = 0;
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('VENTE EN COURS');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const sym of symbols) {
        const [shares, avgPrice] = ns.stock.getPosition(sym);
        
        if (shares > 0) {
            const currentPrice = ns.stock.getPrice(sym);
            const salePrice = ns.stock.sellStock(sym, shares);
            
            if (salePrice > 0) {
                const revenue = salePrice * shares;
                const cost = avgPrice * shares;
                const profit = revenue - cost;
                
                totalValue += revenue;
                totalProfit += profit;
                positionsSold++;
                
                const profitColor = profit > 0 ? '🟢' : '🔴';
                
                ns.print(`${profitColor} ${sym.padEnd(5)} ${ns.formatNumber(shares).padStart(10)} @ $${ns.formatNumber(salePrice)}`);
                ns.print(`   P/L: $${ns.formatNumber(profit)}`);
            } else {
                ns.print(`❌ ${sym}: Échec vente`);
            }
        }
    }
    
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print('');
    ns.print('RÉSUMÉ');
    ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ns.print(`✅ Positions vendues: ${positionsSold}`);
    ns.print(`💰 Revenu total: $${ns.formatNumber(totalValue)}`);
    
    const profitColor = totalProfit > 0 ? '🟢' : '🔴';
    ns.print(`${profitColor} P/L Total: $${ns.formatNumber(totalProfit)}`);
    ns.print('');
    
    const finalCash = ns.getServerMoneyAvailable('home');
    ns.print(`💵 Cash disponible: $${ns.formatNumber(finalCash)}`);
    ns.print('');
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   ✅ LIQUIDATION TERMINÉE                                 ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
}