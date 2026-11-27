# Syntesemester (sc_spil_syntesemester)

Et konkurrencespil i tre lag om organisk kemi på B-niveau, kapitel B4. Kategorien
Spil. Ikke i menuen og intet nummer endnu.

| Lag | Link | Eleven | Konkurrerer på |
|-----|------|--------|----------------|
| 1 Grupperne | `index.html#lag1` | slår molekylerne med den rigtige gruppe (muldvarpespil, 9 huller) | niveau 10: hurtighed og præcision |
| 2 Reaktionerne | `index.html#lag2` | finder produktet, reagenset over pilen, reaktionstypen eller udgangsstoffet | 1 minut: rigtige minus forkerte |
| 3 Syntesen | `index.html#lag3` | skriver ruten fra udgangsstoffet til målet som et reaktionsskema | planen: den korteste vej; tiden giver kun lidt |

Hvert lag har sin egen personlige rekord og sin egen top 10.

## Bestillingen

Niels 27. nov. 2026: et andet konkurrencespil end Organisk sortering, "noget med at
genkende funktionelle grupper ala wackamole.. måske noget med syntesevej.. hvor man
hurtigt skal kunne opskrive / vælge reaktanter der kan føre til de korrekte produkter..
Gerne spil i forskellige lag, så man kan vælge det nemt og blive lvl up.. men også så
de dygtigste elever kan konkurrere på andet end reaktionstid." Første udkast er bygget
direkte; navnet, lagene og reglerne er Claudes valg.

1. **Pointen:** stofklassen ses på den funktionelle gruppe, den afgør, hvilke reaktioner
   stoffet kan indgå i, og en syntese er en rute langs pilene på syntesekortet i B4.7.
2. **Afløser:** intet. Ligner Organiske grupper (`sc_spil4_organiske_grupper`) i lag 1.
3. **Naboerne:** `sc_spil4_organiske_grupper` ejer sorteringen med faldende molekyler,
   `sb4.5_organisk_syntese` fabrikken med estere og oxidation, `sb4.4` oxidationen af
   alkoholer og `sb4.1` navnene. Her skrives ingen navne; navnene står ved tegningerne,
   undtagen på svarene i lag 2, hvor endelsen ellers ville afsløre svaret.
4. **Loftet:** tre lag, ingen faner ud over lagene. Lag 1: 9 huller, 11 stofklasser og 5
   test, højst 5 molekyler fremme. Lag 2: 6 reaktionstyper, 4 svar (6 ved typen). Lag 3:
   9 reagenskort, 6 synteser pr. runde (fra 2 til 5 trin).
5. **Layoutet:** scene plus panel. Opgaven står på et papirkort øverst i midten i alle
   tre lag; panelet har point, liv/tid/trin, det sidste molekyle eller svar eller ruten,
   og rekorderne i de tre lag. Start- og slutkortet har top 10.

## Lag 1: Grupperne

* Molekylerne dukker op på papirkort i ni huller i et laboratoriebord. Skiltet øverst
  siger gruppen med stor skrift ("Slå alle **alkoholer**", hydroxygruppe · R−OH). Når
  gruppen skifter, står den nye gruppe midt i scenen i 1,4 s, mens bordet er tomt og
  tiden står stille. På niveau 1-9 er det en boks ("Første gruppe", "Næste gruppe"),
  der venter på Start (Enter); på niveau 10 lukker den af sig selv efter 1,4 s.
  Gruppen står hele tiden med hvidt på et grønt bånd lige oven over bordet (Niels:
  "selv når boksen er lukket står det med grønt over feltet"). Klik eller tasterne 1-9
  (som et numerisk tastatur). Musen er en hammer.
* Eleven vælger niveauet på startkortet (og slutkortet). Niveau 1-8 lægger én eller to
  stofklasser til ad gangen, niveau 9 er testene fra B4.7, og niveau 10 er det hele.
  Niveau 1-9 er øvelse uden rekord og fortsætter op gennem niveauerne. Kun et spil, der
  begynder på niveau 10, giver rekord og top 10. På niveau 10 skifter gruppen tilfældigt,
  og for hver 8 rigtige bliver det 5 % hurtigere og giver 10 s mere.
* Et rigtigt slag: 100 point + 10 pr. niveau, gange serien (×1 til ×5, ét trin pr. 5
  rigtige i træk). Kortet bliver grønt, og navnet kommer frem.
* Et forkert slag: et liv, serien nulstilles, og et kort viser molekylet med gruppen
  grøn og hvad stofklassen og gruppen på skiltet kendes på. Tiden står stille, til eleven
  trykker Fortsæt. Et molekyle fra gruppen, der smutter, bryder serien.
* 90 sekunder fra start, 10 mere pr. nyt niveau. Nye stofklasser kommer med et kort med
  et eksempel (gruppen grøn), og tiden står stille imens.
* Slutkortet viser det, der drillede (fx "Keton slået, da gruppen var aldehyder").
* Tallene står i `D.LAG1` i `js/data.js`; molekylerne er kun kæder op til 6 C (ingen
  ringe), så det er gruppen, der skiller.

## Lag 2: Reaktionerne

* **Øv uden tid** er standard (Start på startkortet): tre liv og niveauer med fem
  spørgsmål (addition, oxidation, elimination og substitution, kondensation og
  hydrolyse, over pilen, baglæns, det hele); point = 100 × niveauet med bonus for
  rigtige i træk; ingen rekord.
* **1 minut på tid** er highscoren og har sit eget kort i panelet med rekorden, ugens
  top 5 (når scriptet svarer) og knappen Start 1 minut (Niels: "muligheden står ude i
  siden sammen med en highscore"). Point = rigtige minus forkerte. Det går videre af sig
  selv (0,6 s efter et rigtigt svar, 1,4 s efter et forkert, Enter springer over); ved et
  forkert svar lyser det rigtige grønt, og fejlen med forklaringen kommer i panelet
  ("Dine fejl", nyeste øverst). Slutkortet tilbyder **Tag de N, du glippede**: de samme
  spørgsmål uden tid og med forklaring; et forkert svar kommer igen til sidst, og
  opfølgningen giver ingen point og rører ikke rekorden.
* Fire slags spørgsmål, alle bygget af reaktionsreglerne (ingen faste opgaver):
  produktet, reaktionstypen (skemaet uden reagens, med de små molekyler som H₂O og
  HBr), reagenset over pilen og udgangsstoffet. 455 forskellige spørgsmål ud fra 61
  stoffer (27. nov. 2026), og svarmulighederne skifter fra gang til gang.
* De forkerte svar er typiske fejl med hver sin forklaring (`NK.Reaktion.forkerte`):
  gruppen på et carbonatom uden for dobbeltbindingen, to Br i stedet for ét,
  kraftig i stedet for mild oxidation, C=O på det forkerte carbonatom, dobbeltbindingen
  det forkerte sted, ombyttede dele i esteren og "Ingen reaktion". Mangler der svar,
  bruges stoffer ét trin væk på syntesekortet.
* Kortet øverst har to linjer (spørgsmålet og svaret med Næste til højre) og fast højde,
  så svarene ikke flytter sig. Skemaets og svarenes højde følger skærmen (`clamp`), og
  tegningerne måles efter pladsen. Et forkert svar viser forklaringen på fejlen, et
  rigtigt forklaringen på reaktionen; det rigtige svar får gruppen grøn.

## Lag 3: Syntesen

Bygget om 27. nov. 2026 (Niels: "der er en hylde og en kolbe.. jeg forstår det ikke
helt", og kortet fyldte for meget).

* Opgaven står i én linje øverst ("Lav ethylethanoat ud fra ethen. Korteste vej: 3 trin
  · din rute: 1") med Giv et hint til højre. Intet opgavekort.
* Målet står til venstre. Til højre står ruten som et reaktionsskema fra venstre mod
  højre, som synteserne i B4.7: stof, pil med reagenset over og betingelserne under
  (farvet efter reaktionstypen, med typens navn), stof og en stiplet pil til "?". Hvert
  reagenskort reagerer med det sidste stof i ruten. Ruten brydes over flere linjer.
* Kan der dannes flere stoffer (1- og 2-brompropan, but-1-en og but-2-en), vælger
  eleven, hvilket ruten fortsætter med. Hydrolysens andet stof kommer på lageret under
  målet ("Du har også"), sammen med de andre udgangsstoffer. Kondensationen tager en
  partner fra ruten eller lageret. Fortryd (eller Backspace) tager sidste trin væk.
* Den korteste vej regnes af `NK.Rute.kaede` (bredde-først over det sidste stof og det,
  der kan bruges som partner). Point: 300 pr. trin i den korteste vej; −100 pr. trin ud
  over, −50 pr. kort uden reaktion og pr. fortrudt trin, −20 % efter hint 1 og −40 %
  efter hint 2; +50 % for den korteste vej uden fejl og hint; højst +10 % for tiden
  (intet efter 120 s). "Vis en rute" giver 0 point.
* Hint 1 er ruten gennem stofklasserne ("alken → alkohol → carboxylsyre"); hint 2 er
  næste kort med en gul ring. Grupperne er ikke markeret.
* Seks synteser pr. runde, én fra hver række i `D.LAG3.RUNDE` (5 i hver række).

## Kemien

Reaktionerne er regler på molekylets graf i `js/reaktioner.js`, og molekylemotoren
navngiver produkterne. Kortene følger syntesekortet i B4.7 (kopi i
`sprites/syntesekort.svg`, vist bag knappen Syntesekortet):

| Kort | Reaktion |
|------|----------|
| Br₂, lys | substitution på en alkan, alle stillinger |
| H₂, katalysator | addition til C=C; C≡C bliver til C=C |
| HBr | addition til C=C, begge stillinger |
| H₂O, syre | addition af vand til C=C, eller hydrolyse af en ester |
| konc. H₂SO₄, varme | elimination af vand fra en alkohol |
| stærk base, varme | elimination af HBr fra en halogenalkan |
| KMnO₄, destillér | mild oxidation: primær alkohol → aldehyd, sekundær → keton, aldehyd → syre |
| KMnO₄, overskud | kraftig oxidation: primær alkohol → carboxylsyre, sekundær → keton |
| + partner, H₂SO₄, varme | kondensation: carboxylsyre + alkohol → ester, + amin → amid (B4.6) |

Molekylerne er sorte (Niels: de må ikke være farvekodet). Kun i forklaringerne efter et
svar og på kortet med en ny stofklasse er den funktionelle gruppe grøn som i bogen
(`K.GROEN`, bogens GROEN), uden overstregning. En alkan har ingen gruppe og får intet grønt.

**Forenklinger, valgt med vilje:** dibrom på en alken (bromvandstesten) og HBr eller vand
på en alkyn fører ikke videre; reduktion af C=O og substitution af en halogenalkan med
OH⁻ er ikke med (de står ikke på syntesekortet); en stærk base forsæber en ester og
neutraliserer en syre, så det kort ikke bruges der; amider hydrolyseres ikke; en
substitution giver kun ét Br. Elimination giver but-2-en uden cis og trans i navnet
(koordinaterne nulstilles før navngivningen, fordi der dannes en blanding). Markovnikov
er ikke med: begge produkter af en addition til en usymmetrisk alken er rigtige, som i
B4.1 ("I kemi B skal du kunne tegne begge produkter").

## Toplisterne

Det fælles script (`.claude/highscore/highscore.gs`, samme adresse som Organiske
grupper C). Listerne vises først, når scriptet kender spillet; indtil da har spillet kun
den personlige rekord (`nk-syntese-<lag>-rekord`, uge og alle tider). Navnet deles med
Organiske grupper. `index.html?ingenNet` slår forbindelsen fra (selvtesten).

Linjerne til `SPIL` i scriptet, når listerne skal tændes (lag 1 sender kun spil fra
niveau 10, lag 2 kun 1 minut):

```js
  /* Syntesemester (sc_spil_syntesemester), ét faneblad pr. lag */
  'syntese1': { navn: 'Syntesemester 1 Grupperne (niveau 10)', maks: 2000000, pointPrSekund: 3000 },
  'syntese2': { navn: 'Syntesemester 2 Reaktionerne (1 minut)', maks: 100, pointPrSekund: 2 },
  'syntese3': { navn: 'Syntesemester 3 Syntesen', maks: 10000, pointPrSekund: 600 }
```

Lag 3 kan højst give ca. 9 100 point (19 trin i den korteste vej × 300 × 1,6).

## Filerne

```
index.html          toplinjen med lagene, scenen og panelet
css/stil.css        moerk top og panel, lys scene, papirkort i Lexend
js/kerne.js         kopi af kernen fra Organiske grupper
js/data.js          stofklasserne, molekylerne, testene, kortene, niveauerne, synteserne
js/kemi.js          stofferne (motoren), gruppen og tegningen som SVG med overstregning
js/reaktioner.js    reglerne for de ni kort og de typiske fejl
js/rute.js          den korteste syntese
js/topliste.js      rekorderne og de faelles top 10
js/lyd.js           smaa lyde (Web Audio)
js/lag1.js          Grupperne
js/lag2.js          Reaktionerne
js/lag3.js          Syntesen
js/app.js           fanerne, start- og slutkortet, panelet og tasterne
sprites/syntesekort.svg   bogens figur fra B4.7
_selvtest.html      selvtesten
```

## Selvtesten

`_selvtest.html` over en server (iframe 1280 × 650): alle stoffers navn og klasse i
motoren, 22 reaktioner med kendt facit, alle kort på alle stoffer uden undtagelser og
med forklaring, alle 30 synteser som rute med den korteste vej fra data, sorte molekyler
og grøn gruppe, lag 1 fra niveau 1 (skiftet midt i scenen, tiden står stille, øvelse
uden rekord) og fra niveau 10 (tempo og rekord), næsten 600 spørgsmål i lag 2 med præcis
ét rigtigt svar og forklaring på hvert forkert, at svarene ikke flytter sig og ikke
stikker ud, øv uden tid og 1 minut, og en hel runde i lag 3 gennem spillets knapper med
Fortryd, boksen med næste gruppe, båndet over bordet, fejlene i panelet og opfølgningen.
Testen kontakter aldrig toplisten. 27. nov. 2026: ALT OK, 128 påstande.

## Menuen

Ikke i menuen. Kommer det i menuen, så omdøb mappen efter pladsen
(`sc_spil<nr>_syntesemester`) og læg en knap i `kemi-b-filer/samling_b4,5,6.html`
(og eventuelt `samling_c_spil.html`, men indholdet er B).
