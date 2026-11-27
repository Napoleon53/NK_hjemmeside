# Bundfald (sc_spil_bundfald)

Forklaringer på fagord synker ned gennem et bægerglas, og eleven skriver
fagordet, før forklaringen når bunden. Et rigtigt svar opløser krystallen; en
krystal, der når bunden, bliver til et lag bundfald. Kategorien Spil, ikke i
menuen. Bygget 27. nov. 2026 på Niels' bestilling: "et slags gravityspil med
fagord til kemisiden", der kan spille sammen med Kemibogens fagordssider, hvor
man selv vælger fagordene, "lidt ala Organisk sortering". Navnet, glasset og
reglerne er Claudes valg.

## Bestillingen

1. **Pointen:** eleven kan genkalde fagordet ud fra bogens forklaring og stave
   det. Det er det modsatte af Quiz: fem hurtige og Kort og godt, hvor fagordet
   står på skærmen og skal genkendes.
2. **Afløser og hvad der er med:** afløser intet. Med fra Organisk sortering:
   ting, der falder, niveauer med mere fart, liv (her lag bundfald), point,
   rekord og panelet med det sidste fagord. Fagordene og deres tekster er
   Kemibogens fagordslister, samme brik (højst 90 tegn) som Kort og godt.
3. **Naboerne:** Kort og godt (`sc_spil9_kemikort`) ejer vendekort og parring,
   Syregalgen ejer gæt ét bogstav ad gangen, Kemi-Millionær og bogens quiz ejer
   at vælge blandt fire. Her skrives fagordet.
4. **Loftet:** én side, ingen faner. Højst tre krystaller i glasset, fem lag
   bundfald, otte niveauer, tre tempoer.
5. **Layoutet:** scene plus panel som Organisk sortering. Scenen er glasset med
   svarfeltet på bordet nedenunder; panelet er point, bundfald, niveau, det
   sidste fagord og listerne Opløst og Drillede.

## Fagordene

- **Fra bogen:** flisen Bundfald i trin 2 på fagordslisterne (`stil/fagord.html`
  i `NK_Undervisning/Kemibogen`) åbner `index.html#kort=<sættet>` i en ny fane,
  præcis det samme sæt som Kort og godt (base64 af `Sæt:`, `Sider:` og en linje
  pr. fagord med tabulator). `&parring` efter sættet gør ingen skade, så et link
  til Kort og godt virker også her, når mappenavnet byttes. Flisen kommer på
  siderne, næste gang bogen bygges.
- **Vælg selv:** `js/fagord.js` er bogens fagordslister for C (kapitel 1 til 8
  og temaerne) og B (B1 til B8), 532 fagord. Eleven vælger kapitler, og under
  "Vælg afsnit og enkelte fagord" afsnit og enkelte ord. A-bogen er ikke med.
  `#b` åbner Kemi B, `#c4` og `#b4` vælger et kapitel, `#tema-klima` et tema,
  `#tempo=hurtigt` tempoet.
- **Egne fagord:** fagord, tabulator (eller `|` eller `;`) og forklaring, én
  linje pr. fagord, som Quizlet og Kort og godt. Højst 60 tegn i fagordet og 220
  i forklaringen.
- **Opdatér bogens fagord:** `python _lav_fagord.py` læser `fagord/*.qmd` og
  `b/fagord/*.qmd` i Kemibogen og skriver `js/fagord.js` igen. Det låner
  reglerne for brikken fra bogens `vaerktoej/tjek_fagord.py`. Kør det, når
  fagordslisterne er rettet, og kør selvtesten bagefter. Fra et link slår
  spillet den lange forklaring op i `js/fagord.js` til panelet; findes den ikke,
  står brikken.

## Reglerne

- Krystallen falder i et fast antal sekunder fra overfladen til en tom bund
  (`D.FALDTID` i `js/spil.js`), uanset hvor høj den er. Bundfaldet hæver bunden,
  så den sidste del af glasset går hurtigere.
- Halvvejs nede kommer første bogstav og en streg pr. bogstav (ord på et eller
  to bogstaver får kun streger). Før det giver et fagord 100 point, bagefter 50,
  plus 10 pr. rigtigt svar i træk (højst 100 ekstra).
- En krystal på bunden standser spillet. Kortet viser fagordet, eleven skriver
  det af (i ordbanken: Fortsæt), og krystallen bliver til et lag. Fagordet kommer
  igen efter tre andre. Fem rigtige i træk rører et lag op igen (glasstaven).
  Fem lag, og glasset er fyldt.
- Et forkert fagord får alle krystaller til at synke 5 % af vejen. Det gør
  tilfældige klik i ordbanken dyre.
- Stavning: store og små bogstaver, mellemrum, bindestreg og skråstreg er
  ligegyldige, ae/oe/aa er æ/ø/å, sænkede og hævede tal er tal, græske bogstaver
  kan skrives som navnet eller bogstavet. Én fejl godtages i ord på 5 til 9 tegn
  og to fra 10 tegn (et ombyttet bogstavpar er én fejl), men aldrig, når svaret
  er lige så tæt på et andet fagord i sættet (alken er ikke en stavefejl for
  alkan). Spillet viser så, hvordan ordet staves.
- Nyt niveau for hver 4 opløste fagord. Krystaller på én gang: 1 på niveau 1-2,
  2 på 3-5 og 3 fra 6, men aldrig flere end banerne (en smal skærm har to).
- Slut: alle fagord opløst. Tre stjerner uden bundfald, to med højst to lag,
  ellers én. Slutkortet viser de fagord, der drillede, med forklaringen og
  knappen "Øv dem, der drillede", som starter et nyt spil med kun dem.
- Rekorden hører til sættet (de samme fagord), tempoet og ordbanken og ligger i
  browseren (`nk-bundfald`). Ingen fælles top 10.

| Niveau | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|--------|---|---|---|---|---|---|---|---|
| Roligt, s | 32 | 29 | 26 | 24 | 22 | 20 | 19 | 18 |
| Normalt, s | 24 | 21 | 19 | 17 | 15 | 13,5 | 12,5 | 11,5 |
| Hurtigt, s | 16 | 14 | 12,5 | 11 | 10 | 9 | 8 | 7,5 |

Roligt er valgt fra start (Organisk sortering blev for hurtigt for dem, der
gerne vil øve, 4. okt. 2026).

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | siden: scene, svarlinje, panel og reglerne |
| `css/stil.css` | mørk toplinje og panel som de andre spil, lys scene, krystallerne som papirkort i Lexend (`../faelles/lexend`) |
| `sprites/baegerglas.svg` | glasset (viewBox 1000 × 800; indersiden x 78 til 922, overfladen y 112, bunden y 758) |
| `js/fagord.js` | bogens fagord, lavet af `_lav_fagord.py`; ret ikke i hånden |
| `js/ord.js` | stavning, sammenligning, hjælpen, sæt som tekst og linket |
| `js/spil.js` | reglerne uden tegning; alle tal i `NK.Spil.D` |
| `js/scene.js` | glasset, krystallerne (DOM), bundfaldet og effekterne (to canvas) |
| `js/lyd.js` | lydene, lavet med Web Audio |
| `js/app.js` | startkortet, svarfeltet, panelet, pause og slut |
| `_selvtest.html` | 64 tjek: bogens data, stavningen, sæt og link, reglerne og siden i en iframe; kør over en server |

Bundfaldets farver er sølvchlorid (hvid), kobber(II)hydroxid (blå), blyiodid
(gul), jern(III)hydroxid (brun) og nikkel(II)hydroxid (grøn), et pr. lag.

## Ikke lavet

- Ikke i menuen. Kommer det i menuen, får mappen et nummer
  (`sc_spil10_bundfald`), linjen til `til_panelet.js` og en `data-emne`, og
  adressen `BUNDFALD` i bogens `stil/fagord.html` skal rettes med.
- Ingen Kemichael, ingen rundvisning, ingen musik.
