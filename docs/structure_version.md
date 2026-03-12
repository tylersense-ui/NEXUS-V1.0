NEXUS v0.9.1
├── boot.js
├── /core/
│   ├── orchestrator.js
│   ├── batcher.js
│   ├── port-handler.js     
│   ├── ram-manager.js      
│   └── dashboard.js        
├── /hack/
│   └── controller.js       
├── /lib/
│   ├── constants.js
│   ├── logger.js
│   ├── network.js
│   ├── capabilities.js
│   ├── utils.js
│   └── formulas-helper.js
├── /workers/
│   ├── hack.js
│   ├── grow.js
│   └── weaken.js
├── /managers/
│   ├── server-manager.js
│   └── stock-manager.js
├── /tools/
│   ├── deploy.js
│   ├── target-analyzer.js
│   ├── aug-speedrun.js
│   └── aug-planner.js
├── /state/ 
│      ├── network-status.json          → Serveurs scannés vs actifs
│      ├── telemetry-realtime.json      → Métriques ultra détaillées temps réel
│      ├── performance-metrics.json     → Success rate, threads, revenus
│      ├── batcher-stats.json           → Stats par cible (EV/s, cycles, échecs)
│      ├── player-stats.json            → Niveau, BN, augs, uptime
│      ├── version-tracking.json        → Versions code en cours
│      ├── operator-actions.json        → Log actions manuelles (achats, etc.)
│      └── daemon-heartbeat.json        → Timestamp dernier update
│   
│   
  
  
  
  
  