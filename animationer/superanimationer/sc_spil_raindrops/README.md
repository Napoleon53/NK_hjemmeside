# Ionregn (sc_spil_raindrops)

Rytmespil i Matrix-stil. Ioner falder ned i fire baner og lander på fangelinjen
præcis på musikkens slag. Eleven fanger dem i takt og samler dem i kolben til
neutrale ionforbindelser.

**Pointen i én sætning:** en ionforbindelse er neutral, så ladningerne skal gå op,
og det afgør, hvor mange af hver ion der skal med.

Spillet er nyt, ikke en afløser. Bygget 2. okt. 2026 på brugerens bestilling.
Kategorien Spil. Ikke i menuen.

## Faserne

| Takter | Fase | Ioner | Målet |
|--------|------|-------|-------|
| 1-8 | Intro | ingen; nedtælling og Matrix-regn | |
| 9-40 | Niveau 1 Opvarmning | én på slag 1 og 3 | vises som formel (MgCl₂); mindst 60 % af ionerne kan bruges |
| 41-72 | Niveau 2 Navnet | én på hvert slag | vises som navn (aluminiumoxid); mindst 50 % kan bruges |
| 73- | Niveau 3 Frit fald | én på hvert slag, af og til et ottendedelspar på slag 4 | intet mål; 4 eller 5 ioner giver bonus |

Ionerne falder altid i 2 takter (8 slag, 3,43 s ved 140 BPM). Sværhedsgraden
ligger i tætheden og iontyperne. I hver fase kommer der efter 8 takter med ioner
1 takt uden. Startskærmen kan begynde ved et niveau (også `index.html#niveau2`);
sangen starter så 2 takter før.

## Regler

* Fangst: Perfekt ±60 ms (300 point), God ±120 ms (100 point), ellers miss.
* Forbindelse: 1000 point. I niveau 3 giver 4 ioner 1000 og 5 ioner 2000 i bonus.
  Bonussen regnes på formelenheden, så Na₂Cl₂ er NaCl og giver ingen bonus.
* Combo ×1 til ×4: +1 for hver 3 forbindelser i træk, nulstilles ved en fejl.
  Multiplikatoren gælder alle point.
* Systemintegritet: −15 % ved en fejl, −3 % når en ion, der skulle bruges, falder
  forbi, +5 % ved en forbindelse. Ved 0 % er spillet slut.
* Fejl i niveau 1-2: en ion, der ikke er med i målet, eller én for meget. Kolben
  tømmes, og målet bliver stående.
* Fejl i niveau 3: ladning over ±6, eller en ladning, der ikke kan nå 0 inden for
  5 ioner (fx +4 med fire ioner).
* "Skulle bruges" betyder i niveau 1-2: med i målet og mangler stadig i kolben. I
  niveau 3: ionen ville have gjort kolben neutral.
* En fangst, der giver en fejl, giver ingen point.

Slutskærmen viser point, største combo, perfekte fangster, forbindelser og de
forbindelser, der gik galt, med den rigtige løsning, navnet og opskriften
(Mg²⁺ + 2 Cl⁻). I niveau 3 står der en mulig løsning for kolbens indhold.

## Musik og timing

* Al timing kommer fra `AudioContext.currentTime`. `performance.now()` bruges kun
  til at glatte uret mellem lydblokkene og til at datere tastetryk. Ingen
  `setTimeout` eller `setInterval` styrer spillet.
* Standard er 140 BPM. `Fast_music.mp3` går i **144 BPM** med første slag efter
  64 ms (målt med tempomåleren og kontrolleret med hi-hat og basstød). Den
  afspilles derfor 3 % langsommere (`MUSIC_BPM: 144`), indtil der kommer en ny fil.
  Opbygningen passer: de store skift i sangen falder ved takt 41 og 73. Sangen har
  116 takter.
* Fra harddisken kan siden ikke hente lydfilen selv. Så spilles metronom, indtil
  man vælger filen med **Vælg lydfil**. Den sidst valgte fil huskes i browseren
  (IndexedDB). Vælges en fil med samme navn som `MUSIC_URL`, bruges tallene fra
  `CONFIG`.
* En selvvalgt fil måles automatisk: tempo og første slag. Tallene kan rettes i
  felterne og huskes pr. filnavn. Er sangen for hurtig, kan man skrive det halve
  tempo; så lander ionerne på hvert andet slag.
* Uden lydfil laver spillet en metronom med et kraftigere klik og et basstød på
  1-slaget. Uden musik slutter spillet efter takt 104.
* **Kalibrér:** 4 klik at lytte på, 8 at trykke på. Gennemsnittet gemmes som
  korrektion og trækkes fra alle tryk. Visningen følger det hørbare
  (`baseLatency + outputLatency`).
* Spillet pauser, når fanen eller vinduet mister fokus. Fortsæt giver en kort
  nedtælling, mens lyden stadig står stille.

## Design

Sort baggrund, grøn monospace, Matrix-regn bag banerne (stærkere i introen).
Kationer er blå, kantede og har dobbelt fuld kant. Anioner er røde, runde og har
stiplet kant, så de kan skelnes uden farver. Fangelinjen pulserer på hvert slag
og mest på 1-slaget. Taster D F J K; på touchskærme trykker man på banen.

## Filerne

| Fil | Indhold |
|-----|---------|
| `js/config.js` | **CONFIG**: tempo, lydfil, faser i takter, ionpuljer, luft, vinduer, point, combo, integritet |
| `js/kemi.js` | ionerne, målene for niveau 1 og 2, formler, navne og løsninger |
| `js/spil.js` | modellen: planlægning af ionerne, fangst, kolben, point, integritet |
| `js/lyd.js` | AudioContext, uret, metronom, musik, effekter, kalibrering, tempomåleren |
| `js/tegning.js` | Matrix-regnen og banerne på de to lærreder |
| `js/app.js` | skærmene, tasterne, pause og løkken |
| `Fast_music.mp3` | brugerens forslag til musik (144 BPM) |
| `_selvtest.html` | tjekker kemien, reglerne, hele sangen med robotspillere, tempomåleren og sproget |

## Hvad man kan rette

* **Ny musik:** læg filen i mappen, sæt `MUSIC_URL`, `MUSIC_BPM` og `OFFSET_MS`.
  Går den i 140, sættes `MUSIC_BPM: 140`. Vælg den med Vælg lydfil for at få
  tallene målt.
* **Faserne:** `fra` og `til` i takter, `moenster`, `andel` og `ioner` i `CONFIG.FASER`.
* **Målene:** `Kemi.MAAL.n1` og `n2` i `js/kemi.js` som par af kation og anion.
* Kør `_selvtest.html` bagefter. Over en server tjekker den også siden.

## Forenklinger

* Niveau 3 godtager enhver neutral kombination, også blandede salte som KNaCO₃.
  Navnet sættes sammen af kationernes og anionernes navne i alfabetisk orden.
* Målene i niveau 2 er udvalgt, så de stoffer, der ikke findes (fx jern(III)iodid),
  ikke er med.
* Tempomåleren antager fast tempo. Takt 1 er det første slag, hvor musikken er gået i gang.

## Menuen

Ikke i menuen. Linjen, når brugeren siger til: `samling_c_spil.html`, mappen
`../animationer/superanimationer/sc_spil_raindrops/index.html`.
