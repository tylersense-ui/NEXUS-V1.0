# 🏗️ ARCHITECTURE NEXUS v0.11.1 - CORRIGÉE

**telemetry-daemon.js déplacé : lib/ → tools/ (plus logique)**

---

## 📁 STRUCTURE COMPLÈTE

```
NEXUS v0.11.1
├── /state/                      ← NOUVEAU - Persistance telemetry
│   ├── network-status.json
│   ├── performance-metrics.json
│   ├── player-stats.json
│   ├── version-tracking.json
│   ├── operator-actions.json
│   └── daemon-heartbeat.json
│
├── /boot.js                     ← Point d'entrée
│
├── /core/                       ← Système central
│   ├── orchestrator.js
│   ├── batcher.js
│   ├── port-handler.js
│   ├── ram-manager.js
│   └── dashboard.js
│
├── /hack/                       ← Système hacking
│   └── controller.js
│
├── /lib/                        ← BIBLIOTHÈQUES (importées)
│   ├── constants.js
│   ├── logger.js
│   ├── network.js
│   ├── capabilities.js
│   ├── utils.js
│   ├── formulas-helper.js
│   └── state-manager.js         ← NOUVEAU - API persistance
│
├── /workers/                    ← Workers HWGW
│   ├── hack.js
│   ├── grow.js
│   └── weaken.js
│
├── /managers/                   ← Managers automatiques
│   ├── server-manager.js
│   └── stock-manager.js
│
└── /tools/                      ← SCRIPTS EXÉCUTABLES (lancés directement)
    ├── deploy.js
    ├── global-kill.js
    ├── network-audit.js
    ├── liquidate.js
    ├── target-analyzer.js
    ├── aug-speedrun.js
    ├── aug-planner.js
    ├── version-checker.js
    ├── log-action.js            ← NOUVEAU - Logger actions
    └── telemetry-daemon.js      ← NOUVEAU - Daemon logging (CORRIGÉ: tools/ pas lib/)
```

---

## 🎯 DIFFÉRENCE lib/ vs tools/

**lib/** = Bibliothèques (modules importés par d'autres fichiers)
```javascript
// Exemple : state-manager.js
import { StateManager } from "/lib/state-manager.js";
```

**tools/** = Scripts exécutables (lancés directement par l'utilisateur)
```javascript
// Exemple : telemetry-daemon.js
run /tools/telemetry-daemon.js
```

---

## ✅ POURQUOI telemetry-daemon.js → tools/ ?

1. ✅ **Script standalone** : On le lance directement avec `run`
2. ✅ **Pas importé** : Aucun autre fichier ne fait `import { ... } from "telemetry-daemon.js"`
3. ✅ **Cohérence** : Comme deploy.js, global-kill.js, etc.

**Avant (incorrect)** :
```
/lib/telemetry-daemon.js  ← Mauvais endroit
run /lib/telemetry-daemon.js
```

**Après (correct)** :
```
/tools/telemetry-daemon.js  ← Bon endroit
run /tools/telemetry-daemon.js
```

---

## 📦 FICHIERS v0.11.1

**Nouveaux** :
- `/lib/state-manager.js` → API persistance (bibliothèque)
- `/tools/telemetry-daemon.js` → Daemon logging (script)
- `/tools/log-action.js` → Logger actions (script)

**Modifiés** :
- `/manifest.txt` → Nettoyé (sans commentaires) + telemetry-daemon dans tools/
