/** @param {NS} ns */
export function readState(ns, stateName) {
    try {
        const data = ns.read(`/state/${stateName}-state.txt`);
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function writeState(ns, stateName, data) {
    ns.write(`/state/${stateName}-state.txt`, JSON.stringify(data, null, 2), 'w');
}

export function formatMoney(money) {
    if (money >= 1e12) return `$${(money / 1e12).toFixed(2)}t`;
    if (money >= 1e9) return `$${(money / 1e9).toFixed(2)}b`;
    if (money >= 1e6) return `$${(money / 1e6).toFixed(2)}m`;
    if (money >= 1e3) return `$${(money / 1e3).toFixed(2)}k`;
    return `$${money.toFixed(2)}`;
}

export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}