# NEXUS Framework v0.2-alpha

Framework d'automatisation pour Bitburner v2.8.1

## Installation
```bash
wget https://raw.githubusercontent.com/tylersense-ui/NEXUS-V1.0/main/tools/deploy.js /tools/deploy.js
run /tools/deploy.js
```

## Quick Start
```bash
# Initialiser le framework
run /core/bootstrap.js

# Farmer XP (niveau 1)
run /hack/xp-grind.js

# Rooter les serveurs
run /tools/rooter.js

# Acheter des serveurs
run /managers/server-manager.js

# Dashboard léger
run /monitor/status-lite.js
```

## Architecture
```
/core/          → Bootstrap et version
/lib/           → Bibliothèques utilitaires
/hack/          → Scripts de hacking
/managers/      → Gestionnaires automatiques
/monitor/       → Dashboards
/tools/         → Outils manuels
/state/         → États persistants (auto-créés)
```

## Versioning

- **v0.2.0-alpha** : Refonte complète, headers standardisés
- **v0.1.0-bootstrap** : Première version

## License

MIT
