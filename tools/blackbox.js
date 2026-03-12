/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail(); // Ouvre la fenêtre de monitoring
    ns.print("🚀 Boîte Noire Omni-Solveur v2.0 activée.");

    while (true) {
        ns.clearLog(); // Évite que la fenêtre tail ne sature
        ns.print(`Dernier scan : ${new Date().toLocaleTimeString()}`);
        ns.print("Scan du réseau et résolution des contrats...");

        const servers = ["home"];
        for (let i = 0; i < servers.length; i++) {
            const host = servers[i];
            // Découverte des serveurs
            ns.scan(host).forEach(s => {
                if (!servers.includes(s)) servers.push(s);
            });

            // Gestion des contrats
            const contracts = ns.ls(host, ".cct");
            for (const file of contracts) {
                const type = ns.codingcontract.getContractType(file, host);
                const data = ns.codingcontract.getData(file, host);
                const sol = solve(type, data);

                if (sol !== null) {
                    const reward = ns.codingcontract.attempt(sol, file, host);
                    if (reward) {
                        // Notification "Toast" en haut à droite de l'écran
                        ns.toast(`Contrat résolu sur ${host} !`, "success", 5000);
                        
                        ns.print(`✅ [${host}] ${type} RÉSOLU !`);
                        ns.tprint(`✅ [${host}] ${type} sur ${host} : ${reward}`);
                    } else {
                        ns.print(`❌ [${host}] ${type} ÉCHEC.`);
                        ns.toast(`Échec contrat sur ${host}`, "error", 5000);
                    }
                }
            }
        }
        await ns.sleep(30000); // Attend 30 secondes avant le prochain scan
    }
}

function solve(type, data) {
    switch (type) {
        case "Find Largest Prime Factor": {
            let n = data, f = 2;
            while (f * f <= n) { if (n % f === 0) n /= f; else f++; }
            return n;
        }
        case "Subarray with Maximum Sum": {
            let mS = data[0], cS = data[0];
            for (let i = 1; i < data.length; i++) { cS = Math.max(data[i], cS + data[i]); mS = Math.max(mS, cS); }
            return mS;
        }
        case "Total Ways to Sum": {
            let ways = [1].concat(Array(data).fill(0));
            for (let i = 1; i < data; i++) for (let j = i; j <= data; j++) ways[j] += ways[j - i];
            return ways[data];
        }
        case "Total Ways to Sum II": {
            let n2 = data[0], arr = data[1], ways2 = [1].concat(Array(n2).fill(0));
            for (let i = 0; i < arr.length; i++) for (let j = arr[i]; j <= n2; j++) ways2[j] += ways2[j - arr[i]];
            return ways2[n2];
        }
        case "Find All Valid Math Expressions": {
            let numStr = data[0], target = data[1], resMath = [];
            const dfsMath = (idx, path, evalVal, multVal) => {
                if (idx === numStr.length) { if (evalVal === target) resMath.push(path); return; }
                for (let i = idx; i < numStr.length; i++) {
                    if (i !== idx && numStr[idx] === '0') break;
                    let curStr = numStr.substring(idx, i + 1), curNum = parseInt(curStr, 10);
                    if (idx === 0) dfsMath(i + 1, path + curStr, curNum, curNum);
                    else {
                        dfsMath(i + 1, path + "+" + curStr, evalVal + curNum, curNum);
                        dfsMath(i + 1, path + "-" + curStr, evalVal - curNum, -curNum);
                        dfsMath(i + 1, path + "*" + curStr, evalVal - multVal + multVal * curNum, multVal * curNum);
                    }
                }
            };
            dfsMath(0, "", 0, 0);
            return resMath;
        }
        case "Spiralize Matrix": {
            let resSp = [], m = data.map(r => [...r]);
            while (m.length) {
                resSp.push(...m.shift());
                m.forEach(r => resSp.push(r.pop()));
                m.reverse().forEach(r => r.reverse());
            }
            return resSp.filter(x => x !== undefined);
        }
        case "Array Jumping Game": {
            let maxJ = 0;
            for (let i = 0; i <= maxJ; i++) { maxJ = Math.max(maxJ, i + data[i]); if (maxJ >= data.length - 1) return 1; }
            return 0;
        }
        case "Array Jumping Game II": {
            let jumps = 0, curEnd = 0, curFarthest = 0;
            for (let i = 0; i < data.length - 1; i++) {
                curFarthest = Math.max(curFarthest, i + data[i]);
                if (i === curEnd) { jumps++; curEnd = curFarthest; }
            }
            return curEnd >= data.length - 1 ? jumps : 0;
        }
        case "Merge Overlapping Intervals": {
            data.sort((a, b) => a[0] - b[0]);
            let merged = [data[0]];
            for (let i = 1; i < data.length; i++) {
                let last = merged[merged.length - 1];
                if (data[i][0] <= last[1]) last[1] = Math.max(last[1], data[i][1]);
                else merged.push(data[i]);
            }
            return merged;
        }
        case "Algorithmic Stock Trader I": {
            let p1 = 0, min1 = data[0];
            for (let x of data) { min1 = Math.min(min1, x); p1 = Math.max(p1, x - min1); }
            return p1;
        }
        case "Algorithmic Stock Trader II": {
            let p2 = 0;
            for (let i = 1; i < data.length; i++) if (data[i] > data[i - 1]) p2 += data[i] - data[i - 1];
            return p2;
        }
        case "Algorithmic Stock Trader III": {
            let b1 = -Infinity, s1 = 0, b2 = -Infinity, s2 = 0;
            for (let p of data) { b1 = Math.max(b1, -p); s1 = Math.max(s1, b1 + p); b2 = Math.max(b2, s1 - p); s2 = Math.max(s2, b2 + p); }
            return s2;
        }
        case "Algorithmic Stock Trader IV": {
            let k = data[0], prices = data[1];
            if (k >= prices.length / 2) { let p = 0; for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i-1]) p += prices[i] - prices[i-1]; return p; }
            let dp = Array(k + 1).fill(0).map(() => Array(prices.length).fill(0));
            for (let i = 1; i <= k; i++) {
                let maxDiff = -prices[0];
                for (let j = 1; j < prices.length; j++) { dp[i][j] = Math.max(dp[i][j - 1], prices[j] + maxDiff); maxDiff = Math.max(maxDiff, dp[i - 1][j] - prices[j]); }
            }
            return dp[k][prices.length - 1] || 0;
        }
        case "Minimum Path Sum in a Triangle": {
            let tri = data.map(row => [...row]); 
            for (let i = tri.length - 2; i >= 0; i--) for (let j = 0; j <= i; j++) tri[i][j] += Math.min(tri[i+1][j], tri[i+1][j+1]);
            return tri[0][0];
        }
        case "Unique Paths in a Grid I": {
            let r = data[0], c = data[1], dp1 = Array(c).fill(1);
            for (let i = 1; i < r; i++) for (let j = 1; j < c; j++) dp1[j] += dp1[j - 1];
            return dp1[c - 1];
        }
        case "Unique Paths in a Grid II": {
            let grid = data, c2 = grid[0].length, dp2 = Array(c2).fill(0);
            dp2[0] = 1;
            for (let i = 0; i < grid.length; i++) for (let j = 0; j < c2; j++) { if (grid[i][j] === 1) dp2[j] = 0; else if (j > 0) dp2[j] += dp2[j - 1]; }
            return dp2[c2 - 1];
        }
        case "Shortest Path in a Grid": {
            let g = data, rows = g.length, cols = g[0].length;
            let queue = [[0, 0, ""]], visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
            visited[0][0] = true;
            while (queue.length > 0) {
                let [x, y, path] = queue.shift();
                if (x === rows - 1 && y === cols - 1) return path;
                let dirs = [[-1,0,'U'], [1,0,'D'], [0,-1,'L'], [0,1,'R']];
                for (let [dx, dy, dir] of dirs) {
                    let nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && g[nx][ny] === 0 && !visited[nx][ny]) { visited[nx][ny] = true; queue.push([nx, ny, path + dir]); }
                }
            }
            return "";
        }
        case "Generate IP Addresses": {
            let ips = [];
            for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) for (let c = 1; c <= 3; c++) for (let d = 1; d <= 3; d++)
                if (a + b + c + d === data.length) {
                    let p = [data.slice(0, a), data.slice(a, a+b), data.slice(a+b, a+b+c), data.slice(a+b+c)];
                    if (p.every(x => parseInt(x) <= 255 && (x === "0" || x[0] !== "0"))) ips.push(p.join("."));
                }
            return ips;
        }
        case "Sanitize Parentheses in Expression": {
            let q = [data], seen = new Set(), resSan = [], f = false;
            const isV = s => { let c = 0; for (let x of s) { if (x==='(') c++; else if (x===')') c--; if (c<0) return false; } return c===0; };
            while (q.length) {
                let s = q.shift();
                if (isV(s)) { resSan.push(s); f = true; }
                if (f) continue;
                for (let i = 0; i < s.length; i++) {
                    if (s[i] !== '(' && s[i] !== ')') continue;
                    let next = s.slice(0, i) + s.slice(i + 1);
                    if (!seen.has(next)) { seen.add(next); q.push(next); }
                }
            }
            return resSan;
        }
        case "Proper 2-Coloring of a Graph": {
            let v = data[0], edges = data[1], adj = Array.from({length: v}, () => []), color = Array(v).fill(-1);
            edges.forEach(([u, w]) => { adj[u].push(w); adj[w].push(u); });
            for (let i = 0; i < v; i++) {
                if (color[i] === -1) {
                    color[i] = 0; let qGraph = [i];
                    while (qGraph.length) {
                        let node = qGraph.shift();
                        for (let neighbor of adj[node]) {
                            if (color[neighbor] === -1) { color[neighbor] = 1 - color[node]; qGraph.push(neighbor); }
                            else if (color[neighbor] === color[node]) return [];
                        }
                    }
                }
            }
            return color;
        }
        case "Compression I: RLE Compression": {
            return data.replace(/(.)\1{0,8}/g, (m, c) => m.length + c);
        }
        case "Compression II: LZ Decompression": {
            let plain = "";
            for (let i = 0, curr = 0; curr < data.length; i++) {
                let len = parseInt(data[curr++]);
                if (i % 2 === 0) { plain += data.slice(curr, curr + len); curr += len; }
                else if (len > 0) { let off = parseInt(data[curr++]); for (let j = 0; j < len; j++) plain += plain[plain.length - off]; }
            }
            return plain;
        }
        case "Compression III: LZ Compression": {
            let memo = {};
            function helper(i, is_lit, prevent_zero) {
                if (i === data.length) return "";
                let key = i + "-" + is_lit + "-" + prevent_zero;
                if (memo[key] !== undefined) return memo[key];
                let best = null;
                if (is_lit) {
                    for (let L = prevent_zero ? 1 : 0; L <= Math.min(9, data.length - i); L++) {
                        let enc = L === 0 ? "0" : String(L) + data.substring(i, i + L);
                        let rest = helper(i + L, false, L === 0);
                        if (rest !== null) { let cand = enc + rest; if (best === null || cand.length < best.length) best = cand; }
                    }
                } else {
                    for (let L = prevent_zero ? 1 : 0; L <= Math.min(9, data.length - i); L++) {
                        if (L === 0) {
                            let rest = helper(i, true, true);
                            if (rest !== null) { let cand = "0" + rest; if (best === null || cand.length < best.length) best = cand; }
                        } else {
                            for (let O = 1; O <= Math.min(9, i); O++) {
                                let valid = true;
                                for (let k = 0; k < L; k++) { if (data[i + k] !== data[i - O + k]) { valid = false; break; } }
                                if (valid) {
                                    let rest = helper(i + L, true, false);
                                    if (rest !== null) { let cand = String(L) + String(O) + rest; if (best === null || cand.length < best.length) best = cand; }
                                }
                            }
                        }
                    }
                }
                memo[key] = best; return best;
            }
            return helper(0, true, false);
        }
        case "Encryption I: Caesar Cipher": {
            let shift = data[1] % 26;
            return data[0].replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65));
        }
        case "Encryption II: Vigenère Cipher": {
            let k2 = data[1], idx2 = 0;
            return data[0].replace(/[A-Z]/g, c => {
                let shift = k2[idx2++ % k2.length].charCodeAt(0) - 65;
                return String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
            });
        }
        case "HammingCodes: Integer to Encoded Binary": {
            let enc = data.toString(2).split("").map(Number), p = 0;
            while (Math.pow(2, p) < enc.length + p + 1) p++;
            let out = Array(enc.length + p + 1).fill(0), j = 0;
            for (let i = 1; i < out.length; i++) if (Math.log2(i) % 1 !== 0) out[i] = enc[j++];
            for (let i = 0; i < p; i++) { let parityPos = Math.pow(2, i), xorSum = 0; for (let k = 1; k < out.length; k++) if ((k & parityPos) === parityPos) xorSum ^= out[k]; out[parityPos] = xorSum; }
            out[0] = out.reduce((a, b) => a ^ b);
            return out.join("");
        }
        case "HammingCodes: Encoded Binary to Integer": {
            let bin = data.split("").map(Number), err = 0;
            for (let i = 1; i < bin.length; i++) if (bin[i] === 1) err ^= i;
            if (err !== 0) bin[err] ^= 1;
            let decoded = "";
            for (let i = 1; i < bin.length; i++) if (Math.log2(i) % 1 !== 0) decoded += bin[i];
            return parseInt(decoded, 2);
        }
        default: return null;
    }
}