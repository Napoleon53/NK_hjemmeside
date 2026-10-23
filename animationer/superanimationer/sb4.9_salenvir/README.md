# sb4.9 Syntese af Salenvir

Et virtuelt laboratorieforsøg bygget som superanimation (brugerens valg 22. okt.
2026): eleven gennemfører syntesen af Salenvir fra SDU's øvelsesvejledning
"Organisk syntese af et potentielt antiviralt lægemiddel mod HAB-virus" trin for
trin. Kun syntesevejledningen er med; introduktionen (HAB-virus, DBE-1,2-DA,
svampen og afstemningen af reaktionen med biproduktet) er bevidst udeladt, som
brugeren bad om. Teksterne er skrevet om, ikke kopieret fra vejledningen.

Ikke i menuen. Kan åbnes direkte og ved et bestemt trin med `index.html#trin6`. Kemibogen B
linker til den fra afsnit B8.6 TLC med `#trin6` (23. okt. 2026, Prøv selv).

**Gjort mere brugervenlig 22. okt. 2026** (brugerens ønske efter første kig: "Uret der
tikker er stressende. Det er også lidt træls at opløsningen koger mens man er i gang med
at besvare et spørgsmål. Det er generelt svært / træls at afmåle, som nemt kan gøres
forkert. Lav gerne direkte knapper"):

* Intet ur. Tiden står stille og går kun i korte animationer på 2-3 sekunder:
  opvarmningen til 75 °C, dryppene, "Vent 10 minutter" mellem to TLC-plader, kølingen
  i isbadet og tørringen under lampen. Intet ændrer sig, mens eleven læser eller svarer.
* Magnetomrøreren holder opløsningen på 75-76 °C, så den aldrig koger.
* En grøn knap står ved den ting, kortet beder om ("Sug 1,4 mL op", "Hæld 100 mL i
  måleglasset", "Dryp i kolben" osv.). Den gør skridtet som en animation med
  opskriftens mængde. Et klik på tingen gør det samme. Tingene kan stadig trækkes, men
  pipetten suger selv den rigtige mængde op, og måleglasset stopper ved 100 mL.
  Grøn, fordi den gule farve er hintknappen.
* Konstant masse (to ens vejninger) er taget ud: krystallerne tørres under lampen og
  vejes én gang. Vejes de våde, kommer det med i skemaet, og kortet beder om at tørre.

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

| Trin | Den grønne knap | Det, der stadig kan gå galt |
|--|--|--|
| 1 Magneten | Læg magneten i kolben | |
| 2 1,4 mL salicylaldehyd | Sug 1,4 mL op, Tøm pipetten i kolben | |
| 3 100 mL ethanol | Hæld 100 mL i måleglasset, Hæld i kolben | |
| 4 Omrøring og varme | Tænd omrøringen, Tænd varmen, Sæt termometret i; så varmes opløsningen af sig selv op til 75 °C | |
| 5 0,5 mL ethylendiamin | (gæt først) Sug 0,5 mL op, Dryp i kolben | |
| 6 TLC | Sæt en prøve ved P, Sæt referencen ved R, Stil pladen i glasset, Stil pladen under lampen; spørgsmål | første plade: ikke færdig, Vent 10 minutter, ny plade |
| 7 Afkøling | Sluk varmen, Sæt kolben i isbadet (bliver kold af sig selv); spørgsmål | |
| 8 Sugefiltrering | Fugt filtrerpapiret, Åbn for suget, Hæld kolben i tragten, Skyl kolben | trukket i hånden uden sug: tragten bliver fuld og løber langsomt |
| 9 Tørring og vejning | Stil urglasset på vægten, Skrab krystallerne over, Stil urglasset under lampen, Stil urglasset på vægten; udbyttet i et felt | urglas, der ikke er vejet tomt: et nyt urglas; våde krystaller vejer for meget |
| 10 Smeltepunkt | Fyld røret, Sæt røret i apparatet, Tænd apparatet, Det smelter nu, Alt er smeltet; spørgsmål | et klik, før noget smelter, tæller ikke |

Hjælpen er den gule knap på kortet: et hint om, hvorfor skridtet gøres, og så Vis
svaret, som gør skridtet. Et klik i scenen, mens kortet viser et gæt, et spørgsmål
eller et grønt kort, får kortet til at blinke; under en animation sker der intet.
Listen i panelet springer til et trin; trinnene før bliver gjort efter opskriften
(`forbered` i `js/sim.js`).

Påskeæg: fem klik på omrøringens knap hurtigt efter hinanden giver fuld fart,
og magnetloppen hopper i kolben.

## Filerne

| Fil | Indhold |
|--|--|
| `index.html` | siden, teorien og rundvisningen |
| `css/stil.css` | stilarket (grundlag sc7.5); uret, prikkerne og feltet til udbyttet nederst |
| `js/data.js` | **al tekst**: trinnene, delene med teksten på den grønne knap, hint, spørgsmål, beskeder og etiketter |
| `js/kemi.js` | modellen: stofmængder, temperatur, reaktionens fart, opløselighed, filtrering, tørring, smeltepunkt, TLC |
| `js/sim.js` | scenen: udstyr, træk og slip, hældning, tegning, hvilken del eleven er ved (`delNu`, `skiltNu`), animationerne bag den grønne knap (`udfoer`, `opdaterAnim`) og skridtet på én gang (`goer`) |
| `js/trin.js` | kortet øverst, den grønne knap ved tingen (`visHandling`), listen over trinnene og hjælpeknappen |
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
  0,35 pr. min, fordoblet pr. 15 °C, og halveret uden omrøring. Hver dråbe
  ethylendiamin tager 0,1 min, så den første TLC-plade er taget efter ca. 1 minut
  (ikke færdig), og pladen efter "Vent 10 minutter" viser, at reaktionen er færdig.
* Opløseligheden af Salenvir i ethanol er et skøn, 0,12 g pr. 100 mL ved 5 °C
  og ganget med 1,045 pr. grad, valgt så alt er opløst ved 75 °C, krystallerne
  kommer ved ca. 66 °C, og udbyttet bliver ca. 90 % i isbad, ca. 85 % ved
  stuetemperatur og ca. 40 % ved 45 °C.
* Tab, der er valgt: 6 % af krystallerne bliver i kolben uden skylning, 3 % på
  filtrerpapiret, 5 % under et papir, der ikke er fugtet, 2 % ved flytning
  mellem to urglas.
* Varme: magnetomrøreren holder opløsningen på 75-76 °C (som en regulering), så den
  aldrig koger; vejledningen siger pladen på 100 °C under opsyn. Modellen kan stadig
  lade ethanol koge væk over 78 °C, men det sker ikke i animationen. Isbadet køler mod 2 °C.
* Tørring: ethanolen i krystallerne falder eksponentielt, 2,4 min under lampen
  og 35 min på bordet. Suget trækker filterkagen ned til 0,22 g ethanol pr. g.
* Smeltepunktet falder med 120 °C pr. g ethanol pr. g krystal (starten) og 60 °C
  pr. andel salicylaldehyd i krystallerne; en lille tilfældig forskydning pr.
  forsøg. Et klik på linsen tæller kun, når noget er begyndt at smelte (og igen,
  når alt er smeltet), så aflæsningen ligger inden for en grad af modellen.
* TLC: Rf-værdier valgt efter vejledningens figur 2 (salicylaldehyd 0,62,
  Salenvir 0,38). Ethylendiamin ses ikke i UV-lys. Pladen er forstørret.
* Laboratoriets tid står stille og går kun i animationerne (se øverst).
* Pipetterne er inddelt fra spidsen og op, så tallet vokser, når der suges.

## Selvtesten

`_selvtest.html` (102 påstande, ALT OK 22. okt. 2026, efter ombygningen): modellens
tal, hele syntesen med den grønne knap alene, at tiden står stille, mens kortet venter
og under et spørgsmål, at opløsningen aldrig koger, TLC med to plader, klik og træk på
tingene med opskriftens mængder, konsekvenserne (urglas, der ikke er vejet, våde
krystaller, et klik før noget smelter), låsen under spørgsmål og animationer, Vis
svaret gennem alle trin, teksternes længde og sprog, og kortets højde og den grønne
knaps plads på fire skærmstørrelser.

## Linjen til menuen

Når brugeren siger til: en knap i `kemi-b-filer/samling_b4,5,6.html` (B4
Funktionelle grupper) eller en kommende B8 Medicin, `FEEDBACK_EMNER`, og
kolonnen "I menuen" i superanimationernes README.
