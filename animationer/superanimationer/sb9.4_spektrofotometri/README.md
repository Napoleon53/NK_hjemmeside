# sb9.4 Spektrofotometri

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den samler `animationer/kemi-b-filer/b9.2_forsøg_breezer.html` og
`b9.4_nitritforsøg.html` i én animation, men er **ikke i menuen** endnu. De
gamle står urørt i menuen, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "Både b9.2 og b9.4 er forsøg med spektroskopi. Måske bør de samles
i en enkelt animation? Kan du lave en stilladseret udgave, hvor disse samles
i b.9.4 med 2 faner - en nem (sodavand) og en middel (nitrit-forsøg) og en
svær (sodavand med 2 farvestoffer)." Der står 2 faner, men tre er nævnt, så
der er tre. Resten af bestillingen er skrevet af Claude uden at spørge.

1. **Pointen:** En standardrække med kendte koncentrationer giver en ret
   linje A = a · c, og med den findes en ukendt koncentration ud fra
   absorbansen. Er der to farvede stoffer, lægges deres absorbanser sammen.
2. **Afløser b9.2 og b9.4.** Med fra b9.2: blindprøven først, standardrækken
   med fem røde standarder, displayet med A og T, mikroniveauet med fotoner,
   der bliver opsuget, og tælleren Ind/Ud, grafen med punkterne og linjen,
   hældningen (ε i den gamle) som et regnestykke, prøven som en gul stiplet
   linje, aflæsning på grafen, c = A / a og fortyndingen. Med fra b9.4:
   stamopløsningen 50,0 µM, standard 1 til 6 med 0 til 10 mL i 50 mL,
   sulfanilamid og koblingsreagens, ventetiden på 10 minutter, mikroniveauet
   med nitrit, diazoniumion og azofarvestof (kun azofarvestoffet er farvet),
   tabellen, fortyndingsformlen med brøkstreg, drikkevand og spildevand, og
   quizzen (seks spørgsmål, skrevet om, så de forkerte svar er de fejl, elever
   laver). Taget ud: Præsentér-rundturen og Sådan virker det (afløst af `?`),
   beregneren, der regnede for eleven (afløst af regnestykket i tre bidder),
   og de låste procedureknapper. Nyt: fane 3 med to farvestoffer, statuslinjen
   med hinttrappen, Ny prøve, grænseværdien for nitrit i drikkevand,
   påskeægget og realistiske ε-værdier.
3. **Naboerne:** sb9.1 ejer spektrene, farven og valget af bølgelængde (her
   er bølgelængden givet). sb9.3 ejer Lambert-Beers lov med ε og l og bruger
   også a for hældningen. b9.5 ejer eksamensopgaverne.
4. **Loftet:** tre faner, ét forsøg i hver. Fane 1: blindprøve, 5 standarder,
   1 prøve, 7 trin. Fane 2: 6 standarder, 2 vandprøver, 2 reagenser, 7 trin.
   Fane 3: blindprøve, 4 gule og 4 blå standarder, 1 prøve, 2 bølgelængder,
   4 trin. Hver fane har 2 eller 3 prøver til Ny prøve. Quizzen har 8
   spørgsmål.
5. **Layoutet:** scene plus panel. Scenen: opgavelinjen øverst, til venstre
   spektrofotometeret med zoomboblen under, til højre grafen (to på fane 3),
   nederst stativet med kuvetterne og statuslinjen. Panelet (480 px):
   spørgsmålet, trinene med regnestykket i det aktive trin, og tabellen med
   målingerne.

Kemichael er ikke med. Hjælpen står i statuslinjen som i `sc1.4_afstemning`.

Grænsen til laboratoriet: forsøgene følges trin for trin, men der hældes
ikke, og der er ingen uheld. Spektrofotometeret er modellen, eleven skruer på,
og alle tre faner handler om den samme sammenhæng mellem A og c.

## Stilladset

| | Fane 1 Sodavand (let) | Fane 2 Nitrit (middel) | Fane 3 To farvestoffer (svær) |
|--|--|--|--|
| Trin | 7 små trin | 7 trin | 4 store trin |
| Standardernes c | givet | eleven regner dem (fortynding) | givet |
| Standardkurven | tegnes, eleven regner hældningen | tegnes med ligningen, når c er regnet | tegnes med ligningen for hver bølgelængde |
| Prøvens c | aflæses på grafen, så regnes den | regnes med ligningen | eleven finder selv vejen |
| Regnestykket | formel, tal og resultat hver gang | formel, tal og resultat første gang, derefter kun resultatet | kun resultaterne |

## Fane 1: Sodavand

Blindprøven nulstiller. Måles en standard før, er tallet 0,042 for højt, og
punktet står rødt. Fem standarder (5,0 til 25,0 µM) giver punkterne, og
kurven tegnes. Eleven regner a = A / c ud fra et punkt (begge tal skal komme
fra samme standard), måler sodavanden, aflæser c på grafen (et forkert tal
tegnes som en rød linje, og linjen siger, hvor kurven ligger ved det tal),
regner c = A / a og til sidst koncentrationen i flasken med fortyndingen.

Påskeægget: flasken med ufortyndet sodavand kan også måles. A ligger langt
over standardkurven, og linjen siger, at det er derfor, sodavanden fortyndes.

## Fane 2: Nitrit

Kuvetterne er farveløse, til begge reagenser er tilsat (klik eller træk
flaskerne hen til stativet), og uret har gået 10 minutter. Zoomboblen viser
nitrit (blå ring) blive til diazoniumion (lilla ring) og azofarvestof (rødt).
Måles en kuvette for tidligt, er A for lille, og den skal måles igen.
Standard 1 er blindprøven med reagenser. Eleven regner c i standard 2 med
formel og tal, og standard 3 til 6 kun som resultater. Hvert punkt kommer på
grafen, når både c og A er kendt. Til sidst c = A / a for de to vandprøver,
og forklaringen sammenligner drikkevandet med grænseværdien 0,10 mg/L.

## Fane 3: To farvestoffer

Spektrofotometeret har to knapper, 427 nm og 630 nm. Alle standarder måles
ved begge. Graferne viser det ene farvestof hver med en kurve for hver
bølgelængde: det gule opsuger kun ved 427 nm, det blå mest ved 630 nm og lidt
ved 427 nm. c(blå) findes ved 630 nm. c(gul) kræver, at det blås bidrag ved
427 nm trækkes fra. Når det er løst, viser grafen A₄₂₇ som en stablet søjle
med det gules og det blås del.

## Beskederne

Typiske fejl får hver sin besked (alt i `js/forsoeg.js`):

| Fejlen | Beskeden |
|--------|----------|
| målt før nulstillingen | Instrumentet var ikke nulstillet, så tallet er 0,042 for højt. |
| målt før farven (fane 2) | Nitrit er farveløs … / Farven er ikke færdig endnu … |
| brøken vendt | Brøken er vendt. a er A pr. µM … |
| A · c eller A · a | A = a · c. For at få c alene skal A deles med a, ikke ganges. |
| lille a for stort A | Lille a er hældningen. Absorbansen skrives med stort A. |
| A og c fra to standarder | A og c skal komme fra den samme standard. |
| c i M | Skriv c i µM, som i tabellen. |
| rumfangene byttet om | Rumfangene er byttet om … |
| V_vand i stedet for V_efter | Del med hele rumfanget efter fortyndingen, 50,0 mL, ikke kun vandet. |
| rumfang i L | Skriv begge rumfang i mL. Så går enhederne ud. |
| den anden prøves A | Det er drikkevandets absorbans. Brug spildevandets … |
| c(blå) af A₄₂₇ | Ved 427 nm opsuger begge farvestoffer … |
| c(gul) uden at trække fra | For meget. … Træk det blås bidrag fra først. |
| det blå lagt til | Det blås bidrag skal trækkes fra, ikke lægges til. |
| A₆₃₀ trukket fra | A₆₃₀ er ikke det blås bidrag ved 427 nm … |
| kommaet forkert | Kommaet står forkert. |

Hintet er en trappe: to eller tre trin pr. bid, det sidste giver halvdelen af
svaret, og knappen giver derefter svaret på den bid, eleven er ved. Bruges Vis
svaret, får fanen ingen stjerne.

## Tallene og forenklingerne

* a = ε · l med l = 1,00 cm, i µM⁻¹. ε er afrundede litteraturværdier:
  E129 (allurarødt) 2,6 · 10⁴ ved 504 nm, E102 (tartrazin) 2,7 · 10⁴ ved
  427 nm, E133 (brillantblåt) 1,3 · 10⁵ ved 630 nm, alle i L/(mol · cm).
  E133's absorbans ved 427 nm er sat til 5 % af toppen (den lille top ved
  410 nm), og E102 opsuger intet ved 630 nm.
* Griess-farvestoffet: ε ≈ 5,0 · 10⁴ L/(mol · cm) ved 540 nm. Reagenserne
  fortynder 50 mL til 54 mL, så hældningen pr. µM nitrit i kolben er 0,0463.
  Kurven laves direkte med c(NO₂⁻) i kolben, og fortyndingen fra reagenserne
  er med i hældningen.
* Fane 2 har en lille, fast målestøj (højst 0,005), så kurven er en
  regression gennem (0, 0). Fane 1 og 3 har ingen støj.
* Blindprøven nulstiller ved begge bølgelængder på én gang (fane 3).
* Ufortyndet giver baggrunden 0,042 (kuvetten og vandet) ved alle
  bølgelængder.
* Grænseværdien for nitrit i drikkevand ved taphanen er 0,10 mg/L
  (M(NO₂⁻) = 46,01 g/mol, dvs. 2,17 µM).
* Svaret godtages inden for 1,2 til 2 % (afrunding), aflæsningen inden for
  1 µM.

## Filer

```
index.html         toplinjen, de tre faner, teorien, quizzen og rundvisningen
css/stil.css       udseendet (grundlaget er sb2.1; nederst lærredet, trinene,
                   regnestykket, resultatfelterne og tabellen). NB: decimaltal
                   med PUNKTUM i CSS
sprites/           spektrofotometer, kuvette, dråbeflaske og sodavandsflaske
                   (målene står øverst i hver fil og i MAAL i js/scene.js)
js/kerne.js        NK-navnerum (som sb2.1)
js/data.js         stofferne (ε), de tre forsøg med kuvetter, prøver, grafer
                   og trin med tekster og hint, og quizzen
js/model.js        Lambert-Beers lov, farven på væsken, regressionen, elevens
                   tal og bogstaver og dommen over en formel
js/scene.js        lærredet: instrumentet, zoomboblen, graferne, stativet,
                   træk og slip
js/regning.js      regnestykket (formel, tal, resultat) og resultatfelterne
js/forsoeg.js      motoren for én fane: målingerne, trinene, tabellen,
                   statuslinjen, hinttrappen og alle beskederne
js/quiz.js         quizzen
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og løkken
_selvtest.html     udviklerværktøj, se nedenfor
```

En ny prøve er ét objekt i `proever` for fanen i `js/data.js`. Et nyt
farvestof er ét objekt i `D.STOFFER` med a ved hver bølgelængde.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>Enter</kbd> tjek ·
<kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Q</kbd> quiz · <kbd>Esc</kbd> luk. Direkte links: `#sodavand`, `#nitrit`,
`#farvestoffer` og `#quiz`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://). Den tjekker modellen (absorbanserne, summen ved 427 nm, farverne,
hældningerne), elevens tal og bogstaver, alle tre forsøg selv og med Vis
svaret, de typiske fejl, Ny prøve, påskeægget, træk og slip med rigtige
pointer-hændelser, quizzen, sproget og layoutet fra 1100 × 700 til
1600 × 950.
Sidst kørt: ALT OK (113 påstande), 2. oktober 2026.

## Til menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b9.html`, knap 4 `data-emne="b9.4"`, skal pege på
  `../superanimationer/sb9.4_spektrofotometri/index.html`, og beskrivelsen
  skal nævne sodavand, nitrit og to farvestoffer.
* Knap 2 (b9.2, Breezer-forsøg) fjernes, og knapperne efter den beholder
  deres numre eller omnummereres efter brugerens valg.
* De gamle flyttes med `git mv` til `kemi-c-filer/arkiv/` som
  `b9.2_forsøg_breezer_oldversion.html` og `b9.4_nitritforsøg_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` rettes, så b9.2 ikke står der mere.
* Kolonnen "I menuen" i superanimationernes README rettes.
