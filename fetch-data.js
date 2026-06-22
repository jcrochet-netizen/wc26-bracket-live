#!/usr/bin/env node
/**
 * Coupe du Monde 2026 – Bracket LIVE : récupérateur de données
 * ------------------------------------------------------------
 * Source : API SportMonks (même token que FootballWhispers / WC26-3eme).
 *
 *  1. Standings de la saison 26618 → les 4 équipes de chacun des 12 groupes.
 *  2. Fixtures (phase de groupes) → cartons → score fair-play FIFA + confrontation directe.
 *  3. Classement FIFA (édition 11 juin 2026) → départage final.
 *
 * Classe CHAQUE groupe 1→4 selon les critères officiels FIFA WC 2026 (art. 13.1) :
 *   a) points  b) diff. de buts  c) buts marqués
 *   d) confrontation directe (pts → diff → buts entre les ex æquo)
 *   e) fair-play (cartons)       f) classement mondial FIFA
 *
 * Puis désigne les 8 meilleurs 3èmes sur 12 (mêmes critères a→f, sans h2h).
 *
 * Écrit data.json — le widget le lit côté client (token jamais exposé).
 * Le bracket auto-remplit les 1/16es (1ers, 2es, meilleurs 3es) « à l'instant t ».
 * Relancer pour rafraîchir :  node fetch-data.js
 */

const fs = require("fs");
const path = require("path");

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadDotEnv();

const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
if (!API_TOKEN) {
  console.error("✗ SPORTMONKS_API_TOKEN manquant (voir .env.example).");
  process.exit(1);
}

const BASE = "https://api.sportmonks.com/v3/football";
const SEASON_ID = 26618;          // Coupe du Monde 2026
const QUALIFY_COUNT = 8;          // 8 meilleurs 3èmes qualifiés
const GROUP_WINDOW = ["2026-06-11", "2026-06-27"]; // phase de groupes

// Classement FIFA/Coca-Cola hommes — édition du 11 juin 2026 (inside.fifa.com).
// Clé = nom de l'équipe tel que renvoyé par SportMonks.
const FIFA_RANK = {
  "Argentina": 1, "France": 2, "Spain": 3, "England": 4, "Brazil": 5,
  "Morocco": 6, "Portugal": 7, "Netherlands": 8, "Germany": 9, "Belgium": 10,
  "Croatia": 11, "Mexico": 13, "Colombia": 14, "United States": 15, "Senegal": 16,
  "Japan": 17, "Uruguay": 18, "Switzerland": 19, "Austria": 21, "Korea Republic": 22,
  "Australia": 23, "Iran": 24, "Türkiye": 26, "Norway": 27, "Ecuador": 28,
  "Egypt": 29, "Côte d'Ivoire": 30, "Algeria": 31, "Canada": 32, "Panama": 34,
  "Sweden": 35, "Scotland": 38, "Paraguay": 42, "Congo DR": 43, "Czech Republic": 44,
  "Qatar": 49, "Uzbekistan": 50, "Tunisia": 56, "Saudi Arabia": 59, "Iraq": 60,
  "South Africa": 61, "Bosnia and Herzegovina": 63, "Cape Verde Islands": 64, "Jordan": 67,
  "Ghana": 73, "New Zealand": 82, "Curacao": 83, "Haiti": 85
};

// Langues produites (un data.json par langue ; fr = data.json).
const LANGS = ["fr", "en", "pt", "es"];

// Métadonnées par nom SportMonks : code interne, drapeau flagcdn (ISO 2 lettres),
// et nom localisé fr / en / pt-BR / es.
const META = {
  "Argentina":             { code: "ARG", flag: "ar",     fr: "Argentine",          en: "Argentina",            pt: "Argentina",             es: "Argentina" },
  "France":                { code: "FRA", flag: "fr",     fr: "France",             en: "France",               pt: "França",                es: "Francia" },
  "Spain":                 { code: "ESP", flag: "es",     fr: "Espagne",            en: "Spain",                pt: "Espanha",               es: "España" },
  "England":               { code: "ENG", flag: "gb-eng", fr: "Angleterre",         en: "England",              pt: "Inglaterra",            es: "Inglaterra" },
  "Brazil":                { code: "BRA", flag: "br",     fr: "Brésil",             en: "Brazil",               pt: "Brasil",                es: "Brasil" },
  "Morocco":               { code: "MAR", flag: "ma",     fr: "Maroc",              en: "Morocco",              pt: "Marrocos",              es: "Marruecos" },
  "Portugal":              { code: "POR", flag: "pt",     fr: "Portugal",           en: "Portugal",             pt: "Portugal",              es: "Portugal" },
  "Netherlands":           { code: "NED", flag: "nl",     fr: "Pays-Bas",           en: "Netherlands",          pt: "Países Baixos",         es: "Países Bajos" },
  "Germany":               { code: "GER", flag: "de",     fr: "Allemagne",          en: "Germany",              pt: "Alemanha",              es: "Alemania" },
  "Belgium":               { code: "BEL", flag: "be",     fr: "Belgique",           en: "Belgium",              pt: "Bélgica",               es: "Bélgica" },
  "Croatia":               { code: "CRO", flag: "hr",     fr: "Croatie",            en: "Croatia",              pt: "Croácia",               es: "Croacia" },
  "Mexico":                { code: "MEX", flag: "mx",     fr: "Mexique",            en: "Mexico",               pt: "México",                es: "México" },
  "Colombia":              { code: "COL", flag: "co",     fr: "Colombie",           en: "Colombia",             pt: "Colômbia",              es: "Colombia" },
  "United States":         { code: "USA", flag: "us",     fr: "États-Unis",         en: "United States",        pt: "Estados Unidos",        es: "Estados Unidos" },
  "Senegal":               { code: "SEN", flag: "sn",     fr: "Sénégal",            en: "Senegal",              pt: "Senegal",               es: "Senegal" },
  "Japan":                 { code: "JPN", flag: "jp",     fr: "Japon",              en: "Japan",                pt: "Japão",                 es: "Japón" },
  "Uruguay":               { code: "URU", flag: "uy",     fr: "Uruguay",            en: "Uruguay",              pt: "Uruguai",               es: "Uruguay" },
  "Switzerland":           { code: "SUI", flag: "ch",     fr: "Suisse",             en: "Switzerland",          pt: "Suíça",                 es: "Suiza" },
  "Austria":               { code: "AUT", flag: "at",     fr: "Autriche",           en: "Austria",              pt: "Áustria",               es: "Austria" },
  "Korea Republic":        { code: "KOR", flag: "kr",     fr: "Corée du Sud",       en: "South Korea",          pt: "Coreia do Sul",         es: "Corea del Sur" },
  "Australia":             { code: "AUS", flag: "au",     fr: "Australie",          en: "Australia",            pt: "Austrália",             es: "Australia" },
  "Iran":                  { code: "IRN", flag: "ir",     fr: "Iran",               en: "Iran",                 pt: "Irã",                   es: "Irán" },
  "Türkiye":               { code: "TUR", flag: "tr",     fr: "Turquie",            en: "Türkiye",              pt: "Turquia",               es: "Turquía" },
  "Norway":                { code: "NOR", flag: "no",     fr: "Norvège",            en: "Norway",               pt: "Noruega",               es: "Noruega" },
  "Ecuador":               { code: "ECU", flag: "ec",     fr: "Équateur",           en: "Ecuador",              pt: "Equador",               es: "Ecuador" },
  "Egypt":                 { code: "EGY", flag: "eg",     fr: "Égypte",             en: "Egypt",                pt: "Egito",                 es: "Egipto" },
  "Côte d'Ivoire":         { code: "CIV", flag: "ci",     fr: "Côte d'Ivoire",      en: "Ivory Coast",          pt: "Costa do Marfim",       es: "Costa de Marfil" },
  "Algeria":               { code: "ALG", flag: "dz",     fr: "Algérie",            en: "Algeria",              pt: "Argélia",               es: "Argelia" },
  "Canada":                { code: "CAN", flag: "ca",     fr: "Canada",             en: "Canada",               pt: "Canadá",                es: "Canadá" },
  "Panama":                { code: "PAN", flag: "pa",     fr: "Panama",             en: "Panama",               pt: "Panamá",                es: "Panamá" },
  "Sweden":                { code: "SWE", flag: "se",     fr: "Suède",              en: "Sweden",               pt: "Suécia",                es: "Suecia" },
  "Scotland":              { code: "SCO", flag: "gb-sct", fr: "Écosse",             en: "Scotland",             pt: "Escócia",               es: "Escocia" },
  "Paraguay":              { code: "PAR", flag: "py",     fr: "Paraguay",           en: "Paraguay",             pt: "Paraguai",              es: "Paraguay" },
  "Congo DR":              { code: "COD", flag: "cd",     fr: "RD Congo",           en: "DR Congo",             pt: "RD Congo",              es: "RD Congo" },
  "Czech Republic":        { code: "CZE", flag: "cz",     fr: "Rép. Tchèque",       en: "Czechia",              pt: "Tchéquia",              es: "Chequia" },
  "Qatar":                 { code: "QAT", flag: "qa",     fr: "Qatar",              en: "Qatar",                pt: "Catar",                 es: "Catar" },
  "Uzbekistan":            { code: "UZB", flag: "uz",     fr: "Ouzbékistan",        en: "Uzbekistan",           pt: "Uzbequistão",           es: "Uzbekistán" },
  "Tunisia":               { code: "TUN", flag: "tn",     fr: "Tunisie",            en: "Tunisia",              pt: "Tunísia",               es: "Túnez" },
  "Saudi Arabia":          { code: "KSA", flag: "sa",     fr: "Arabie Saoudite",    en: "Saudi Arabia",         pt: "Arábia Saudita",        es: "Arabia Saudí" },
  "Iraq":                  { code: "IRQ", flag: "iq",     fr: "Irak",               en: "Iraq",                 pt: "Iraque",                es: "Irak" },
  "South Africa":          { code: "RSA", flag: "za",     fr: "Afrique du Sud",     en: "South Africa",         pt: "África do Sul",         es: "Sudáfrica" },
  "Bosnia and Herzegovina":{ code: "BIH", flag: "ba",     fr: "Bosnie-Herzégovine", en: "Bosnia & Herzegovina", pt: "Bósnia e Herzegovina",  es: "Bosnia y Herzegovina" },
  "Cape Verde Islands":    { code: "CPV", flag: "cv",     fr: "Cap-Vert",           en: "Cape Verde",           pt: "Cabo Verde",            es: "Cabo Verde" },
  "Jordan":                { code: "JOR", flag: "jo",     fr: "Jordanie",           en: "Jordan",               pt: "Jordânia",              es: "Jordania" },
  "Ghana":                 { code: "GHA", flag: "gh",     fr: "Ghana",              en: "Ghana",                pt: "Gana",                  es: "Ghana" },
  "New Zealand":           { code: "NZL", flag: "nz",     fr: "Nouvelle-Zélande",   en: "New Zealand",          pt: "Nova Zelândia",         es: "Nueva Zelanda" },
  "Curacao":               { code: "CUW", flag: "cw",     fr: "Curaçao",            en: "Curaçao",              pt: "Curaçao",               es: "Curazao" },
  "Haiti":                 { code: "HAI", flag: "ht",     fr: "Haïti",              en: "Haiti",                pt: "Haiti",                 es: "Haití" }
};

function meta(name) {
  return META[name] || { code: (name || "—").slice(0, 3).toUpperCase(), flag: "", fr: name || "—", en: name || "—", pt: name || "—", es: name || "—" };
}

function det(details, code) {
  const d = (details || []).find((x) => x.type && x.type.code === code);
  return d ? Number(d.value) : 0;
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SportMonks ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Un seul passage sur les fixtures de la phase de groupes. Retourne :
 *   - fair    : score fair-play FIFA par équipe (participant_id)
 *   - matches : résultats des matchs terminés [{a, ga, b, gb}] (confrontation directe)
 *
 * Fair-play (art. 13) — une seule déduction, la pire, par joueur et par match :
 *   1 jaune = -1 | 2e jaune = -3 | rouge direct = -4 | jaune + rouge direct = -5
 * Types SportMonks : 19 = jaune, 21 = jaune/rouge (2e jaune), 20 = rouge direct.
 */
async function computeFromFixtures(stageId) {
  const [start, end] = GROUP_WINDOW;
  const fair = {};
  const matches = [];
  let page = 1;
  for (;;) {
    const url =
      `${BASE}/fixtures/between/${start}/${end}` +
      `?api_token=${API_TOKEN}&include=participants;scores;events.type&filters=fixtureLeagues:732` +
      `&per_page=50&page=${page}`;
    const json = await getJSON(url);
    const fixtures = json.data || [];

    for (const fx of fixtures) {
      if (stageId && fx.stage_id !== stageId) continue; // matchs de groupe uniquement

      // --- Cartons → fair-play (par équipe, joueur) ---
      const byPlayer = {};
      for (const ev of fx.events || []) {
        if (ev.rescinded) continue;
        const t = ev.type_id;
        if (t !== 19 && t !== 20 && t !== 21) continue;
        const part = ev.participant_id;
        const who = ev.player_id != null ? "p" + ev.player_id : "c" + ev.coach_id;
        const key = part + ":" + who;
        const o = byPlayer[key] || (byPlayer[key] = { part: part, y: 0, r: 0, yr: 0 });
        if (t === 19) o.y++;
        else if (t === 20) o.r++;
        else o.yr++;
      }
      for (const key in byPlayer) {
        const o = byPlayer[key];
        let p = 0;
        if (o.yr >= 1) p = -3;
        else if (o.r >= 1 && o.y >= 1) p = -5;
        else if (o.r >= 1) p = -4;
        else if (o.y >= 2) p = -3;
        else if (o.y === 1) p = -1;
        fair[o.part] = (fair[o.part] || 0) + p;
      }

      // --- Résultat final (matchs terminés) pour la confrontation directe ---
      if (fx.state_id === 5) { // 5 = Full-Time
        const goals = {};
        for (const s of fx.scores || []) {
          if (s.description === "CURRENT" && s.participant_id != null && s.score) {
            goals[s.participant_id] = s.score.goals;
          }
        }
        const ids = Object.keys(goals);
        if (ids.length === 2) {
          matches.push({ a: +ids[0], ga: goals[ids[0]], b: +ids[1], gb: goals[ids[1]] });
        }
      }
    }

    const pg = json.pagination || {};
    if (!pg.has_more) break;
    page++;
    if (page > 10) break;
  }
  return { fair, matches };
}

// Mini-classement de confrontation directe parmi un sous-ensemble d'équipes.
function h2hStats(teams, matches) {
  const ids = new Set(teams.map((t) => t.id));
  const st = {};
  teams.forEach((t) => (st[t.id] = { pts: 0, gd: 0, gf: 0 }));
  for (const m of matches) {
    if (!ids.has(m.a) || !ids.has(m.b)) continue;
    const A = st[m.a], B = st[m.b];
    A.gf += m.ga; A.gd += m.ga - m.gb;
    B.gf += m.gb; B.gd += m.gb - m.ga;
    if (m.ga > m.gb) A.pts += 3;
    else if (m.ga < m.gb) B.pts += 3;
    else { A.pts++; B.pts++; }
  }
  return st;
}

/**
 * RÈGLEMENT 1 — égalités dans un groupe (FIFA WC 2026, confrontation directe d'abord).
 * Tri primaire par points généraux ; pour départager les équipes à égalité de points :
 *   1. points en confrontation directe (entre les seules équipes à égalité)
 *   2. différence de buts en confrontation directe
 *   3. buts marqués en confrontation directe
 *   4. différence de buts générale (tous les matchs du groupe)
 *   5. buts marqués généraux
 *   6. fair-play (cartons jaunes/rouges)
 *   (ultime garde-fou : classement mondial FIFA puis nom)
 */
function rankGroup(teams, matches) {
  // Tri primaire : points généraux. On départage ensuite chaque bloc d'ex æquo.
  const sorted = teams.slice().sort((a, b) => b.pts - a.pts);
  const out = [];
  let i = 0;
  while (i < sorted.length) {
    // Bloc d'équipes à égalité de POINTS.
    let j = i + 1;
    while (j < sorted.length && sorted[j].pts === sorted[i].pts) j++;
    const run = sorted.slice(i, j);
    if (run.length > 1) {
      const h = h2hStats(run, matches); // mini-classement entre les seules équipes à égalité
      run.sort(
        (a, b) =>
          h[b.id].pts - h[a.id].pts ||              // 1. pts confrontation directe
          h[b.id].gd - h[a.id].gd ||                // 2. diff. de buts confrontation directe
          h[b.id].gf - h[a.id].gf ||                // 3. buts marqués confrontation directe
          b.gd - a.gd ||                            // 4. diff. de buts générale
          b.gf - a.gf ||                            // 5. buts marqués généraux
          (b.fair || 0) - (a.fair || 0) ||          // 6. fair-play (plus haut = mieux)
          (a.fifa || 999) - (b.fifa || 999) ||      // garde-fou : classement FIFA
          a.name.localeCompare(b.name)
      );
    }
    out.push(...run);
    i = j;
  }
  return out;
}

async function main() {
  // 1) Standings → 4 équipes de chaque groupe.
  const standings = await getJSON(
    `${BASE}/standings/seasons/${SEASON_ID}` +
      `?api_token=${API_TOKEN}&include=participant;group;details.type`
  );
  const rows = standings.data || [];
  if (!rows.length) throw new Error("Réponse SportMonks vide (standings).");
  const stageId = rows[0].stage_id;

  // 2) Fair-play (cartons) + résultats des matchs (confrontation directe).
  const { fair: fairByTeam, matches } = await computeFromFixtures(stageId);

  // Regroupe les 4 équipes de chaque groupe avec leurs stats globales.
  const groupsRaw = {};
  for (const r of rows) {
    const gname = (r.group && r.group.name) || "";
    const letter = (gname.match(/Group\s+([A-L])/i) || [])[1];
    if (!letter) continue;
    const d = r.details;
    const p = r.participant || {};
    const mi = meta(p.name);
    (groupsRaw[letter] = groupsRaw[letter] || []).push({
      group: letter,
      id: p.id,
      mi,                       // métadonnées multilingues (noms fr/en/pt/es)
      name: mi.fr,              // utilisé pour le départage stable (localeCompare)
      played: det(d, "overall-matches-played"),
      pts: det(d, "overall-points") || Number(r.points) || 0,
      gf: det(d, "overall-goals-for"),
      ga: det(d, "overall-goals-against"),
      gd: det(d, "goal-difference"),
      fair: fairByTeam[p.id] || 0,
      fifa: FIFA_RANK[p.name] || null,
    });
  }

  // Classe chaque groupe 1→4 (vrais critères FIFA). Collecte les 3èmes (langue-neutre).
  const groupsRanked = {};
  const thirds = [];
  let allPlayed = true;
  for (const letter of Object.keys(groupsRaw).sort()) {
    const ranked = rankGroup(groupsRaw[letter], matches);
    ranked.forEach((t) => { if (t.played < 3) allPlayed = false; });
    groupsRanked[letter] = ranked;
    if (ranked[2]) thirds.push(ranked[2]);
  }

  // 3) 8 meilleurs 3èmes (critères FIFA a→f, sans confrontation directe car groupes différents).
  thirds.sort(
    (a, b) =>
      b.pts - a.pts ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      (b.fair || 0) - (a.fair || 0) ||
      (a.fifa || 999) - (b.fifa || 999) ||
      a.name.localeCompare(b.name)
  );
  const best3 = thirds.slice(0, QUALIFY_COUNT).map((t) => t.group).sort();

  // 4) Un data.json + une copie embarquée par langue (les noms d'équipes sont localisés).
  for (const lang of LANGS) {
    const groups = {};
    for (const letter of Object.keys(groupsRanked)) {
      groups[letter] = groupsRanked[letter].map((t, idx) => ({
        code: t.mi.code, name: t.mi[lang], short: t.mi[lang], flag: t.mi.flag,
        played: t.played, pts: t.pts, gf: t.gf, ga: t.ga, gd: t.gd, rank: idx + 1,
      }));
    }
    const out = {
      updated: new Date().toISOString(),
      source: "SportMonks + classement FIFA (11/06/2026)",
      season: "2026",
      lang,
      qualifyCount: QUALIFY_COUNT,
      allPlayed,
      groups,
      best3,
      thirdsRanking: thirds.map((t, i) => ({
        group: t.group, code: t.mi.code, name: t.mi[lang], flag: t.mi.flag,
        pts: t.pts, gd: t.gd, gf: t.gf, qualified: i < QUALIFY_COUNT,
      })),
    };
    const dataFile = lang === "fr" ? "data.json" : `data-${lang}.json`;
    // Le FR alimente aussi la variante thème sombre (même langue, mêmes données).
    const htmlFiles = lang === "fr" ? ["bracket-live.html", "bracket-live-dark.html"] : [`bracket-live-${lang}.html`];
    fs.writeFileSync(path.join(__dirname, dataFile), JSON.stringify(out, null, 2));

    // Copie de secours embarquée dans le widget (repli pour l'ouverture en local file://).
    for (const htmlFile of htmlFiles) {
      try {
        const htmlPath = path.join(__dirname, htmlFile);
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, "utf8");
          const re = /\/\*WC_DATA_START\*\/[\s\S]*?\/\*WC_DATA_END\*\//;
          if (re.test(html)) {
            fs.writeFileSync(htmlPath, html.replace(re, "/*WC_DATA_START*/" + JSON.stringify(out) + "/*WC_DATA_END*/"));
          }
        }
      } catch (e) {
        console.warn(`⚠ injection HTML ignorée (${htmlFile}) :`, e.message);
      }
    }
    console.log(`✓ ${dataFile} écrit (${lang})`);
  }

  console.log(`✓ ${Object.keys(groupsRanked).length}/12 groupes, allPlayed=${allPlayed}`);
  console.log(`  Meilleurs 3èmes qualifiés : ${best3.join(", ")}`);
  thirds.forEach((t, i) => {
    const mark = i < QUALIFY_COUNT ? "✅" : "❌";
    console.log(
      `  ${mark} ${String(i + 1).padStart(2)}. [${t.group}] ${t.mi.fr.padEnd(18)} ` +
        `${t.pts}pts  diff ${t.gd >= 0 ? "+" + t.gd : t.gd}  BP ${t.gf}  (J${t.played})`
    );
  });
}

main().catch((e) => {
  console.error("✗", e.message || e);
  process.exit(1);
});
