# 🚀 DÉPLOIEMENT TELEMETRY SYSTEM v0.11.1

**Système de logging permanent - L'Œil de Claude**

---

## 📦 FICHIERS À DÉPLOYER

```
state-manager-v0.11.1.js        → lib/state-manager.js
telemetry-daemon-v0.11.1.js     → lib/telemetry-daemon.js
log-action-v0.11.1.js           → tools/log-action.js
manifest-v0.11.1.txt            → manifest.txt
```

---

## 🔧 COMMANDES GIT (VSCODE)

### 1️⃣ Copier fichiers dans repo

```bash
# Dans terminal VSCode (depuis dossier outputs) :

# State Manager
cp state-manager-v0.11.1.js ../lib/state-manager.js

# Telemetry Daemon
cp telemetry-daemon-v0.11.1.js ../lib/telemetry-daemon.js

# Log Action
cp log-action-v0.11.1.js ../tools/log-action.js

# Manifest mis à jour
cp manifest-v0.11.1.txt ../manifest.txt
```

---

### 2️⃣ Git add + commit

```bash
# Revenir à la racine du repo
cd ..

# Git add
git add lib/state-manager.js
git add lib/telemetry-daemon.js
git add tools/log-action.js
git add manifest.txt

# Git commit
git commit -m "v0.11.1: TELEMETRY SYSTEM - L'Œil de Claude

NOUVEAUX FICHIERS:
- lib/state-manager.js : API persistance /state/
- lib/telemetry-daemon.js : Daemon logging permanent
- tools/log-action.js : Logger actions manuelles

OBJECTIF:
Diagnostiquer pourquoi seulement 26/69 serveurs actifs.
Telemetry va logger TOUS les serveurs + scripts actifs.

FICHIERS /state/ CRÉÉS:
- network-status.json : Serveurs scannés vs avec scripts
- performance-metrics.json : Threads, revenus, money
- player-stats.json : Niveau, BN, uptime
- version-tracking.json : Versions fichiers actifs
- operator-actions.json : Log actions manuelles
- daemon-heartbeat.json : Timestamp dernier update

DÉPLOIEMENT:
1. mkdir /state (in-game)
2. run /tools/deploy.js
3. run /lib/telemetry-daemon.js (daemon permanent)
4. run /boot.js (système principal)"
```

---

### 3️⃣ Git push

```bash
git push origin main
```

---

## 🎮 DANS BITBURNER

### 1️⃣ Créer dossier /state/

```javascript
mkdir /state
```

**Important** : Ce dossier stocke tous les fichiers JSON de telemetry.

---

### 2️⃣ Déployer depuis GitHub

```javascript
run /tools/deploy.js
```

**Vérifie que les nouveaux fichiers sont bien copiés** :
- `lib/state-manager.js`
- `lib/telemetry-daemon.js`
- `tools/log-action.js`

---

### 3️⃣ Lancer telemetry daemon

```javascript
run /lib/telemetry-daemon.js
```

**Le daemon** :
- ✅ Tourne en permanence
- ✅ Update toutes les 30s
- ✅ Sauvegarde dans `/state/`
- ✅ Affiche résumé dans terminal

**Laisser tourner en arrière-plan.**

---

### 4️⃣ Lancer système principal

```javascript
run /tools/global-kill.js
run /boot.js
```

**Note** : global-kill va tuer telemetry aussi (pour l'instant).

**Solution temporaire** : Relancer telemetry après global-kill :

```javascript
run /tools/global-kill.js
run /lib/telemetry-daemon.js  # Relancer immédiatement
run /boot.js
```

---

## 📊 VÉRIFICATION

### 1️⃣ Vérifier daemon actif

```javascript
ps
```

**Devrait montrer** :
```
lib/telemetry-daemon.js  (1 thread)  [running]
```

---

### 2️⃣ Vérifier fichiers /state/ créés

```javascript
ls /state
```

**Devrait montrer** :
```
network-status.json
performance-metrics.json
player-stats.json
version-tracking.json
daemon-heartbeat.json
```

---

### 3️⃣ Lire network-status.json (CRITIQUE)

```javascript
cat /state/network-status.json
```

**Ce fichier révèle** :
- `totalServersScanned` → Combien scannés (devrait être 69)
- `totalServersWithScripts` → Combien avec scripts (actuellement 26)
- `totalServersEmpty` → Combien vides (actuellement 43)
- `serversDetail[]` → Liste TOUS les serveurs

**Copier-coller ce JSON complet et l'envoyer à Claude !**

---

## 🎯 DIAGNOSTIC 26/69 SERVEURS

**Avec network-status.json, Claude verra** :

1. **Quels serveurs ont des scripts** :
   - home ✅
   - nexus-0 à nexus-24 ✅ (25 serveurs)
   - = 26 TOTAL

2. **Quels serveurs sont vides** :
   - n00dles, foodnstuff, sigma-cosmetics, etc.
   - = 43 serveurs IGNORÉS !

3. **Où est le problème** :
   - ram-manager scanne tous les serveurs ? (BFS complet)
   - controller dispatch sur tous les serveurs ? (ou filtre ?)
   - orchestrator a un filtre caché ?

**Avec les données précises, Claude fixera exactement le bon endroit !**

---

## 💡 LOGGER ACTIONS MANUELLES

**Après chaque action importante** :

```javascript
// Achat augmentation
run /tools/log-action.js "Achat NeuroFlux x5 pour $500m"

// Rejoint faction
run /tools/log-action.js "Rejoint Daedalus"

// Reset
run /tools/log-action.js "Reset avec 30 augs - $100B dépensés"

// Achat serveur
run /tools/log-action.js "Upgrade nexus-24 à 1PB RAM pour $50T"
```

**Ces logs sont sauvegardés dans** `/state/operator-actions.json`

**Claude peut les lire pour comprendre ce que tu as fait !**

---

## ⚠️ PROTECTION GLOBAL-KILL (À FAIRE)

**Actuellement** : global-kill tue TOUT, y compris telemetry.

**Solution à implémenter** : Modifier global-kill.js pour exclure telemetry.

**Code à ajouter dans global-kill.js** :

```javascript
const PROTECTED_SCRIPTS = [
    "telemetry-daemon.js",
    "dashboard.js"  // Optionnel
];

// Dans la boucle de kill :
const processes = ns.ps(host);
for (const proc of processes) {
    const scriptName = proc.filename.split('/').pop();
    
    if (!PROTECTED_SCRIPTS.includes(scriptName)) {
        ns.kill(proc.pid);
    }
}
```

**Pour l'instant** : Relancer telemetry manuellement après global-kill.

---

## 🎯 RÉSULTAT ATTENDU

**Après déploiement** :

1. ✅ Telemetry daemon tourne en permanence
2. ✅ Fichiers /state/ mis à jour toutes les 30s
3. ✅ network-status.json révèle le problème 26/69
4. ✅ Claude peut diagnostiquer EXACTEMENT où est le bug
5. ✅ Fix + redéploiement → 69/69 serveurs actifs ✅

**Success rate → 95%+ et revenus stables !** 🎯

---

## 📋 CHECKLIST DÉPLOIEMENT

```
- [ ] Copier fichiers dans repo (VSCode)
- [ ] Git add + commit + push
- [ ] mkdir /state (in-game)
- [ ] run /tools/deploy.js
- [ ] run /lib/telemetry-daemon.js
- [ ] run /boot.js
- [ ] Vérifier ps (telemetry actif)
- [ ] Vérifier ls /state (fichiers créés)
- [ ] cat /state/network-status.json
- [ ] Envoyer network-status.json à Claude
```

---

**Prêt à déployer !** 🚀
