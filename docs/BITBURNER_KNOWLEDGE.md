# 📚 BITBURNER v2.8.1 - CONNAISSANCE COMPLÈTE

**Document de référence exhaustif**  
**Création** : 2026-03-11  
**Version** : 1.0  
**Source** : Session de développement NEXUS Framework

---

## 📑 TABLE DES MATIÈRES

1. [Mécaniques Fondamentales](#1-mécaniques-fondamentales)
2. [NetScript API](#2-netscript-api)
3. [Système d'Augmentations](#3-système-daugmentations)
4. [Factions](#4-factions)
5. [BitNodes](#5-bitnodes)
6. [Stratégies](#6-stratégies)
7. [Bugs et Fixes](#7-bugs-et-fixes)
8. [Architecture NEXUS](#8-architecture-nexus)
9. [Leçons Apprises](#9-leçons-apprises)

---

## 1. MÉCANIQUES FONDAMENTALES

### 1.1 Le Core Loop (BitNode-1)

```
1. Hack servers → Gagner argent + XP hacking
2. Acheter RAM (home + serveurs achetés) → Augmenter threads
3. Rejoindre factions → Gagner rep → Acheter augmentations
4. Installer augmentations → SOFT RESET → Recommencer PLUS FORT
5. Déverrouiller Daedalus → The Red Pill → Hack w0r1d_d43m0n → Détruire BitNode
```

### 1.2 Rooting vs Hacking

**CRITIQUE** : Ce sont deux mécaniques DIFFÉRENTES !

#### NUKE (Rooting)
- **Requis** : Outils de port (0-5) seulement
- **Pas de niveau hacking requis**
- **Fonction** : `ns.nuke(hostname)`
- **Effet** : Obtenir accès root
- **Usage** : Permet d'exécuter scripts sur le serveur

#### HACK (Exploitation)
- **Requis** : Niveau hacking ≥ reqLevel du serveur
- **Fonction** : `await ns.hack(hostname)`
- **Effet** : Voler argent du serveur
- **Usage** : Gagner de l'argent

**Exemple critique** :
```javascript
// ❌ ERREUR FRÉQUENTE
function crack(hostname) {
    const reqLevel = ns.getServerRequiredHackingLevel(hostname);
    if (reqLevel > playerLevel) return false; // FAUX !
    ns.nuke(hostname);
}

// ✅ CORRECT
function crack(hostname) {
    const reqPorts = ns.getServerNumPortsRequired(hostname);
    if (reqPorts > portsDisponibles) return false;
    // Ouvrir les ports
    ns.nuke(hostname); // PAS de check niveau !
}
```

**Impact** : Cette erreur bloquait 13 serveurs haute sécurité (lvl 812-1303) qui auraient pu être utilisés comme **hôtes pour workers**.

### 1.3 Outils de Port

| Programme | Ports | Prix | Hacking | Darkweb |
|---|---:|---|---:|---|
| BruteSSH.exe | +1 | $500k | 50 | ✓ |
| FTPCrack.exe | +2 | $1.5m | 100 | ✓ |
| relaySMTP.exe | +3 | $5m | 250 | ✓ |
| HTTPWorm.exe | +4 | $30m | 500 | ✓ |
| SQLInject.exe | +5 | $250m | 750 | ✓ |

**Note** : Peuvent aussi être créés manuellement avec `ns.singularity.createProgram()` (Singularity API).

### 1.4 Serveurs - Stats Clés

```javascript
ns.getServerMaxMoney(host)          // Argent maximum
ns.getServerMoneyAvailable(host)    // Argent actuel
ns.getServerMinSecurityLevel(host)  // Sécurité minimum
ns.getServerSecurityLevel(host)     // Sécurité actuelle
ns.getServerRequiredHackingLevel(host) // Niveau requis HACK
ns.getServerNumPortsRequired(host)  // Ports requis NUKE
ns.getServerMaxRam(host)            // RAM max
ns.getServerUsedRam(host)           // RAM utilisée
```

### 1.5 Actions de Hacking

#### hack()
- **Durée** : ~1-4 minutes (dépend sécurité + niveau)
- **Effet** : Vole argent (% configurable)
- **Sécurité** : +0.002 par thread
- **Formule threads** : `ns.hackAnalyzeThreads(target, amount)`

#### grow()
- **Durée** : ~3.2× temps hack()
- **Effet** : Augmente argent serveur (multiplicateur)
- **Sécurité** : +0.004 par thread
- **Formule threads** : `ns.growthAnalyze(target, multiplier)`

#### weaken()
- **Durée** : ~4× temps hack()
- **Effet** : Réduit sécurité
- **Réduction** : -0.05 par thread
- **Formule threads** : `Math.ceil(augmentationSécurité / 0.05)`

**Important** : Toutes ces fonctions sont **async** et doivent être **await**.

### 1.6 Batching HWGW

**Principe** : Synchroniser hack, weaken, grow, weaken pour maximiser profit.

```
Batch parfait :
1. HACK   → Vole X% argent (delay calculé)
2. WEAKEN → Compense sécurité du hack (+Y ms)
3. GROW   → Restaure argent volé (+2Y ms)
4. WEAKEN → Compense sécurité du grow (+3Y ms)

Tous finissent dans un intervalle de 20ms
```

**Sans Formulas.exe** :
- Utiliser `ns.hackAnalyzeThreads()`, `ns.growthAnalyze()`
- Delays FIXES : 0ms, 50ms, 100ms, 150ms

**Avec Formulas.exe** :
- Calculs précis : `ns.formulas.hacking.hackPercent()`, `growPercent()`
- Delays calculés pour synchronisation parfaite

### 1.7 RAM Management

```javascript
// Réserve dynamique sur home
const homeRam = ns.getServerMaxRam('home');
const reservePercent = 0.05; // 5%
const minReserve = 16; // Minimum 16GB

const reserveRam = Math.max(minReserve, homeRam * reservePercent);
const availableRam = homeRam - usedRam - reserveRam;
```

**Pourquoi dynamique ?**
- Early game : 8GB total → 0.4GB réservés
- Late game : 131TB total → 6.5TB réservés
- Évite hard-code qui casse au reset

---

## 2. NETSCRIPT API

### 2.1 API Toujours Disponibles (BN1)

#### Hacking
```javascript
await ns.hack(target)
await ns.grow(target)
await ns.weaken(target)
ns.hackAnalyzeThreads(target, amount)
ns.growthAnalyze(target, multiplier)
ns.hackAnalyzeSecurity(threads, target)
ns.growthAnalyzeSecurity(threads, target)
ns.hackAnalyzeChance(target)
ns.getHackTime(target)
ns.getGrowTime(target)
ns.getWeakenTime(target)
```

#### Serveur Info
```javascript
ns.getServer(host) // Objet complet
ns.getServerMaxMoney(host)
ns.getServerMoneyAvailable(host)
ns.getServerMinSecurityLevel(host)
ns.getServerSecurityLevel(host)
ns.getServerMaxRam(host)
ns.getServerUsedRam(host)
ns.getServerRequiredHackingLevel(host)
ns.getServerNumPortsRequired(host)
ns.hasRootAccess(host)
```

#### Réseau
```javascript
ns.scan(host)               // Serveurs voisins
ns.nuke(host)               // Root access
ns.brutessh(host)           // Ouvrir port 1
ns.ftpcrack(host)           // Ouvrir port 2
ns.relaysmtp(host)          // Ouvrir port 3
ns.httpworm(host)           // Ouvrir port 4
ns.sqlinject(host)          // Ouvrir port 5
```

#### Processus
```javascript
ns.exec(script, host, threads, ...args)  // PID ou 0
ns.scp(files, dest, source)              // bool
ns.ps(host)                              // [{filename, threads, args, pid}]
ns.kill(pid, host)                       // bool
ns.killall(host)                         // bool
```

#### Serveurs Achetés
```javascript
ns.getPurchasedServers()                 // string[]
ns.purchaseServer(name, ram)             // hostname ou ""
ns.getPurchasedServerCost(ram)           // number
ns.upgradePurchasedServer(host, ram)     // bool
ns.getPurchasedServerUpgradeCost(host, ram) // number ou Infinity
ns.getPurchasedServerMaxRam()            // 1048576 (1PB)
ns.getPurchasedServerLimit()             // 25
```

#### Joueur
```javascript
ns.getPlayer()              // Objet complet
ns.getHackingLevel()        // number
```

#### Utilitaires
```javascript
ns.sleep(ms)
ns.print(msg)
ns.tprint(msg)
ns.clearLog()
ns.disableLog(fn)
ns.enableLog(fn)
ns.tail(pid)
ns.formatNumber(num)
ns.formatRam(bytes)
ns.args                     // Arguments du script
ns.getScriptName()
ns.getHostname()
ns.fileExists(file, host)
ns.read(file)
ns.write(file, data, mode)
ns.wget(url, file)
```

### 2.2 Formulas.exe (Optionnel)

**Prix** : $5B  
**Requis** : BN5 ou Source-File 5

```javascript
// Check disponibilité
const hasFormulas = ns.fileExists("Formulas.exe");

// Hacking
ns.formulas.hacking.hackPercent(server, player)
ns.formulas.hacking.hackChance(server, player)
ns.formulas.hacking.hackTime(server, player)
ns.formulas.hacking.growTime(server, player)
ns.formulas.hacking.weakenTime(server, player)
ns.formulas.hacking.growPercent(server, threads, player, cores)

// Hacknet
ns.formulas.hacknetNodes.moneyGainRate(level, ram, cores, mult)
ns.formulas.hacknetServers.hashGainRate(level, ramUsed, maxRam, cores, mult)
```

**Piège** : `ns.formulas.hacking.growPercent()` **NE DOIT PAS** être appelé en boucle (crash parser).

### 2.3 Singularity API (NON disponible BN1)

**Requis** : BN4 ou Source-File 4

```javascript
ns.singularity.applyToCompany(company, field)
ns.singularity.workForCompany(company)
ns.singularity.joinFaction(faction)
ns.singularity.workForFaction(faction, workType)
ns.singularity.purchaseAugmentation(faction, aug)
ns.singularity.installAugmentations(callback)
ns.singularity.createProgram(program)
ns.singularity.getFactionRep(faction)      // Lire rep actuelle
ns.singularity.purchaseTor()
```

**Sans Singularity** : Tout doit être fait **manuellement** dans le jeu.

### 2.4 Stock Market API

```javascript
// Check accès
ns.stock.hasWSEAccount()        // Wall Street Exchange
ns.stock.hasTIXAPIAccess()      // TIX API Access (requis)
ns.stock.has4SDataTIXAPI()      // 4S Market Data (optionnel)

// Trading
ns.stock.getSymbols()           // string[] tous les symboles
ns.stock.getPrice(symbol)       // Prix actuel
ns.stock.getPosition(symbol)    // [shares, avgPrice, sharesShort, avgPriceShort]
ns.stock.buyStock(symbol, shares) // Prix ou 0
ns.stock.sellStock(symbol, shares) // Prix ou 0
ns.stock.getMaxShares(symbol)   // Max achetable

// Analyse (4S Data requis)
ns.stock.getForecast(symbol)    // 0-1 (>0.5 = monter, <0.5 = descendre)
ns.stock.getVolatility(symbol)  // 0-1 (risque)
```

**Coûts** :
- WSE Account : $200m
- TIX API : $5b
- 4S Market Data : $1b
- 4S Market Data TIX API : $25b

### 2.5 Hacknet API

```javascript
ns.hacknet.numNodes()
ns.hacknet.purchaseNode()
ns.hacknet.getPurchaseNodeCost()
ns.hacknet.getLevelUpgradeCost(i, n)
ns.hacknet.getRamUpgradeCost(i, n)
ns.hacknet.getCoreUpgradeCost(i, n)
ns.hacknet.upgradeLevel(i, n)
ns.hacknet.upgradeRam(i, n)
ns.hacknet.upgradeCore(i, n)
ns.hacknet.getNodeStats(i)  // {level, ram, cores, production, timeOnline, totalProduction}
```

---

## 3. SYSTÈME D'AUGMENTATIONS

### 3.1 Mécaniques de Base

**Définition** : Upgrades permanents qui persistent après reset.

**Installation = Soft Reset** :
- **Perdu** : Argent, stats, niveau, programmes (BruteSSH.exe, etc.), TOR
- **Conservé** : Scripts sur home, RAM home, cores home, **augmentations installées**

**Multiplicateur de prix** : **1.9x** à CHAQUE achat

```javascript
// Exemple
Aug #1  : $1m × 1.00   = $1m
Aug #2  : $1m × 1.90   = $1.9m
Aug #3  : $1m × 3.61   = $3.61m
Aug #10 : $1m × 5.16   = $5.16m
Aug #15 : $1m × 13.5   = $13.5m
Aug #20 : $1m × 35.3   = $35.3m
Aug #30 : $1m × 241.5  = $241.5m  ← ABSURDE !
```

**Formule coût total** :
```javascript
function calculateTotalCost(basePrice, numAugs) {
    // Somme géométrique
    return basePrice * (Math.pow(1.9, numAugs) - 1) / 0.9;
}
```

**Multiplicateur moyen** :
```javascript
function calculateAvgMultiplier(numAugs) {
    const totalCost = calculateTotalCost(1, numAugs);
    return totalCost / numAugs;
}

// Exemples
10 augs : 7.56x   ← Raisonnable
15 augs : 13.5x   ← Limite
20 augs : 35x     ← Absurde
30 augs : 241x    ← Débile
```

**Seuil économique** : **10 augmentations par run** (mult. moyen < 8x)

### 3.2 Ordre d'Achat CRITIQUE

**TOUJOURS acheter du PLUS CHER au MOINS CHER !**

```
✅ CORRECT
1. QLink             $25t × 1.00 = $25t
2. BitRunners Link   $4.3t × 1.90 = $8.2t
3. Neuralstimulator  $3t × 3.61 = $10.8t
→ Total : $44t

❌ FAUX (ordre inversé)
1. Neuralstimulator  $3t × 1.00 = $3t
2. BitRunners Link   $4.3t × 1.90 = $8.2t
3. QLink             $25t × 3.61 = $90.25t
→ Total : $101.45t (2.3× plus cher !)
```

### 3.3 Découpage en Runs

**Stratégie** : Diviser en runs de 10 augs max.

**Ordre PHYSIQUE des runs** :
- Run 1 physique = Augs MOINS chères (multiplicateur faible)
- Run 2 physique = Augs MOYENNES
- Run 3 physique = Augs PLUS chères

**Pourquoi inversé ?**  
Après chaque reset, multiplicateur revient à 1.00 !

### 3.4 Liste Canonique (95 augmentations)

**Source** : Bitburner v2.8.1

**Catégories** :
- **93 augmentations standard**
- **NeuroFlux Governor** (stackable infiniment, exclure des calculs)
- **The Red Pill** (objectif final, $0)
- **Stanek's Gift** (3 augs - BitNode 13 requis)
- **Shadows of Anarchy** (9 augs - infiltration requis)
- **Bladeburners** (14 augs - BN6/7 requis)

**Top 10 plus chères** :
1. Hydroflame Left Arm : $2.5 **quadrillions**
2. QLink : $25T
3. Embedded Netburner V3 : $7.5T
4. Direct Memory Access : $7T
5. Graphene Bionic Spine : $6T
6. Analyze Engine : $6T
7. ECorp HVMind : $5.5T
8. Unstable Circadian : $5T
9. CordiARC Fusion : $5T
10. SPTN-97 : $4.875T

**Chaînes de prérequis** :
- Cranial Signal Processors : Gen I → Gen II → Gen III → Gen IV → Gen V
- Embedded Netburner Module : Base → Core → V2 → V3 + variantes
- Graphene Upgrades : Requis Bionic Arms/Legs/Spine/BrachiBlades
- Combat Ribs : I → II → III
- Augmented Targeting : I → II → III

### 3.5 Speedrun 30 Augs (Daedalus)

**Objectif** : Rejoindre Daedalus rapidement.

**Stratégie** : 3 runs de 10 augs

**Factions prioritaires** :
1. **CyberSec** (backdoor CSEC) - 4 augs hacking
2. **NiteSec** (backdoor avmnite-02h) - 5 augs hacking
3. **The Black Hand** (backdoor I.I.I.I) - 6 augs hacking
4. **BitRunners** (backdoor run4theh111z) - 5 augs hacking (TOP TIER)
5. **Netburners** (hacknet nodes) - 5 augs faciles
6. **Tian Di Hui** (early city) - 3 augs faciles
7. **Sector-12 + Aevum** - 2 augs

**Total** : 30 augs → Déverrouille Daedalus

---

## 4. FACTIONS

### 4.1 Hacking Factions (Backdoor Requis)

| Faction | Backdoor | Niveau | Top Augs |
|---|---|---:|---|
| CyberSec | CSEC | 50 | Synaptic, BitWire, CSP Gen I |
| NiteSec | avmnite-02h | 200 | CRTX42-AA, Neural-Retention, CSP Gen II |
| The Black Hand | I.I.I.I | 350 | Neuralstimulator, CSP Gen III |
| BitRunners | run4theh111z | 500 | Bio-neural, Neurolink, CSP Gen IV/V |

**Procédure backdoor** :
```javascript
// 1. Trouver le chemin avec scan-analyze (dans le jeu)
// 2. Naviguer manuellement : connect CSEC
// 3. Installer backdoor : backdoor
```

### 4.2 Daedalus (Endgame)

**Requirements** (Bitburner v2.8.1) :
```
30 Augmentations installées
+ $100,000,000,000 ($100B)
+ (Hacking Level 2500 OU All Combat Stats 1500)
```

**Attention** : Le "OU" est entre hacking ET combat, PAS entre les autres conditions !

**Offre exclusive** :
- **The Red Pill** : $0 (2.5B rep requis)
  - Déverrouille serveur `w0r1d_d43m0n`
  - Hacker w0r1d_d43m0n = Détruire BitNode → Source File

### 4.3 City Factions

**Early access** (facile) :
- Sector-12 : $15m
- Aevum : $40m
- Chongqing : $20m
- New Tokyo : $20m
- Ishima : $30m
- Volhaven : $50m

**Augmentations** : Généralement 2-3 augs peu chères par faction.

### 4.4 Corporation Factions

**Requis** : Travailler dans une company, stats élevées.

**Exemples** :
- ECorp : Augs très chères (ECorp HVMind $5.5T)
- MegaCorp : CordiARC Fusion $5T
- Bachman & Associates : SmartJaw $2.75T
- Clarke Incorporated : nextSENS $1.925T

### 4.5 Special Factions

**Netburners** :
- Requis : Posséder hacknet nodes
- Facile à rejoindre
- 5 augs hacknet (peu chères)

**Slum Snakes** :
- Requis : Combat stats 30, karma -9, $1m
- Augs : Augmented Targeting, Combat Rib, LuminCloaking

**Tetrads** :
- Requis : Combat + karma élevé
- Augs : Bionic Arms, HemoRecirculator

---

## 5. BITNODES

### 5.1 BitNode-1 (Starting Point)

**Nom** : Source Genesis  
**Difficulté** : Facile  
**Description** : Le BitNode par défaut, progression classique.

**Caractéristiques** :
- Pas de Singularity API (sans Source-File 4)
- Serveurs standards
- Factions standards
- Augmentations standards

**Objectif** : Atteindre Daedalus → The Red Pill → w0r1d_d43m0n

### 5.2 Source Files

**Définition** : Bonus permanents obtenus en détruisant un BitNode.

**Exemples** :
- **SF-4** : Déverrouille Singularity API
- **SF-5** : Déverrouille Formulas.exe
- **SF-6/7** : Déverrouille Bladeburners

**Progression** :
```
BN1 (first run) → Destroy → Get SF-1
→ Enter BN2 with SF-1 bonus
→ Destroy BN2 → Get SF-2
→ Enter BN3 with SF-1 + SF-2 bonuses
...
```

---

## 6. STRATÉGIES

### 6.1 Early Game (< $1m, < 32GB home)

**Priorités** :
1. Rooter tous les serveurs possibles
2. Déployer workers partout
3. Sequential WGH loop sur cibles faciles
4. Objectif : Premier $1m + premiers upgrades home

**Cibles early** :
- n00dles (0 ports, lvl 1)
- foodnstuff (0 ports, lvl 1)
- sigma-cosmetics (0 ports, lvl 5)
- joesguns (0 ports, lvl 10)
- nectar-net (0 ports, lvl 20)

### 6.2 Mid Game ($1m-$100B, 64GB-1PB)

**Priorités** :
1. Acheter 25 serveurs
2. Upgrader serveurs progressivement (8GB → 1PB)
3. Passer au batching HWGW
4. Farmer rep dans factions hacking
5. Acheter Formulas.exe ($5B)

**Cibles mid** :
- harakiri-sushi
- iron-gym
- hong-fang-tea
- phantasy
- omega-net

### 6.3 Late Game ($100B+, 1PB+ total)

**Priorités** :
1. Farmer 30 augmentations
2. Atteindre 2500 hacking OU $100B + 30 augs
3. Rejoindre Daedalus
4. Acheter The Red Pill (2.5B rep)
5. Hack w0r1d_d43m0n

**Optimisations** :
- Bourse ($5B TIX API) : +$100B-$500B passif
- Auto-batching sur 20+ cibles
- Stock manager avec forecast > 55%

### 6.4 Batching Strategies

**Phase 1** : Prep (si serveur pas optimal)
```javascript
while (security > minSec + 5) {
    dispatchWeaken();
}
while (money < maxMoney * 0.95) {
    dispatchGrow();
    dispatchWeaken();
}
```

**Phase 2** : HWGW Production
```javascript
// Calculer threads
hackThreads = hackAnalyzeThreads(target, maxMoney * 0.10);
growThreads = growthAnalyze(target, 1 / (1 - 0.10));
w1Threads = Math.ceil(hackAnalyzeSecurity(hackThreads) / 0.05);
w2Threads = Math.ceil(growthAnalyzeSecurity(growThreads) / 0.05);

// Delays (sans Formulas)
hackDelay = 0;
w1Delay = 50;
growDelay = 100;
w2Delay = 150;

// Dispatch
dispatch(hack, hackThreads, hackDelay);
dispatch(weaken, w1Threads, w1Delay);
dispatch(grow, growThreads, growDelay);
dispatch(weaken, w2Threads, w2Delay);
```

**Cycle** : 200ms entre chaque batch

### 6.5 Stock Market Strategy

**Paramètres optimaux** (équilibre) :
```javascript
FORECAST_BUY: 0.55      // Acheter si > 55%
FORECAST_SELL: 0.48     // Vendre si < 48%
VOLATILITY_MAX: 0.05    // Éviter si > 5%
POSITION_SIZE: 5-15%    // Du cash disponible
STOP_LOSS: -15%         // Vendre si perte > 15%
TAKE_PROFIT: +40%       // Vendre si gain > 40%
MAX_POSITIONS: 15       // Max 15 stocks simultanés
```

**Résultats observés** : +$100B-$200B profit en quelques heures.

---

## 7. BUGS ET FIXES

### 7.1 BUG : network.js vérifiait niveau avant nuke

**Symptôme** : 13 serveurs haute sécu (lvl 812-1303) non rootés alors que 5/5 ports.

**Cause** :
```javascript
// ❌ Code buggé
function crack(hostname) {
    const reqLevel = ns.getServerRequiredHackingLevel(hostname);
    const reqPorts = ns.getServerNumPortsRequired(hostname);
    
    if (reqLevel > this.caps.hackingLevel) return false; // ERREUR !
    if (reqPorts > this.caps.portCount) return false;
    
    // Ouvrir ports + nuke
}
```

**Fix** (v0.8.4) :
```javascript
// ✅ Code correct
function crack(hostname) {
    if (ns.hasRootAccess(hostname)) return true;
    
    const reqPorts = ns.getServerNumPortsRequired(hostname);
    
    // PAS de check niveau pour NUKE !
    if (reqPorts > this.caps.portCount) return false;
    
    // Ouvrir ports + nuke
    ns.nuke(hostname);
    return true;
}
```

**Impact** : +13 serveurs utilisables = +15% RAM réseau.

### 7.2 BUG : Delays énormes dans batcher v0.8.1

**Symptôme** : Batches synchronisés dans 10 minutes au lieu de 20ms.

**Cause** :
```javascript
// ❌ Code buggé
const now = Date.now();
const endTime = now + weakenTime + (buffer * 4);

hackDelay = endTime - now - hackTime - (buffer * 3);   // 10 MINUTES !
w1Delay = endTime - now - weakenTime - (buffer * 2);
// etc.
```

**Fix** (v0.8.2) :
```javascript
// ✅ Delays FIXES
const hackDelay = 0;
const w1Delay = 50;
const growDelay = 100;
const w2Delay = 150;
```

**Impact** : Batching fonctionne correctement.

### 7.3 BUG : growPercent() appelé en boucle

**Symptôme** : Parser crash.

**Cause** :
```javascript
// ❌ Ne JAMAIS faire ça
for (let i = 0; i < 1000; i++) {
    const grow = ns.formulas.hacking.growPercent(server, threads, player);
}
```

**Fix** : Utiliser `ns.growthAnalyze()` à la place, ou appeler growPercent() UNE SEULE FOIS.

### 7.4 BUG : manifest.txt incluait cleanup.js supprimé

**Symptôme** : deploy.js essayait de télécharger un fichier inexistant.

**Fix** : Retirer cleanup.js du manifest.

### 7.5 BUG : server-manager pas lancé au boot

**Symptôme** : Serveurs achetés mais jamais upgradés.

**Fix** (v0.9.1) : Ajouter server-manager ET stock-manager dans boot.js.

---

## 8. ARCHITECTURE NEXUS

### 8.1 Structure des Fichiers

```
/boot.js                    ← Point d'entrée (lance tout)
/core/
  orchestrator.js           ← Batching automatique
  dashboard.js              ← Monitoring visuel
  port-handler.js           ← Abstraction ports
  ram-manager.js            ← Allocation RAM dynamique
  batcher.js                ← Calculs HWGW
/hack/
  controller.js             ← Exécution jobs (silent)
/lib/
  constants.js              ← Config centralisée
  logger.js                 ← Système de logs
  capabilities.js           ← Détection outils/Formulas
  network.js                ← Scan/crack réseau
  utils.js                  ← Utilitaires
  formulas-helper.js        ← Wrapper Formulas.exe
/workers/
  hack.js                   ← 1.70GB
  grow.js                   ← 1.75GB
  weaken.js                 ← 1.75GB
/managers/
  server-manager.js         ← Achat/upgrade serveurs (auto-stop si MAX)
  stock-manager.js          ← Trading automatique
/tools/
  deploy.js                 ← Déploiement GitHub
  global-kill.js            ← Arrêt total
  network-audit.js          ← Audit réseau
  liquidate.js              ← Vente urgence bourse
  aug-planner.js            ← Planificateur 91 augs + tracking
  aug-speedrun.js           ← Guide 30 augs Daedalus
/state/
  augs-purchased.txt        ← Tracking manuel augs
/manifest.txt               ← Liste fichiers à déployer
```

### 8.2 Constants Dynamiques (v0.9.1)

```javascript
export const CONFIG = {
    HACKING: {
        // ✅ DYNAMIQUE : 5% de home RAM
        RESERVED_HOME_RAM_PERCENT: 0.05,
        MIN_RESERVED_HOME_RAM: 16,
        
        MIN_TARGET_MONEY: 50_000_000,
        SECURITY_BUFFER: 5,
        TIME_BUFFER_MS: 20,
        MAX_TARGET_DIFFICULTY: 100
    },
    
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        
        // ✅ DYNAMIQUE : Calculé selon RAM
        MIN_TARGETS: 1,
        AUTO_SCALE_TARGETS: true,
        
        CYCLE_DELAY_MS: 200
    },
    
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.10,
        MAX_THREADS_PER_JOB: 50000,
        USE_FORMULAS: true,
        
        // Pour calcul auto-targets
        ESTIMATED_RAM_PER_BATCH_GB: 30
    },
    
    STOCK: {
        FORECAST_BUY_THRESHOLD: 0.55,
        FORECAST_SELL_THRESHOLD: 0.48,
        VOLATILITY_MAX: 0.05,
        POSITION_SIZE_MIN: 0.05,
        POSITION_SIZE_MAX: 0.15,
        STOP_LOSS_PERCENT: -0.15,
        TAKE_PROFIT_PERCENT: 0.40,
        MAX_POSITIONS: 15,
        CHECK_INTERVAL_MS: 6000
    }
};
```

### 8.3 Auto-Scaling Targets

```javascript
// Calculer nombre optimal de cibles
const totalRam = ramMgr.getTotalAvailableRam();
const ramPerBatchGB = 30; // Estimation
const avgWeakenTime = 120000; // 2 min
const batchesPerTarget = Math.floor(avgWeakenTime / CYCLE_DELAY);

const maxBatches = Math.floor(totalRam / ramPerBatchGB);
maxTargets = Math.max(MIN_TARGETS, Math.floor(maxBatches / batchesPerTarget));

// Limiter au nombre hackable
const hackableCount = network.getTopTargets(maxTargets * 2).length;
maxTargets = Math.min(maxTargets, hackableCount);
```

**Résultat** :
- Early game (500GB RAM) : 1-2 cibles
- Mid game (5PB RAM) : 5-8 cibles
- Late game (26PB RAM) : 20-25 cibles

### 8.4 Batcher Hybride (avec/sans Formulas)

```javascript
export class Batcher {
    constructor(ns, network, ramMgr, portHandler, capabilities) {
        this.ns = ns;
        this.hasFormulas = ns.fileExists("Formulas.exe");
    }
    
    dispatchHWGW(target) {
        // Threads (fonctionne avec ou sans Formulas)
        if (this.hasFormulas) {
            const server = this.ns.getServer(target);
            const player = this.ns.getPlayer();
            server.hackDifficulty = server.minDifficulty;
            server.moneyAvailable = server.moneyMax;
            
            const hackPercentPerThread = this.ns.formulas.hacking.hackPercent(server, player);
            hackThreads = Math.floor(0.10 / hackPercentPerThread);
        } else {
            hackThreads = this.ns.hackAnalyzeThreads(target, maxMoney * 0.10);
        }
        
        // Reste identique
        growThreads = this.ns.growthAnalyze(target, 1 / (1 - 0.10));
        w1Threads = Math.ceil(this.ns.hackAnalyzeSecurity(hackThreads) / 0.05);
        w2Threads = Math.ceil(this.ns.growthAnalyzeSecurity(growThreads) / 0.05);
        
        // Delays FIXES (pas de Formulas requis)
        const delays = { hack: 0, w1: 50, grow: 100, w2: 150 };
        
        // Dispatch...
    }
}
```

### 8.5 Dashboard v0.9.0

**Features** :
- Header : BN{n} | Lvl {hack} | {HH:MM:SS}
- Argent : Total + Revenu/s + RECORD + Sparkline
- **Bourse** : Valeur + P/L (si positions)
- Hacking : Niveau + Threads actifs + Cibles (top 5)
  - Format : `{🟢/🔴}  {target}  {💰/🌱/🔧}    {barre} {%}`
- RAM : Home (95% réservé) + Réseau complet
- Footer : Playtime | Update 1s

**Sparkline** :
```javascript
function generateSparkline(data) {
    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    return data.map(value => {
        const normalized = (value - min) / range;
        const index = Math.floor(normalized * (chars.length - 1));
        return chars[index];
    }).join('');
}
```

---

## 9. LEÇONS APPRISES

### 9.1 Principes de Design

1. **Dynamique > Hard-code**
   - TOUJOURS calculer au runtime
   - Éviter constantes qui cassent au reset

2. **Fail-safe Defaults**
   - MIN + MAX pour toutes les valeurs
   - Exemple : `Math.max(minReserve, homeRam * percent)`

3. **Séparation des Responsabilités**
   - Orchestrator = stratégie
   - Batcher = calculs
   - Controller = exécution
   - RamManager = allocation

4. **Workers Minimaux**
   - Garder workers < 2GB
   - Tout le contrôle sur home

5. **Logs Intelligents**
   - tail() pour debug
   - tprint() pour actions importantes
   - Éviter spam terminal

### 9.2 Pièges Courants

1. **Confondre nuke() et hack()**
   - nuke = root access (ports seulement)
   - hack = voler argent (niveau requis)

2. **Oublier await sur async**
   - `await ns.hack()` TOUJOURS
   - Sinon : script crash

3. **Hard-coder la RAM réservée**
   - 32GB ok pour 131TB home
   - CRASH avec 8GB home au reset

4. **Négliger le multiplicateur 1.9x**
   - Toujours acheter cher → pas cher
   - Découper en runs de 10

5. **Appeler Formulas en boucle**
   - growPercent() UNE FOIS seulement
   - Parser crash sinon

### 9.3 Optimisations Clés

1. **Auto-scaling targets**
   - S'adapte à la RAM disponible
   - 1 cible early → 25 cibles late

2. **Batching sans Formulas**
   - Delays FIXES fonctionnent
   - Pas besoin de $5B initial

3. **Stock manager équilibré**
   - Forecast 55% buy / 48% sell
   - Stop-loss -15% / Take-profit +40%
   - Max 15 positions

4. **Server-manager auto-stop**
   - S'arrête quand 25/25 @ 1PB
   - Pas de cycles inutiles

5. **Tracking manuel augs**
   - Permet progression sans Singularity
   - mark/unmark/reset

### 9.4 Métriques de Performance

**Progression observée** :
```
Début session : $224M, 69 serveurs
Fin session   : $8.950T, 69 serveurs

Revenus :
- v0.8.3 : $568M/s
- v0.9.0 : $820M/s
- v0.9.1 : $2.120T/s (RECORD)

Multiplicateur : ×3732 en quelques heures
```

**Batching efficace** :
- 15M threads actifs
- 20+ cibles simultanées
- 26.35PB RAM utilisée (100%)

**Bourse** :
- 15 positions
- +$200B profit cumulé
- ROI ~40% moyen

### 9.5 Checklist Avant Reset

```
☐ Vendre toutes positions bourse (liquidate.js)
☐ Acheter 30 augmentations (ordre cher → pas cher)
☐ Vérifier rep suffisante pour toutes
☐ Installer augmentations
☐ RESET

☐ Redéployer framework (deploy.js)
☐ Relancer boot.js
☐ Vérifier dashboard + managers actifs
```

### 9.6 Roadmap Future

**BN1 → BN2** :
- Conserver architecture NEXUS
- Adapter aux spécificités BN2
- Acquérir Source-File 1

**Avec Singularity (SF-4)** :
- Auto-join factions
- Auto-buy augmentations
- Auto-install + reset
- Full autopilot possible

**Avec Formulas (SF-5)** :
- Batching précis
- Timing parfait
- Optimisation max

**Endgame** :
- Collection Source-Files
- BitNode speedruns
- Achievement hunting

---

## 📚 CONCLUSION

Ce document représente **l'intégralité des connaissances** acquises durant le développement du framework NEXUS pour Bitburner v2.8.1.

**Points clés** :
- ✅ Différence nuke vs hack parfaitement comprise
- ✅ Système d'augmentations maîtrisé (multiplicateur 1.9x)
- ✅ Architecture dynamique résistante aux resets
- ✅ Batching HWGW fonctionnel avec/sans Formulas
- ✅ Auto-scaling intelligent
- ✅ Stock market profitable
- ✅ 95 augmentations cataloguées

**Résultats** :
- $8.950T accumulés
- $2.120T/s revenus peak
- 26.35PB RAM optimisée
- 30 augs roadmap établie

**"Pourquoi est la vraie seule source de pouvoir."** - Le Mérovingien

---

**Version** : 1.0  
**Date** : 2026-03-11  
**Framework** : NEXUS v0.9.1-DYNAMIC  
**Auteur** : Claude (AI) + Opérateur Humain

**FIN DU DOCUMENT**
