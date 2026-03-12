# 🎯 NEXUS v0.11.1 - PLAN D'OPTIMISATION COMPLET

**Date** : 2026-03-13
**Status** : ANALYSE DES LOGS + BACKUPS
**Objectif** : Lisser revenus, 95%+ success rate, modularité

---

## 📊 BILAN NUIT (10h de run)

### ✅ RÉUSSITES

```
💰 $430.002t (vs $13.763t départ) = ×31 en 10h !
🏆 Record $32.303t/s (vs $4.469t/s) = ×7 !
🎯 Niveau 604 (590→604 = +14 niveaux)
⚡ 15.306m threads (stable toute la nuit)
```

**Le Quantum Batcher FONCTIONNE !**

---

### ❌ PROBLÈMES IDENTIFIÉS

#### 1️⃣ **Dashboard : "26/26 serveurs" au lieu de "69/69"** 🚨

**Timeline** :
```
06:35 → 69/69 ✅
06:56 → 42/42 ❌
06:57 → 33/33 ❌
07:04 → 26/26 ❌
17:10 → 26/26 ❌ (stable toute la nuit)
```

**Analyse** :
- Ram-manager v0.9.1 scanne correctement (BFS complet)
- 99.6-99.8% RAM utilisée = preuve que tous les serveurs sont utilisés
- **Le bug est dans le DASHBOARD qui compte mal, PAS dans ram-manager**

**Action** : Vérifier dashboard.js (ligne comptage serveurs)

---

#### 2️⃣ **Success Rate 79-85%** (cible 95%+)

```
Démarrage : 83.6% ✅
+4h       : 85.5% ✅
+10h      : 79.3% ❌ (baisse !)
```

**Top échecs** : nexus-8, nexus-12, nexus-23, nexus-24 (purchased servers)

**Causes probables** :
- Timing collisions (no adaptive delay)
- Pas de recovery padding
- Delays fixes (0, 50, 100, 150ms) trop simples

**Actions** :
1. Ajouter recovery padding (2-5× grow/weaken)
2. Adaptive cycle timing (basé sur success rate)
3. Job splitting (5k threads max)

---

#### 3️⃣ **Revenus en vagues** (pas stable)

```
Tendance: ▁▁▁▁▁▂▂▂▃▃▃▄▄▅▅▆▆▆▇█
```

**Problème** : Batches se désynchronisent au fil du temps

**Causes** :
- Delays fixes au lieu d'adaptifs
- Pas de smart prep parallèle
- Pas de looping workers

**Actions** :
1. Adaptive cycle timing
2. Smart prep parallèle
3. (Future) Looping workers (late-game)

---

## 🎯 TU AS RAISON MAÎTRE - MES ERREURS

### ❌ Erreur #1 : J'ai RECRÉÉ le controller

**Ce que j'ai fait** :
- Réécrit controller.js from scratch
- Cassé l'existant qui marchait

**Ce que j'aurais dû faire** :
- Lire controller.js existant
- Améliorer progressivement

**Heureusement** : Tu as restauré depuis GitHub ✅

---

### ❌ Erreur #2 : Quantum Batcher trop monolithique

**590 lignes dans un seul fichier** :
- EV/s, FFD, padding, adaptive, telemetry...
- Difficile à maintenir
- Difficile à debugger

**Tu as raison** : Besoin de MODULARITÉ

---

## 🏗️ PLAN D'ACTION - 3 PHASES

---

## 📦 PHASE 1 : NOUVEAUX OUTILS (ce que tu demandes)

### 1️⃣ **tools/blackbox.js** - Solver de contrats

**Référence** : Bible du hacker, Chapitre 1.2

**Fonctionnalités** :
- BFS scan de tous les serveurs
- Détection fichiers .cct
- Résolution automatique (algorithmes)
- Loop toutes les 30s

**Algorithmes à implémenter** (extrait Bible) :
- Find Largest Prime Factor
- Subarray with Maximum Sum
- Total Ways to Sum
- Algorithmic Stock Trader I & II
- Generate IP Addresses
- Encryption I & II (Caesar, Vigenère)
- (+ autres selon tests)

**Revenu attendu** : Variable (500k-50m par contrat)

---

### 2️⃣ **lib/telemetry-daemon.js** - Logging permanent

**Objectif** : Sauvegarder métriques en continu dans /state/

**Fichiers JSON créés** :
```
/state/telemetry-realtime.txt      → Métriques courantes
/state/telemetry-history.txt       → Historique (1h)
/state/performance-metrics.txt     → Success rate, threads, targets
/state/batcher-stats.txt           → Stats par cible
```

**Données trackées** :
- Success rate par serveur
- Threads actifs par serveur
- Revenus moyens (1min, 5min, 30min, 1h)
- Cibles actives + état (HWGW/PREP)
- RAM usage par serveur
- Errors/warnings

**Daemon** :
- Tourne en permanence
- Update toutes les 10-30s
- **Exception global-kill** : PID spécial ou flag
- Utilise ports pour écouter events

---

### 3️⃣ **lib/state-manager.js** - Gestion état persistant

**Objectif** : API unifiée pour lire/écrire état

```javascript
class StateManager {
    constructor(ns) { ... }
    
    // Sauvegarder état
    save(category, data) { ... }
    
    // Charger état
    load(category) { ... }
    
    // Lister états
    list() { ... }
    
    // Nettoyer vieux états
    cleanup(maxAge) { ... }
}
```

**Catégories** :
- `telemetry` : Métriques temps réel
- `performance` : Success rate, revenus
- `targets` : État cibles
- `config` : Configuration dynamique
- `audit` : Logs d'erreurs

---

### 4️⃣ **Dashboard amélioration** - Barre tendance + fix comptage

**Changements** :
1. ✅ Allonger barre tendance (20→40 caractères si place)
2. ✅ Fix comptage serveurs (utiliser ram-manager.getAllServers())
3. ✅ Afficher source données (/state/telemetry-realtime.txt)

---

## 🔧 PHASE 2 : MODULARISATION BATCHER

### Problème actuel : Monolithe de 590 lignes

**Batcher v0.11.0-ULTIMATE** :
- Calculs threads
- EV/s
- FFD packing
- Job splitting
- Recovery padding
- Adaptive timing
- Telemetry
- TOUT dans un seul fichier !

---

### Solution : Architecture modulaire

```
/core/
  batcher.js           ← Orchestration (100 lignes)
  
/core/batcher-modules/
  ev-calculator.js     ← EV/s + target selection
  thread-calculator.js ← Calculs HWGW threads
  job-scheduler.js     ← FFD packing + job splitting
  timing-optimizer.js  ← Adaptive delays
  recovery-manager.js  ← Padding + auto-recovery
  telemetry.js         ← Métriques + persistence
```

---

### Avantages :

1. **Maintenabilité** : Chaque module <150 lignes
2. **Testabilité** : Tester modules indépendamment
3. **Évolutivité** : Ajouter modules sans casser
4. **Clarté** : 1 module = 1 responsabilité

---

### Batcher.js simplifié (orchestration) :

```javascript
import { EVCalculator } from "/core/batcher-modules/ev-calculator.js";
import { ThreadCalculator } from "/core/batcher-modules/thread-calculator.js";
import { JobScheduler } from "/core/batcher-modules/job-scheduler.js";
import { TimingOptimizer } from "/core/batcher-modules/timing-optimizer.js";
import { RecoveryManager } from "/core/batcher-modules/recovery-manager.js";
import { BatcherTelemetry } from "/core/batcher-modules/telemetry.js";

export class Batcher {
    constructor(ns, network, ramMgr, portHandler, caps) {
        this.ns = ns;
        this.evCalc = new EVCalculator(ns);
        this.threadCalc = new ThreadCalculator(ns, caps);
        this.scheduler = new JobScheduler(ns, ramMgr);
        this.timing = new TimingOptimizer(ns);
        this.recovery = new RecoveryManager(ns);
        this.telemetry = new BatcherTelemetry(ns);
    }
    
    dispatchBatch(target) {
        // 1. Calculer EV/s (si multi-targets)
        // 2. Calculer threads
        // 3. Appliquer recovery padding
        // 4. Scheduler jobs (FFD + splitting)
        // 5. Optimiser timing
        // 6. Logger telemetry
    }
}
```

**Chaque module = expert dans son domaine**

---

## ⚡ PHASE 3 : OPTIMISATIONS FINES

### 1️⃣ **Recovery Thread Padding** (alainbryden)

**Principe** : Sur-allouer grow/weaken pour auto-correction

```javascript
// Au lieu de calculs exacts :
w1Threads = Math.ceil(hackSec / 0.05);

// Avec padding :
const padding = this.recovery.getPadding(successRate);
w1Threads = Math.ceil(hackSec / 0.05) * padding;  // 2-5×
```

**Padding adaptatif** :
- Success rate >95% → padding = 2
- Success rate >90% → padding = 3
- Success rate >80% → padding = 4
- Success rate <80% → padding = 5

**Coût** : RAM (acceptable avec 26PB)
**Gain** : 95%+ success rate

---

### 2️⃣ **Adaptive Cycle Timing**

**Au lieu de delays fixes (0, 50, 100, 150ms)** :

```javascript
function calculateOptimalDelay() {
    const avgWeakenTime = getAvgWeakenTime();
    const successRate = getSuccessRate();
    
    // Base delay sur weaken time
    let delay = avgWeakenTime / 50;  // 50 batches concurrents
    
    // Ajuster selon success rate
    if (successRate < 0.85) delay *= 1.5;  // Ralentir
    if (successRate > 0.95) delay *= 0.8;  // Accélérer
    
    return Math.max(10, Math.min(12000, delay));
}
```

**Résultat** : Delays s'adaptent au contexte

---

### 3️⃣ **Smart Prep (Parallel)**

**Au lieu de** :
```javascript
for (target of targets) {
    await prepTarget(target);  // Séquentiel
}
```

**Faire** :
```javascript
const preps = targets.map(t => prepTarget(t));
await Promise.all(preps);  // Parallèle
```

**Gain** : Temps prep ÷ N

---

### 4️⃣ **Job Splitting** (50k → 10×5k)

```javascript
function splitJob(totalThreads, maxBatchSize = 5000) {
    const batches = [];
    let remaining = totalThreads;
    
    while (remaining > 0) {
        const size = Math.min(maxBatchSize, remaining);
        batches.push(size);
        remaining -= size;
    }
    
    return batches;
}
```

**Gain** : -80% lag, meilleure distribution

---

## 📋 CHECKLIST DÉPLOIEMENT

### PHASE 1 : Nouveaux outils

```bash
- [ ] tools/blackbox.js (solver contrats)
- [ ] lib/telemetry-daemon.js (logging permanent)
- [ ] lib/state-manager.js (API état)
- [ ] Dashboard fix + barre tendance
```

### PHASE 2 : Modularisation

```bash
- [ ] /core/batcher-modules/ (créer structure)
- [ ] Découper batcher.js en modules
- [ ] Tester chaque module indépendamment
- [ ] Intégration progressive
```

### PHASE 3 : Optimisations

```bash
- [ ] Recovery padding adaptatif
- [ ] Adaptive cycle timing
- [ ] Smart prep parallèle
- [ ] Job splitting
```

---

## 🎯 RÉSULTATS ATTENDUS

| Métrique | Actuel | Cible v0.11.1 |
|---|---:|---:|
| **Success rate** | 79-85% | 95%+ ✅ |
| **Revenus** | $6-32T/s (vagues) | $20-40T/s (stable) ✅ |
| **Tendance** | Vagues | Lisse ✅ |
| **Serveurs dashboard** | 26/26 (bug) | 69/69 ✅ |
| **Modularité** | Monolithe 590L | Modules <150L ✅ |
| **Telemetry** | Aucune | /state/ complet ✅ |

---

## 🙏 RÈGLES ABSOLUES (NOTÉES)

```
✅ TOUJOURS partir du code existant (backups)
✅ TOUJOURS tester module par module
✅ TOUJOURS déployer via GitHub
✅ TOUJOURS vérifier que ça ne casse pas l'existant
❌ JAMAIS réécrire from scratch
❌ JAMAIS supposer - TOUJOURS vérifier
❌ JAMAIS oublier les bases pour les techniques fancy
```

---

## 💬 QUESTIONS POUR TOI MAÎTRE

1. **Ordre de priorité** : Blackbox → Telemetry → Modularisation ?
2. **Dashboard** : Fix serveurs 26→69 prioritaire ?
3. **Modularisation** : Tout d'un coup ou progressif ?
4. **Backups** : Tu veux que je reparte de batcher v0.9.0 ?

**Prêt à coder selon tes directives !** 🎯
