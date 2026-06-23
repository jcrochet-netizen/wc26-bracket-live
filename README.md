# Bracket LIVE — Coupe du monde 2026

Bracket interactif du Mondial 2026 **auto-rempli en direct** à partir des données
SportMonks. Reprend le bracket `/Bracket` mais, au lieu que l'utilisateur classe
lui-même chaque groupe, les **classements sont calculés en temps réel** et les
**seizièmes de finale se remplissent automatiquement** « à l'instant t ».

L'utilisateur n'a plus qu'à cliquer pour faire avancer ses favoris dans la phase
finale (8es → finale).

## Comment ça marche

```
SportMonks API ──> fetch-data.js ──> data.json ──> bracket-live.html (widget)
   (token serveur)   (GitHub Action cron)            (lit data.json, jamais le token)
```

- **`fetch-data.js`** (serveur) : lit les standings de la saison 26618, calcule le
  fair-play à partir des cartons et la confrontation directe à partir des résultats,
  puis classe **chaque groupe 1→4** selon les critères officiels FIFA WC 2026
  (art. 13.1), désigne les **8 meilleurs 3es sur 12**, et écrit `data.json`.
- **`bracket-live.html`** (client) : lit `data.json`, affiche les classements en
  lecture seule, **auto-seed les 1/16es** (1ers, 2es et meilleurs 3es via la table
  des 495 combinaisons officielles FIFA), puis laisse l'utilisateur pronostiquer la
  phase finale. Rafraîchissement automatique toutes les 5 min.

Le token SportMonks n'est **jamais** exposé côté client.

## Deux règlements distincts

### Règlement 1 — égalités dans un groupe (confrontation directe d'abord)

Tri primaire par points généraux ; deux équipes à égalité de points sont départagées :

1. points en **confrontation directe** (entre les seules équipes à égalité)
2. différence de buts en confrontation directe
3. buts marqués en confrontation directe
4. différence de buts **générale** (tous les matchs du groupe)
5. buts marqués généraux
6. fair-play (cartons : −1 jaune, −3 2e jaune, −4 rouge direct, −5 jaune + rouge)

(garde-fou ultime : classement FIFA/Coca‑Cola hommes, édition 11/06/2026)

### Règlement 2 — 8 meilleurs 3es sur 12 (règlement différent, **sans** confrontation directe)

a) plus grand nombre de points sur tous les matchs de groupe
b) différence de buts sur tous les matchs de groupe
c) plus grand nombre de buts marqués
d) fair-play (cartons, calculé comme à l'art. 13 §1 step 2)
e) classement FIFA/Coca‑Cola hommes le plus récent
f) édition précédente du classement FIFA, jusqu'à départage

(les 3es venant de groupes différents, la confrontation directe ne s'applique pas)

## Développement local

```bash
node fetch-data.js     # régénère data.json depuis SportMonks (lit .env)
node serve.js          # sert sur http://localhost:8756/bracket-live.html
```

`.env` (gitignore) :

```
SPORTMONKS_API_TOKEN=...
```

## Déploiement

1. `git init` + push vers un dépôt GitHub.
2. Ajouter le secret `SPORTMONKS_API_TOKEN` dans **Settings → Secrets and variables → Actions**.
3. Activer GitHub Pages. Le widget est `bracket-live.html` (ou intégrer via iframe).
4. L'action `.github/workflows/refresh-standings.yml` régénère `data.json` toutes les
   30 min et le commit s'il a changé.

## Multilingue (FR / EN / PT-BR / ES)

Quatre variantes, une par langue. Les **noms d'équipes** sont localisés dans chaque
`data-<lang>.json` (produit par `fetch-data.js`) ; l'**interface** est traduite dans
chaque HTML (généré par `build-langs.js` à partir du master FR).

| Langue | Widget | Données |
|---|---|---|
| Français | `bracket-live.html` | `data.json` |
| English | `bracket-live-en.html` | `data-en.json` |
| Português (BR) | `bracket-live-pt.html` | `data-pt.json` |
| Español | `bracket-live-es.html` | `data-es.json` |
| Italiano | `bracket-live-it.html` | `data-it.json` |

`index.html` est un sélecteur de langue.

**Modifier l'UI** → éditer le master `bracket-live.html`, puis régénérer :

```bash
node build-langs.js   # régénère les 3 variantes traduites depuis le master FR
node fetch-data.js    # régénère les 4 data-*.json + réinjecte la copie de secours
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `fetch-data.js` | Récupère SportMonks → classe les groupes → écrit les 4 `data-*.json` |
| `build-langs.js` | Génère les variantes EN/PT/ES depuis le master FR |
| `data*.json` | Classements live + 8 meilleurs 3es, par langue (servis au client) |
| `bracket-live*.html` | Widgets : standings live + bracket auto-rempli + pronostics |
| `index.html` | Sélecteur de langue |
| `serve.js` | Petit serveur statique local |
| `.github/workflows/refresh-standings.yml` | Cron de rafraîchissement |

## Données

- Ligue SportMonks `732`, saison `26618` (Coupe du monde 2026).
- Drapeaux : `flagcdn.com` (code ISO 2 lettres).
- 48 nations mappées (nom FR + drapeau) dans `META` de `fetch-data.js`.
