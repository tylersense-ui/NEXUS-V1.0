📋 CHECKLIST PAR VERSION
Semaine 1 : v0.12.2 (EV/s)

 Créer network.js.v0.12.1 (backup)
 Modifier network.js (ajouter calculateEVperSecond)
 Tester localement
 Déployer in-game
 Observer 48h
 Mesurer revenus vs baseline
 Valider success rate stable
 Décision : merge ou rollback

Semaine 2 : v0.12.3 (Dynamic hackPercent)

 Créer batcher.js.v0.12.2 (backup)
 Modifier batcher.js (ajouter calculateOptimalHackPercent)
 Tester localement
 Déployer in-game
 Observer hackPercent varie 5-15%
 Mesurer revenus vs v0.12.2
 Valider success rate >90%
 Décision : merge ou rollback

Semaine 3 : v0.12.4 (Multi-targets)

 Créer orchestrator.js.v0.12.3 (backup)
 Modifier orchestrator.js (auto-scale 1→2-3)
 Modifier constants.js (MAX_TARGETS = 3)
 Tester localement
 Déployer in-game
 Observer 2-3 cibles actives
 Mesurer RAM_EXHAUSTED <30%
 Valider success rate >85%
 Décision : merge ou rollback

Semaine 4 : v0.12.5 (FFD)

 Créer ram-manager.js.v0.12.4 (backup)
 Modifier ram-manager.js (implémenter FFD)
 Tester localement
 Déployer in-game
 Mesurer utilisation RAM
 Mesurer fragmentation
 Valider success rate +5%
 Décision : merge ou rollback

Semaine 5 : v0.12.6 (Adaptive timing)

 Créer orchestrator.js.v0.12.5 (backup)
 Modifier orchestrator.js (adaptive cycleDelay)
 Tester localement
 Déployer in-game
 Observer cycleDelay varie
 Mesurer misfires <2%
 Valider revenus
 Décision : merge ou rollback

Release finale : v0.13.0 QUANTUM

 Merger toutes features validées
 Rebadger headers v0.13.0-QUANTUM
 Mettre à jour manifest
 Créer README v0.13.0
 Package ZIP final
 Documentation complète

 ### Semaine 3 
```
→ v0.12.4 : FFD Packing (meilleure allocation RAM)
→ v0.12.5 : Job Splitting (réduire lag)
→ v0.12.6 : Recovery Padding (success rate)
```

### Semaine 4+
```
→ v0.12.7 : Adaptive Timing
→ v0.12.8 : Share factions, manuel(bn1) et intelligent(singularity)
→ v0.13.0 : QUANTUM (toutes features)