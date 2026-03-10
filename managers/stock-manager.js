/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.9.1 - Stock Manager (ÉQUILIBRE PARFAIT)          ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { CONFIG } from "/lib/constants.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();
    
    if (!ns.stock.hasWSEAccount()) {
        ns.print('❌ Pas d\'accès bourse (acheter WSE Account)');
        return;
    }
    
    if (!ns.stock.hasTIXAPIAccess()) {
        ns.print('❌ Pas d\'API TIX (acheter TIX API Access)');
        return;
    }
    
    const CHECK_INTERVAL = CONFIG.STOCK.CHECK_INTERVAL_MS;
    const FORECAST_BUY = CONFIG.STOCK.FORECAST_BUY_THRESHOLD;
    const FORECAST_SELL = CONFIG.STOCK.FORECAST_SELL_THRESHOLD;
    const MAX_VOLATILITY = CONFIG.STOCK.VOLATILITY_MAX;
    const POSITION_MIN = CONFIG.STOCK.POSITION_SIZE_MIN;
    const POSITION_MAX = CONFIG.STOCK.POSITION_SIZE_MAX;
    const STOP_LOSS = CONFIG.STOCK.STOP_LOSS_PERCENT;
    const TAKE_PROFIT = CONFIG.STOCK.TAKE_PROFIT_PERCENT;
    const MAX_POSITIONS = CONFIG.STOCK.MAX_POSITIONS;
    
    while (true) {
        ns.clearLog();
        
        ns.print('╔═══════════════════════════════════════════════════════════╗');
        ns.print('║   📈 NEXUS STOCK MANAGER v0.9.1 (ÉQUILIBRE)              ║');
        ns.print('╚═══════════════════════════════════════════════════════════╝');
        ns.print('');
        
        const symbols = ns.stock.getSymbols();
        const cash = ns.getServerMoneyAvailable('home');
        
        let totalValue = 0;
        let totalProfit = 0;
        let positionCount = 0;
        
        for (const sym of symbols) {
            const [shares, avgPrice] = ns.stock.getPosition(sym);
            
            if (shares > 0) {
                positionCount++;
                const currentPrice = ns.stock.getPrice(sym);
                const value = shares * currentPrice;
                const profit = shares * (currentPrice - avgPrice);
                
                totalValue += value;
                totalProfit += profit;
                
                const profitPercent = ((currentPrice - avgPrice) / avgPrice);
                const forecast = ns.stock.getForecast(sym);
                
                let shouldSell = false;
                let sellReason = '';
                
                if (profitPercent <= STOP_LOSS) {
                    shouldSell = true;
                    sellReason = `STOP-LOSS (${(profitPercent * 100).toFixed(1)}%)`;
                } else if (profitPercent >= TAKE_PROFIT) {
                    shouldSell = true;
                    sellReason = `TAKE-PROFIT (${(profitPercent * 100).toFixed(1)}%)`;
                } else if (forecast < FORECAST_SELL) {
                    shouldSell = true;
                    sellReason = `FORECAST ${(forecast * 100).toFixed(1)}%`;
                }
                
                if (shouldSell) {
                    const salePrice = ns.stock.sellStock(sym, shares);
                    if (salePrice > 0) {
                        ns.print(`🔴 VENTE: ${sym} (${ns.formatNumber(shares)} @ $${ns.formatNumber(salePrice)})`);
                        ns.print(`   ${sellReason}`);
                        ns.print('');
                    }
                }
            }
        }
        
        if (positionCount < MAX_POSITIONS) {
            const opportunities = [];
            
            for (const sym of symbols) {
                const [shares] = ns.stock.getPosition(sym);
                if (shares > 0) continue;
                
                const forecast = ns.stock.getForecast(sym);
                const volatility = ns.stock.getVolatility(sym);
                const price = ns.stock.getPrice(sym);
                
                if (forecast >= FORECAST_BUY && volatility <= MAX_VOLATILITY) {
                    const maxShares = ns.stock.getMaxShares(sym);
                    const score = forecast * (1 - volatility);
                    
                    opportunities.push({
                        sym,
                        forecast,
                        volatility,
                        price,
                        maxShares,
                        score
                    });
                }
            }
            
            opportunities.sort((a, b) => b.score - a.score);
            
            for (const opp of opportunities.slice(0, 2)) {
                if (positionCount >= MAX_POSITIONS) break;
                
                const investAmount = cash * (POSITION_MIN + (opp.score - FORECAST_BUY) * (POSITION_MAX - POSITION_MIN));
                const sharesToBuy = Math.min(
                    Math.floor(investAmount / opp.price),
                    opp.maxShares
                );
                
                if (sharesToBuy > 0) {
                    const buyPrice = ns.stock.buyStock(opp.sym, sharesToBuy);
                    if (buyPrice > 0) {
                        ns.print(`📈 ACHAT: ${opp.sym} (${ns.formatNumber(sharesToBuy)} @ $${ns.formatNumber(buyPrice)})`);
                        ns.print(`   Forecast: ${(opp.forecast * 100).toFixed(1)}% | Vol: ${(opp.volatility * 100).toFixed(1)}%`);
                        ns.print('');
                        positionCount++;
                    }
                }
            }
        }
        
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print('PORTFOLIO');
        ns.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ns.print(`💰 Cash: $${ns.formatNumber(cash)}`);
        ns.print(`📊 Valeur actions: $${ns.formatNumber(totalValue)}`);
        
        const profitColor = totalProfit > 0 ? '🟢' : '🔴';
        ns.print(`${profitColor} P/L Total: $${ns.formatNumber(totalProfit)}`);
        ns.print(`📈 Positions: ${positionCount}/${MAX_POSITIONS}`);
        ns.print(`⏱️  Prochain check: ${CHECK_INTERVAL / 1000}s`);
        
        await ns.sleep(CHECK_INTERVAL);
    }
}