#!/usr/bin/env node
/**
 * Génère les variantes traduites du widget à partir du master FR (bracket-live.html).
 *   bracket-live-en.html · bracket-live-pt.html · bracket-live-es.html
 *
 * Traduit uniquement l'INTERFACE (les noms d'équipes viennent de data-<lang>.json,
 * produit par fetch-data.js). Relancer après toute modif. du master FR :
 *   node build-langs.js && node fetch-data.js
 */
const fs = require("fs");
const path = require("path");

const MASTER = path.join(__dirname, "bracket-live.html");
let master = fs.readFileSync(MASTER, "utf8");
// On part d'un master « propre » : la copie de secours embarquée sera réinjectée
// par fetch-data.js dans chaque langue, donc on la remet à zéro ici.
master = master.replace(/\/\*WC_DATA_START\*\/[\s\S]*?\/\*WC_DATA_END\*\//, "/*WC_DATA_START*/{}/*WC_DATA_END*/");

// Remplacements communs (indépendants de la langue) appliqués à chaque variante :
function urlAndData(lang) {
  return [
    ["/wc26-bracket-live/bracket-live.html", "/wc26-bracket-live/bracket-live-" + lang + ".html"],
    ["'data.json?_='", "'data-" + lang + ".json?_='"],
    ["'FINALE'", "'FINAL'"],
  ];
}

const LANGS = {
  en: {
    htmlLang: "en", ogLocale: "en_US", dateLoc: "en-GB",
    repl: [
      ['<html lang="fr">', '<html lang="en">'],
      ["Bracket LIVE de la Coupe du monde 2026 — classements en direct", "LIVE FIFA World Cup 2026 bracket — live group standings"],
      ["Le bracket de la Coupe du monde 2026 auto-rempli en direct : classements des groupes en temps réel (données SportMonks) et seizièmes de finale calculés à l'instant t.", "The FIFA World Cup 2026 bracket auto-filled live: real-time group standings (SportMonks data) and the round of 32 computed in real time."],
      ["Coupe du Monde FIFA 2026 - Bracket Interactif | Top Mercato", "FIFA World Cup 2026 - Interactive Bracket | Top Mercato"],
      ["Complétez votre bracket de la Coupe du Monde FIFA 2026 et partagez votre pronostic. Canada · Mexique · États-Unis — 11 juin au 19 juillet 2026.", "Fill in your FIFA World Cup 2026 bracket and share your predictions. Canada · Mexico · USA — June 11 to July 19, 2026."],
      ["Bracket Coupe du Monde FIFA 2026 - Top Mercato", "FIFA World Cup 2026 Bracket - Top Mercato"],
      ['content="fr_FR"', 'content="en_US"'],
      ["<h2>COUPE DU MONDE <span>FIFA 2026™</span></h2>", "<h2>FIFA WORLD CUP <span>2026™</span></h2>"],
      ["Classement des groupes en direct<br><strong>Les 1/16e se remplissent automatiquement.</strong><br>Cliquez ensuite pour faire avancer vos favoris en phase finale.", "Live group standings<br><strong>The round of 32 fills in automatically.</strong><br>Then click to send your favourites through the knockout stage."],
      ['<span class="wc-live-badge">EN DIRECT</span>', '<span class="wc-live-badge">LIVE</span>'],
      ["chargement…", "loading…"],
      ["Phase de groupes — classement en temps réel", "Group stage — live standings"],
      ["1er &amp; 2e qualifiés", "1st &amp; 2nd qualify"],
      ["3e (8 meilleurs)", "3rd (best 8)"],
      ["> éliminé</span>", "> eliminated</span>"],
      ["Chargement des classements en direct…", "Loading live standings…"],
      ["Meilleurs 3es — qualifiés pour les seizièmes", "Best third-placed teams — qualified for the round of 32"],
      ["Les 8 meilleures équipes classées 3e (sur 12) qualifiées d'office, selon les critères FIFA ", "The 8 best third-placed teams (out of 12) qualify automatically, per FIFA criteria "],
      ["Glissez pour naviguer dans le bracket", "Swipe to navigate the bracket"],
      ["Champion du Monde 2026", "World Champion 2026"],
      ["Partager mon pronostic", "Share my predictions"],
      ["Télécharger l'image du bracket", "Download the bracket image"],
      [">\nE-mail\n", ">\nEmail\n"],
      ["À déterminer", "To be decided"],
      ["Petite finale · 3e place", "Third-place play-off"],
      ["'mis à jour le '", "'updated '"],
      ["dt.toLocaleDateString('fr-FR'", "dt.toLocaleDateString('en-GB'"],
      ["' à '+dt.toLocaleTimeString('fr-FR'", "' at '+dt.toLocaleTimeString('en-GB'"],
      ["el.textContent='mis à jour';", "el.textContent='updated';"],
      ["données momentanément indisponibles", "data temporarily unavailable"],
      ["Impossible de charger les classements (data.json).", "Unable to load standings (data-en.json)."],
      ["var p1='COUPE DU MONDE ';var p2='FIFA 2026\\u2122';", "var p1='FIFA WORLD CUP ';var p2='2026\\u2122';"],
      ["'Canada \\u00b7 Mexique \\u00b7 \\u00c9tats-Unis \\u2014 11 juin au 19 juillet 2026'", "'Live group standings — round of 32 auto-filled'"],
      ["'Classez chaque groupe, choisissez les meilleurs 3es, puis cliquez pour faire avancer les pays.'", "'Click to send your favourites through the knockout stage.'"],
      ["Génération en cours…", "Generating…"],
      ["'Erreur lors de la génération : '", "'Error while generating: '"],
      ["Découvrez mon bracket complet de la Coupe du Monde FIFA 2026 🏆 ! Les résultats des groupes et jusqu\\'à la finale.", "Check out my full FIFA World Cup 2026 bracket 🏆! From the group standings all the way to the final."],
    ],
  },
  pt: {
    htmlLang: "pt-BR", ogLocale: "pt_BR", dateLoc: "pt-BR",
    repl: [
      ['<html lang="fr">', '<html lang="pt-BR">'],
      ["Bracket LIVE de la Coupe du monde 2026 — classements en direct", "Chave AO VIVO da Copa do Mundo 2026 — classificação dos grupos ao vivo"],
      ["Le bracket de la Coupe du monde 2026 auto-rempli en direct : classements des groupes en temps réel (données SportMonks) et seizièmes de finale calculés à l'instant t.", "A chave da Copa do Mundo 2026 preenchida ao vivo: classificação dos grupos em tempo real (dados SportMonks) e os 16-avos de final calculados na hora."],
      ["Coupe du Monde FIFA 2026 - Bracket Interactif | Top Mercato", "Copa do Mundo FIFA 2026 - Chave Interativa | Top Mercato"],
      ["Complétez votre bracket de la Coupe du Monde FIFA 2026 et partagez votre pronostic. Canada · Mexique · États-Unis — 11 juin au 19 juillet 2026.", "Preencha sua chave da Copa do Mundo FIFA 2026 e compartilhe seu palpite. Canadá · México · EUA — 11 de junho a 19 de julho de 2026."],
      ["Bracket Coupe du Monde FIFA 2026 - Top Mercato", "Chave da Copa do Mundo FIFA 2026 - Top Mercato"],
      ['content="fr_FR"', 'content="pt_BR"'],
      ["<h2>COUPE DU MONDE <span>FIFA 2026™</span></h2>", "<h2>COPA DO MUNDO <span>FIFA 2026™</span></h2>"],
      ["Classement des groupes en direct<br><strong>Les 1/16e se remplissent automatiquement.</strong><br>Cliquez ensuite pour faire avancer vos favoris en phase finale.", "Classificação dos grupos ao vivo<br><strong>Os 16-avos se preenchem automaticamente.</strong><br>Depois clique para avançar seus favoritos no mata-mata."],
      ['<span class="wc-live-badge">EN DIRECT</span>', '<span class="wc-live-badge">AO VIVO</span>'],
      ["chargement…", "carregando…"],
      ["Phase de groupes — classement en temps réel", "Fase de grupos — classificação ao vivo"],
      ["1er &amp; 2e qualifiés", "1º &amp; 2º classificados"],
      ["3e (8 meilleurs)", "3º (8 melhores)"],
      ["> éliminé</span>", "> eliminado</span>"],
      ["Chargement des classements en direct…", "Carregando a classificação ao vivo…"],
      ["Meilleurs 3es — qualifiés pour les seizièmes", "Melhores 3º colocados — classificados para os 16-avos"],
      ["Les 8 meilleures équipes classées 3e (sur 12) qualifiées d'office, selon les critères FIFA ", "As 8 melhores seleções em 3º lugar (de 12) classificadas automaticamente, segundo os critérios da FIFA "],
      ["Glissez pour naviguer dans le bracket", "Deslize para navegar pela chave"],
      ["Champion du Monde 2026", "Campeão Mundial 2026"],
      ["Partager mon pronostic", "Compartilhar meu palpite"],
      ["Télécharger l'image du bracket", "Baixar a imagem da chave"],
      [">\nE-mail\n", ">\nE-mail\n"],
      ["À déterminer", "A definir"],
      ["Petite finale · 3e place", "Disputa de 3º lugar"],
      ["'mis à jour le '", "'atualizado em '"],
      ["dt.toLocaleDateString('fr-FR'", "dt.toLocaleDateString('pt-BR'"],
      ["' à '+dt.toLocaleTimeString('fr-FR'", "' às '+dt.toLocaleTimeString('pt-BR'"],
      ["el.textContent='mis à jour';", "el.textContent='atualizado';"],
      ["données momentanément indisponibles", "dados temporariamente indisponíveis"],
      ["Impossible de charger les classements (data.json).", "Não foi possível carregar a classificação (data-pt.json)."],
      ["var p1='COUPE DU MONDE ';var p2='FIFA 2026\\u2122';", "var p1='COPA DO MUNDO ';var p2='FIFA 2026\\u2122';"],
      ["'Canada \\u00b7 Mexique \\u00b7 \\u00c9tats-Unis \\u2014 11 juin au 19 juillet 2026'", "'Classificação dos grupos ao vivo — 16-avos preenchidos automaticamente'"],
      ["'Classez chaque groupe, choisissez les meilleurs 3es, puis cliquez pour faire avancer les pays.'", "'Clique para avançar seus favoritos no mata-mata.'"],
      ["Génération en cours…", "Gerando…"],
      ["'Erreur lors de la génération : '", "'Erro ao gerar: '"],
      ["Découvrez mon bracket complet de la Coupe du Monde FIFA 2026 🏆 ! Les résultats des groupes et jusqu\\'à la finale.", "Veja minha chave completa da Copa do Mundo FIFA 2026 🏆! Da fase de grupos até a final."],
    ],
  },
  es: {
    htmlLang: "es", ogLocale: "es_ES", dateLoc: "es-ES",
    repl: [
      ['<html lang="fr">', '<html lang="es">'],
      ["Bracket LIVE de la Coupe du monde 2026 — classements en direct", "Cuadro EN VIVO del Mundial 2026 — clasificación de los grupos en directo"],
      ["Le bracket de la Coupe du monde 2026 auto-rempli en direct : classements des groupes en temps réel (données SportMonks) et seizièmes de finale calculés à l'instant t.", "El cuadro del Mundial 2026 autocompletado en vivo: clasificación de los grupos en tiempo real (datos SportMonks) y los dieciseisavos calculados al instante."],
      ["Coupe du Monde FIFA 2026 - Bracket Interactif | Top Mercato", "Mundial FIFA 2026 - Cuadro Interactivo | Top Mercato"],
      ["Complétez votre bracket de la Coupe du Monde FIFA 2026 et partagez votre pronostic. Canada · Mexique · États-Unis — 11 juin au 19 juillet 2026.", "Completa tu cuadro del Mundial FIFA 2026 y comparte tu pronóstico. Canadá · México · EE. UU. — del 11 de junio al 19 de julio de 2026."],
      ["Bracket Coupe du Monde FIFA 2026 - Top Mercato", "Cuadro del Mundial FIFA 2026 - Top Mercato"],
      ['content="fr_FR"', 'content="es_ES"'],
      ["<h2>COUPE DU MONDE <span>FIFA 2026™</span></h2>", "<h2>COPA MUNDIAL <span>FIFA 2026™</span></h2>"],
      ["Classement des groupes en direct<br><strong>Les 1/16e se remplissent automatiquement.</strong><br>Cliquez ensuite pour faire avancer vos favoris en phase finale.", "Clasificación de los grupos en directo<br><strong>Los dieciseisavos se completan automáticamente.</strong><br>Luego haz clic para hacer avanzar a tus favoritos en la fase final."],
      ['<span class="wc-live-badge">EN DIRECT</span>', '<span class="wc-live-badge">EN VIVO</span>'],
      ["chargement…", "cargando…"],
      ["Phase de groupes — classement en temps réel", "Fase de grupos — clasificación en directo"],
      ["1er &amp; 2e qualifiés", "1º y 2º clasificados"],
      ["3e (8 meilleurs)", "3º (8 mejores)"],
      ["> éliminé</span>", "> eliminado</span>"],
      ["Chargement des classements en direct…", "Cargando la clasificación en directo…"],
      ["Meilleurs 3es — qualifiés pour les seizièmes", "Mejores terceros — clasificados para los dieciseisavos"],
      ["Les 8 meilleures équipes classées 3e (sur 12) qualifiées d'office, selon les critères FIFA ", "Los 8 mejores terceros (de 12) clasificados automáticamente, según los criterios de la FIFA "],
      ["Glissez pour naviguer dans le bracket", "Desliza para navegar por el cuadro"],
      ["Champion du Monde 2026", "Campeón del Mundo 2026"],
      ["Partager mon pronostic", "Compartir mi pronóstico"],
      ["Télécharger l'image du bracket", "Descargar la imagen del cuadro"],
      [">\nE-mail\n", ">\nCorreo\n"],
      ["À déterminer", "Por definir"],
      ["Petite finale · 3e place", "Partido por el 3.er puesto"],
      ["'mis à jour le '", "'actualizado el '"],
      ["dt.toLocaleDateString('fr-FR'", "dt.toLocaleDateString('es-ES'"],
      ["' à '+dt.toLocaleTimeString('fr-FR'", "' a las '+dt.toLocaleTimeString('es-ES'"],
      ["el.textContent='mis à jour';", "el.textContent='actualizado';"],
      ["données momentanément indisponibles", "datos no disponibles por el momento"],
      ["Impossible de charger les classements (data.json).", "No se pudo cargar la clasificación (data-es.json)."],
      ["var p1='COUPE DU MONDE ';var p2='FIFA 2026\\u2122';", "var p1='COPA MUNDIAL ';var p2='FIFA 2026\\u2122';"],
      ["'Canada \\u00b7 Mexique \\u00b7 \\u00c9tats-Unis \\u2014 11 juin au 19 juillet 2026'", "'Clasificación de los grupos en directo — dieciseisavos autocompletados'"],
      ["'Classez chaque groupe, choisissez les meilleurs 3es, puis cliquez pour faire avancer les pays.'", "'Haz clic para hacer avanzar a tus favoritos en la fase final.'"],
      ["Génération en cours…", "Generando…"],
      ["'Erreur lors de la génération : '", "'Error al generar: '"],
      ["Découvrez mon bracket complet de la Coupe du Monde FIFA 2026 🏆 ! Les résultats des groupes et jusqu\\'à la finale.", "¡Mira mi cuadro completo del Mundial FIFA 2026 🏆! De la fase de grupos hasta la final."],
    ],
  },
};

function applyAll(src, pairs) {
  let out = src, missing = [];
  for (const [from, to] of pairs) {
    if (out.indexOf(from) === -1) missing.push(from.slice(0, 50));
    out = out.split(from).join(to);
  }
  return { out, missing };
}

for (const lang of Object.keys(LANGS)) {
  const cfg = LANGS[lang];
  const pairs = cfg.repl.concat(urlAndData(lang));
  const { out, missing } = applyAll(master, pairs);
  const file = path.join(__dirname, "bracket-live-" + lang + ".html");
  fs.writeFileSync(file, out);
  console.log(`✓ bracket-live-${lang}.html généré`);
  if (missing.length) console.warn(`  ⚠ ${missing.length} chaîne(s) introuvable(s) :\n   - ` + missing.join("\n   - "));
}
