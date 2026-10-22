# sb4.9 Syntese af Salenvir

Et virtuelt laboratorieforsøg bygget som superanimation (brugerens valg 22. okt.
2026): eleven gennemfører syntesen af Salenvir fra SDU's øvelsesvejledning
"Organisk syntese af et potentielt antiviralt lægemiddel mod HAB-virus" trin for
trin. Kun syntesevejledningen er med; introduktionen (HAB-virus, DBE-1,2-DA,
svampen og afstemningen af reaktionen med biproduktet) er bevidst udeladt, som
brugeren bad om. Teksterne er skrevet om, ikke kopieret fra vejledningen.

Ikke i menuen. Kan åbnes direkte og ved et bestemt trin med `index.html#trin6`.

## Bestillingen

1. **Pointen:** Salenvir laves i få trin, og hvert trin har sin grund: varm
   ethanol og omrøring får reaktionen i gang, TLC viser, hvornår salicylaldehyden
   er brugt op, og køling, sugefiltrering og tørring giver de gule krystaller,
   som vejes og smeltepunktsbestemmes.
2. **Afløser:** intet. Bygget fra bunden ud fra vejledningens trin 1-11 og
   appendiks om TLC (`Dropbox\2025.2026\2y Ke\SDU besøg pille til ide\syntesen (1).pdf`).
3. **Naboerne:** `sb4.5_organisk_syntese` ejer estersyntesen som spil; intet er
   taget derfra. Mængdeberegning (teoretisk og procentvis udbytte) ejer kapitel
   5 i C; her stopper udbyttet ved det praktiske udbytte i gram.
4. **Loftet:** én fane, ti trin, højst syv stykker udstyr fremme ad gangen,
   fire stoffer (salicylaldehyd, ethylendiamin, ethanol, Salenvir).
5. **Layoutet:** scene med kort øverst og et smalt panel (trinnene og elevens
   tal). Kun det udstyr, trinnet bruger, står fremme.

## Trinnene

| Trin | Eleven gør | Det, der kan gå galt, og konsekvensen |
|--|--|--|
| 1 Magneten | trækker magneten ned i kolben | |
| 2 1,4 mL salicylaldehyd | pipetten ned i flasken, holder ▲ Sug op, over kolben, holder ▼ Tøm | for meget: ▼ Tøm i flasken lader det løbe tilbage; kommer der for meget i kolben, bliver salicylaldehyd til overs, og TLC-pletten ved R forsvinder aldrig |
| 3 100 mL ethanol | holder flasken over måleglasset, så måleglasset over kolben | måleglasset kan løbe over |
| 4 Omrøring og varme | klikker på de to knapper, sætter termometret i | ethanol koger ved 78 °C, selv om pladen er 100 °C (bobler, damp, ethanolen fordamper) |
| 5 0,5 mL ethylendiamin | gætter først, venter til ca. 75 °C (⏩ 2 min), pipetten, dryp | tilsat koldt: reaktionen går langsomt |
| 6 TLC | prøve ved P, reference ved R, pladen i løbevæsken, under UV-lampen, svarer | ikke færdig: ny plade efter et par minutter (som vejledningens figur 2) |
| 7 Afkøling | slukker varmen, sætter kolben i isbadet, svarer på hvorfor | |
| 8 Sugefiltrering | fugter papiret, åbner hanen, venter til under 25 °C, hælder, skyller | filtreret varmt: Salenvir løber med ned i sugekolben; ufugtet papir: krystaller løber under; uden sug: tragten bliver fuld og løber langsomt |
| 9 Tørring og vejning | vejer urglasset, skraber krystallerne over, tørrer under lampen, vejer, til to vejninger giver det samme, skriver udbyttet | urglas, der ikke er vejet tomt: et nyt urglas, og krystallerne flyttes (lidt går tabt); våde krystaller vejer for meget |
| 10 Smeltepunkt | fylder røret, sætter det i, tænder, klikker på linsen ved start og slut, svarer | våde eller urene krystaller smelter lavere og bredere |

Hjælpen er den gule knap på kortet: et eller to hint og så Vis svaret, som gør
skridtet for eleven. Et klik i scenen, mens kortet viser et gæt, et spørgsmål
eller et grønt kort, får kortet til at blinke. Listen i panelet springer til et
trin; trinnene før bliver gjort efter opskriften (`forbered` i `js/sim.js`).

Påskeæg: fem klik på omrøringens knap hurtigt efter hinanden giver fuld fart,
og magnetloppen hopper i kolben.

## Filerne

| Fil | Indhold |
|--|--|
| `index.html` | siden, teorien og rundvisningen |
| `css/stil.css` | stilarket (grundlag sc7.5); uret, prikkerne og feltet til udbyttet nederst |
| `js/data.js` | **al tekst**: trinnene, delene, hint, spørgsmål, beskeder og etiketter |
| `js/kemi.js` | modellen: stofmængder, temperatur, reaktionens fart, opløselighed, filtrering, tørring, smeltepunkt, TLC |
| `js/sim.js` | scenen: udstyr, træk og slip, hældning, tegning, og hvilken del eleven er ved (`delNu`, `skiltNu`, `goer`) |
| `js/trin.js` | kortet øverst, listen over trinnene og hjælpeknappen |
| `js/tegning.js` | tegnehjælpere: væske i glas, gule skilte og ringe, knapper, etiketter |
| `js/sprites.js`, `sprites/` | udstyret som SVG; `_sprites.html` viser dem alene |
| `_selvtest.html` | selvtesten (gennem en lokal server) |

Udstyr fra andre mapper: kolben (sc6.3), magnetomrøreren med varme (sc2.1),
måleglasset (sb1.4, ny inddeling til 100 mL), urglasset (sc8.5, lysere kant),
spatlen og sprøjteflasken (sc6.1, etiket Ethanol), vægten (sc5.8) og
bægerglasset (sc7.5). Nyt: stativet, termometret, pipettebolden, flaskerne,
referenceglasset, UV-lampen, isbadet, sugekolben, Büchnertragten, hanen,
varmelampen og smeltepunktsapparatet.

## Tallene og forenklingerne

* Massefylder og molare masser fra CRC: salicylaldehyd 1,167 g/mL og 122,12
  g/mol, ethylendiamin 0,899 g/mL og 60,10 g/mol, Salenvir (salen) 268,31 g/mol.
  1,4 mL salicylaldehyd er 13,4 mmol og 0,5 mL ethylendiamin 7,48 mmol, så
  salicylaldehyd er begrænsende (2 : 1), og det teoretiske udbytte er 1,80 g.
  Reaktionsforholdet bruges i modellen, men vises ingen steder, fordi
  afstemningen hører til introduktionen.
* Smeltepunktet 127-128 °C er vejledningens.
* Reaktionens fart er et skøn: r = k(T) · min(n(sal)/2, n(en)) med k(75 °C) =
  0,35 pr. min, fordoblet pr. 15 °C, og halveret uden omrøring. Det giver en
  reaktion, der er færdig efter 10-15 minutter ved 75-78 °C.
* Opløseligheden af Salenvir i ethanol er et skøn, 0,12 g pr. 100 mL ved 5 °C
  og ganget med 1,045 pr. grad, valgt så alt er opløst ved 75 °C, krystallerne
  kommer ved ca. 66 °C, og udbyttet bliver ca. 90 % i isbad, ca. 85 % ved
  stuetemperatur og ca. 40 % ved 45 °C.
* Tab, der er valgt: 6 % af krystallerne bliver i kolben uden skylning, 3 % på
  filtrerpapiret, 5 % under et papir, der ikke er fugtet, 2 % ved flytning
  mellem to urglas.
* Varme: pladen nærmer sig 100 °C, kolben pladen med 0,13 pr. min; over 78 °C
  bliver varmen til fordampning af ethanol. Isbadet køler mod 2 °C.
* Tørring: ethanolen i krystallerne falder eksponentielt, 2,4 min under lampen
  og 35 min på bordet. Suget trækker filterkagen ned til 0,22 g ethanol pr. g.
* Smeltepunktet falder med 120 °C pr. g ethanol pr. g krystal (starten) og 60 °C
  pr. andel salicylaldehyd i krystallerne; en lille tilfældig forskydning pr.
  forsøg. Et klik på linsen tæller kun, når noget er begyndt at smelte (og igen,
  når alt er smeltet), så aflæsningen ligger inden for en grad af modellen.
* TLC: Rf-værdier valgt efter vejledningens figur 2 (salicylaldehyd 0,62,
  Salenvir 0,38). Ethylendiamin ses ikke i UV-lys. Pladen er forstørret.
* Laboratoriets ur går 30 gange hurtigere end skærmens; ⏩ 2 min spoler.
* Pipetterne er inddelt fra spidsen og op, så tallet vokser, når der suges.

## Selvtesten

`_selvtest.html` (114 påstande, ALT OK 22. okt. 2026): modellens tal, hele
syntesen med rigtige musehændelser (træk, hold og klik), TLC med to plader,
konsekvenserne (varm filtrering, urglas, der ikke er vejet, våde krystaller, for
meget salicylaldehyd), Vis svaret gennem alle trin, teksternes længde og sprog,
kortets højde og urets plads på fire skærmstørrelser, og at alle sprites indlæses.

## Linjen til menuen

Når brugeren siger til: en knap i `kemi-b-filer/samling_b4,5,6.html` (B4
Funktionelle grupper) eller en kommende B8 Medicin, `FEEDBACK_EMNER`, og
kolonnen "I menuen" i superanimationernes README.
