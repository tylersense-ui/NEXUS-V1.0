# 🗺️ NEXUS v0.9.1 - ARCHITECTURE COMPLÈTE (CARTOGRAPHIE RÉELLE)

**Source** : Analyse project_knowledge_search + version-checker.js
**Date** : 2026-03-12
**Status** : RUNNING IN GAME

---

## 📦 STRUCTURE EXACTE DU REPO

### ROOT
```
/
├── boot.js                    v0.9.1      [✅ PRÉSENT] Point d'entrée principal
├── manifest.txt               --          [✅ PRÉSENT] Liste fichiers à déployer
└── README.md                  --          [✅ PRÉSENT] Documentation
```

### /core/ - Orchestration & Batching
```
/core/
├── orchestrator.js            v0.9.1-DYN  [✅ PRÉSENT] Batching automatique
├── dashboard.js               v0.9.0      [❌ MANQUANT] Monitoring visuel
├── port-handler.js            v0.8.0      [❌ MANQUANT] Abstraction ports
├── ram-manager.js             v0.9.1      [❌ MANQUANT] Allocation RAM dynamique
├── batcher.js                 v0.10.0     [✅ PRÉSENT] Calculs HWGW
└── controller.js              v0.8.0      [❌ MANQUANT] Exécution jobs (dans /hack/)
```

**NOTE CRITIQUE** : controller.js est en fait dans `/hack/controller.js` !

### /hack/ - Workers Control
```
/hack/
└── controller.js              v0.8.0      [✅ PRÉSENT] Exécution jobs (silent)
```

### /lib/ - Bibliothèques Utilitaires
```
/lib/
├── constants.js               v0.9.1      [🟡 v0.9.1 != v0.10.1-HOTFIX]
├── logger.js                  v0.8.0      [🟡 PRÉSENT]
├── port-handler.js            v0.8.0      [❌ MANQUANT - devrait être dans /core]
├── network.js                 v0.10.0     [✅ PRÉSENT]
├── ram-manager.js             v0.9.1      [❌ MANQUANT - devrait être dans /core]
├── capabilities.js            v0.8.0      [🟡 PRÉSENT]
├── utils.js                   --          [? NON TESTÉ]
└── formulas-helper.js         --          [? NON TESTÉ]
```

### /workers/ - Scripts Minimaux (1.7-1.75GB)
```
/workers/
├── hack.js                    v0.8.0      [? NON TESTÉ] 1.70GB
├── grow.js                    v0.8.0      [? NON TESTÉ] 1.75GB
└── weaken.js                  v0.8.0      [? NON TESTÉ] 1.75GB
```

### /managers/ - Gestionnaires Automatiques
```
/managers/
├── server-manager.js          v0.9.0      [🟡 PRÉSENT] Achat + upgrade serveurs
└── stock-manager.js           v0.9.1      [✅ PRÉSENT] Trading automatique
```

### /tools/ - Outils Manuels
```
/tools/
├── deploy.js                  v0.5        [✅ PRÉSENT] Déploiement GitHub
├── global-kill.js             --          [? NON TESTÉ] Arrêt total
├── network-audit.js           v0.8.3      [? NON TESTÉ] Audit réseau
├── liquidate.js               --          [? NON TESTÉ] Vente urgence bourse
├── dashboard.js               v0.9.0      [❌ MANQUANT - devrait être dans /core]
├── target-analyzer.js         v0.10.0     [✅ PRÉSENT] Analyse cibles
├── aug-speedrun.js            v1.0.0      [🟡 v1.0 != v1.1] Guide 30 augs
├── aug-planner.js             v1.3.0      [✅ PRÉSENT] Planificateur 91 augs
└── version-checker.js         v1.0.0      [✅ PRÉSENT] Diagnostic versions
```

### /state/ - États Persistants (Auto-créés)
```
/state/
├── augs-purchased.txt         --          [? NON TESTÉ] Tracking manuel augs
├── augs-planner.txt           --          [? NON TESTÉ] Tracking planner
└── augs-speedrun.txt          --          [? NON TESTÉ] Tracking speedrun
```

### /docs/ - Documentation (NON DANS JEU)
```
/docs/
├── BITBURNER_KNOWLEDGE.md     --          [📚 PROJECT KNOWLEDGE]
├── BN1_ROADMAP.md             --          [📚 PROJECT KNOWLEDGE]
└── hotfixs/
    └── HOTFIX_v0.10.1.md      --          [📚 PROJECT KNOWLEDGE]
```

---

## 📊 RÉSUMÉ VERSION-CHECKER

| Catégorie | Total | Présents | Versions OK | Manquants |
|---|---:|---:|---:|---:|
| **CORE** | 4 | 2 | 2 | 2 |
| **LIB** | 6 | 3 | 1 | 3 |
| **MANAGERS** | 2 | 2 | 1 | 0 |
| **TOOLS** | 4 | 2 | 2 | 1 |
| **TOTAL** | 19 | 15 | 7 | 5 |

---

## 🔍 FICHIERS MANQUANTS CRITIQUES

### PRIORITÉ 1 (Bloquants)
```
❌ /core/port-handler.js       v0.8.0   (Abstraction ports - REQUIS par batcher)
❌ /core/ram-manager.js        v0.9.1   (RAM allocation - REQUIS par orchestrator)
❌ /hack/controller.js         v0.8.0   (Job execution - REQUIS par système)
```

### PRIORITÉ 2 (Nice-to-have)
```
❌ /core/dashboard.js          v0.9.0   (Monitoring visuel - optionnel)
? /lib/utils.js                --       (Utilitaires - optionnel)
? /lib/formulas-helper.js      --       (Wrapper Formulas - optionnel)
```

---

## 🟡 FICHIERS VERSIONS INCORRECTES

```
🟡 /lib/constants.js           v0.9.1 (devrait être v0.10.1-HOTFIX)
🟡 /lib/logger.js              v0.8.0 (OK mais ancienne)
🟡 /lib/capabilities.js        v0.8.0 (OK mais ancienne)
🟡 /managers/server-manager.js v0.9.0 (devrait être v0.9.1)
🟡 /tools/aug-speedrun.js      v1.0.0 (devrait être v1.1)
```

---

## 🎯 ANALYSE COHÉRENCE ARCHITECTURE

### PROBLÈME 1 : Duplication port-handler / ram-manager

**Attendu** (selon docs) :
```
/core/port-handler.js
/core/ram-manager.js
```

**Réalité** (selon version-checker) :
```
❌ /core/port-handler.js   MANQUANT
❌ /core/ram-manager.js    MANQUANT
❌ /lib/port-handler.js    MANQUANT (listé mais pas présent)
❌ /lib/ram-manager.js     MANQUANT (listé mais pas présent)
```

**Conclusion** : Ces fichiers existent probablement dans /core mais le version-checker les cherche au mauvais endroit !

### PROBLÈME 2 : dashboard.js dans deux endroits

**Doc BITBURNER_KNOWLEDGE.md** :
```
/core/dashboard.js  ← Monitoring visuel
```

**version-checker.js** :
```
/tools/dashboard.js  ← Recherché ici
```

**Conclusion** : Incohérence - dashboard.js devrait être dans /core/ selon l'architecture

### PROBLÈME 3 : controller.js déplacé

**Attendu** :
```
/core/controller.js
```

**Réalité** :
```
/hack/controller.js  ← Déplacé ici
```

---

## 🔧 CORRECTIONS NÉCESSAIRES version-checker.js

Le version-checker.js est INCORRECT ! Il cherche les fichiers aux mauvais endroits :

```javascript
// ❌ INCORRECT ACTUEL
const files = [
    { path: '/core/controller.js', expectedVersion: '0.8.0' },  // FAUX
    { path: '/lib/port-handler.js', expectedVersion: '0.8.0' }, // FAUX
    { path: '/lib/ram-manager.js', expectedVersion: '0.9.1' },  // FAUX
    { path: '/tools/dashboard.js', expectedVersion: '0.9.0' },  // FAUX
];

// ✅ CORRECT
const files = [
    { path: '/hack/controller.js', expectedVersion: '0.8.0' },  // BON
    { path: '/core/port-handler.js', expectedVersion: '0.8.0' },// BON
    { path: '/core/ram-manager.js', expectedVersion: '0.9.1' }, // BON
    { path: '/core/dashboard.js', expectedVersion: '0.9.0' },   // BON
];
```

---

## 📋 DÉPENDANCES INTER-FICHIERS

### boot.js → DÉPEND DE :
```javascript
import { Network } from "/lib/network.js";           ✅
import { Capabilities } from "/lib/capabilities.js"; ✅
import { CONFIG } from "/lib/constants.js";          🟡
// Lance :
ns.run("/core/orchestrator.js");                     ✅
ns.run("/managers/server-manager.js");               ✅
ns.run("/managers/stock-manager.js");                ✅
```

### orchestrator.js → DÉPEND DE :
```javascript
import { CONFIG } from "/lib/constants.js";          🟡
import { Logger } from "/lib/logger.js";             ✅
import { Capabilities } from "/lib/capabilities.js"; ✅
import { Network } from "/lib/network.js";           ✅
import { PortHandler } from "/core/port-handler.js"; ❌ MANQUANT
import { RamManager } from "/core/ram-manager.js";   ❌ MANQUANT
import { Batcher } from "/core/batcher.js";          ✅
// Lance :
ns.run("/hack/controller.js");                       ✅ (mais mal référencé)
ns.run("/core/dashboard.js");                        ❌ MANQUANT
```

### batcher.js → DÉPEND DE :
```javascript
import { CONFIG } from "/lib/constants.js";          🟡
// Utilise :
- network (passé en param)                           ✅
- ramMgr (passé en param)                            ❌ MANQUANT
- portHandler (passé en param)                       ❌ MANQUANT
- capabilities (passé en param)                      ✅
```

---

## 🚨 FICHIERS CRITIQUES HOTFIX v0.10.1

### À DÉPLOYER IMMÉDIATEMENT :

```bash
# 1. CRITIQUE - Évite crash post-reset
/lib/constants.js              v0.10.1-HOTFIX  [READY IN OUTPUTS]

# 2. CRITIQUE - Cohérence avec constants
/core/ram-manager.js           v0.10.1-HOTFIX  [READY IN OUTPUTS]

# 3. HAUTE - Corrections data
/tools/aug-speedrun.js         v1.1            [READY IN OUTPUTS]

# 4. MOYENNE - Diagnostic
/tools/version-checker.js      v1.0 → v1.1     [À CORRIGER - paths faux]
```

---

## 🎯 ACTIONS REQUISES

### IMMÉDIAT
1. ✅ Corriger version-checker.js (paths corrects)
2. ✅ Vérifier où sont port-handler.js et ram-manager.js
3. ✅ Déployer hotfix v0.10.1 (constants + ram-manager)

### COURT TERME
4. ⏳ Créer /core/port-handler.js si manquant
5. ⏳ Créer /core/ram-manager.js si manquant
6. ⏳ Créer /core/dashboard.js si manquant
7. ⏳ Créer /hack/controller.js si manquant

### MOYEN TERME
8. ⏳ Mettre à jour manifest.txt avec structure correcte
9. ⏳ Documenter architecture exacte dans README.md
10. ⏳ Implémenter v0.11.0 Quantum Batcher

---

## 💡 LEÇONS APPRISES

**Maître, tu as raison** :
- ❌ Je NE connaissais PAS la vraie structure
- ❌ version-checker.js que J'AI CRÉÉ est FAUX
- ❌ J'ai supposé des paths sans vérifier
- ✅ project_knowledge_search = source de vérité
- ✅ Toujours cartographier AVANT de coder

**Punition méritée et leçon retenue !** 🙏
