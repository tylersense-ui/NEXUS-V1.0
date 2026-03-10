/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.0 - Stock Manager                              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/stock-manager.js
 * @version     0.9.0
 * @description Trading automatique boursier
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    // Vérifier accès bourse
    if (!ns.stock.hasWSEAccount()) {
        ns.print('❌ WSE Account requis');
        return;
    }
    
    if (!ns.stock.hasTIXAPIAccess()) {
        ns.print('❌ TIX API Access requis');
        return;
    }
    
    const has4S = ns.stock.has4SDataTIXAPI();
    const CHECK_INTERVAL = 6000; // 6s (un tick du marché)
    const FORECAST_THRESHOLD = 0.55; // Acheter si >55% chance de monter
    const MIN_CASH_RESERVE = 1e9; // Garder $1B minimum
    
    ns.print('╔═══════════════════════════════════════════════════════════╗');
    ns.print('║   📈 NEXUS STOCK MANAGER v0.9.0                           ║');
    ns.print('╚═══════════════════════════════════════════════════════════╝');
    ns.print('');
    ns.print(`✅ WSE Account: OK`);
    ns.print(`✅ TIX API: OK`);
    ns.print(`${has4S ? '✅' : '❌'} 4S Market Data: ${has4S ? 'OK' : 'MANQUANT'}`);
    ns.print('');
    
    if (!has4S) {
        ns.print('⚠️  Sans 4S Data, trading basique uniquement (moins efficace)');
        ns.print('');
    }
    
    const symbols = ns.stock.getSymbols();
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   📈 NEXUS STOCK MANAGER                                  ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const money = ns.getServerMoneyAvailable('home');
        
        let totalValue = 0;
        let totalProfit = 0;
        let positionsCount = 0;
        
        // ════════════════════════════════════════════════════
        // GESTION POSITIONS EXISTANTES
        // ════════════════════════════════════════════════════
        
        for (const sym of symbols) {
            const [shares, avgPrice] = ns.stock.getPosition(sym);
            
            if (shares === 0) continue;
            
            positionsCount++;
            const currentPrice = ns.stock.getPrice(sym);
            const value = shares * currentPrice;
            const profit = shares * (currentPrice - avgPrice);
            
            totalValue += value;
            totalProfit += profit;
            
            let forecast = 0.5;
            
            if (has4S) {
                forecast = ns.stock.getForecast(sym);
            } else {
                // Approximation basique sans 4S
                const priceHistory = [];
                for (let i = 0; i < 5; i++) {
                    priceHistory.push(ns.stock.getPrice(sym));
                    await ns.sleep(100);
                }
                
                const trend = priceHistory[priceHistory.length - 1] > priceHistory[0];
                forecast = trend ? 0.6 : 0.4;
            }
            
            // VENDRE si forecast <45% (va baisser)
            if (forecast < 0.45) {
                const sellPrice = ns.stock.sellStock(sym, shares);
                
                if (sellPrice > 0) {
                    ns.print(`📉 VENTE: ${sym} (${ns.formatNumber(shares)} @ $${ns.formatNumber(sellPrice)})`);
                    ns.print(`   Profit: $${ns.formatNumber(profit)}`);
                }
            }
        }
        
        // ════════════════════════════════════════════════════
        // ACHATS NOUVEAUX
        // ════════════════════════════════════════════════════
        
        const availableCash = Math.max(0, money - MIN_CASH_RESERVE);
        
        if (availableCash > 0) {
            const opportunities = [];
            
            for (const sym of symbols) {
                const [shares] = ns.stock.getPosition(sym);
                
                // Skip si on a déjà cette position
                if (shares > 0) continue;
                
                let forecast = 0.5;
                
                if (has4S) {
                    forecast = ns.stock.getForecast(sym);
                } else {
                    // Approximation basique
                    const volatility = ns.stock.getVolatility(sym);
                    forecast = 0.5 + (Math.random() * 0.2 - 0.1);
                }
                
                if (forecast > FORECAST_THRESHOLD) {
                    opportunities.push({
                        sym: sym,
                        forecast: forecast,
                        price: ns.stock.getPrice(sym),
                        maxShares: ns.stock.getMaxShares(sym)
                    });
                }
            }
            
            // Trier par forecast (meilleurs en premier)
            opportunities.sort((a, b) => b.forecast - a.forecast);
            
            // Acheter les 3 meilleurs
            for (const opp of opportunities.slice(0, 3)) {
                const maxAffordable = Math.floor(availableCash / opp.price);
                const sharesToBuy = Math.min(maxAffordable, opp.maxShares);
                
                if (sharesToBuy > 0) {
                    const buyPrice = ns.stock.buyStock(opp.sym, sharesToBuy);
                    
                    if (buyPrice > 0) {
                        ns.print(`📈 ACHAT: ${opp.sym} (${ns.formatNumber(sharesToBuy)} @ $${ns.formatNumber(buyPrice)})`);
                        ns.print(`   Forecast: ${(opp.forecast * 100).toFixed(1)}%`);
                        
                        // Réduire le cash disponible
                        break; // Un achat par cycle pour éviter de tout dépenser
                    }
                }
            }
        }
        
        // ════════════════════════════════════════════════════
        // RAPPORT
        // ════════════════════════════════════════════════════
        
        ns.print('');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('PORTFOLIO');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print(`💰 Cash: $${ns.formatNumber(money)}`);
        ns.print(`📊 Valeur actions: $${ns.formatNumber(totalValue)}`);
        ns.print(`${totalProfit > 0 ? '🟢' : '🔴'} P/L Total: $${ns.formatNumber(totalProfit)}`);
        ns.print(`📈 Positions: ${positionsCount}/${symbols.length}`);
        ns.print('');
        ns.print(`⏱️  Prochain check: ${CHECK_INTERVAL / 1000}s`);
        
        await ns.sleep(CHECK_INTERVAL);
    }
}