# sc2.1: Salt i vand

En superanimation i sin egen mappe med adskilt CSS, JavaScript og SVG-sprites.
Læreren Kemichael hentes fra `../../v2/kemichael/`, så mappen skal ligge i
`superanimation/`, der står ved siden af den.

Åbn **`index.html`**. Animationen bruger hverken `fetch` eller moduler og virker
derfor også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c2.1_salte_vand_oploest.html`.

## Hvad viser den

To faner om det samme spørgsmål: *hvad sker der, når et salt kommer i vand?*

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Opløsningen | vælger salt, temperatur og omrøring og ser gennem lupen | vandet river ionerne løs udefra og ind; omrøring og varme gør det hurtigere, men ikke mere |
| 2 | Mættet opløsning | hælder salt i 100 mL vand med spatlen og skruer på varmepladen med − og + | der er en grænse, og alt over den bliver liggende som bundfald |

Fane 2 har sit eget salt (runde T6). Opgaven bestemmer saltet, og først når de fire
opgaver er løst, kommer hylden med de seks salte frem.

### De seks salte

Den grønne streg over knappen betyder letopløseligt, den orange tungtopløseligt.
Grænsen er sat ved **1 g pr. 100 mL vand ved 20 °C**.

| Salt | | Hvorfor netop det |
|------|---|-------------------|
| NaCl | let | køkkensalt; kurven er næsten flad |
| KNO₃ | let | det modsatte: fra 13 g til 246 g mellem 0 og 100 °C |
| CaCl₂ | let | 1:2, så krystallen og ligningen viser to Cl⁻ for hver Ca²⁺ |
| CuSO₄ | let | farver opløsningen blå, og pulveret er blåt |
| CaCO₃ | tung | kridt og kalk, 0,0014 g pr. 100 mL |
| AgCl | tung | 0,00015 g pr. 100 mL, bundfaldet fra fældningsforsøgene |

### Fane 1: opløsningen

Til venstre står et bægerglas på en varmeplade med termometer, magnetomrører og
et saltkorn i bunden. Lupen over kornet viser udsnittet til højre, ion for ion.
Kornet bliver mindre, efterhånden som ionerne går i opløsning, og deles i flere
korn, når krystallen knuses. På en smal skærm ligger glasset som en boks i hjørnet
af lupbilledet.

* Vandmolekylerne finder en ion **i overfladen** (en side, der vender ud mod
  vandet; bunden af glasset tæller ikke) og vender den rigtige ende ind:
  oxygen (δ−) mod en positiv ion, hydrogen (δ+) mod en negativ.
* Når fire har fat, rives ionen løs. **De samme fire molekyler bliver med det
  samme ionens vandskal** og glider jævnt ud, mens ionen svømmer ud til et sted
  med plads. Arbejdsmolekylerne selv toner op et andet sted.
* Den frie ion beholder sin størrelse. Er der mere end 6 frie ioner i lupen,
  driver den ældste videre ud i resten af glasset og toner ud.
* Tungtopløselige salte stopper efter nogle få ioner (`D.frieIoner`).

**Vandmolekylerne ligger ikke oven i hinanden.** Frie ioner skubber blidt til
hinanden og viger for ioner på vej ud. Ledige vandmolekyler viger for vandskallerne
og for hinanden og toner op, hvor der er plads. Et nyt hold starter ikke lige ved
siden af et hold, der er i gang. Baggrundsvandet toner væk, hvor der ligger andet.
De frie ioner holder sig så højt, at deres vandskal ikke rammer molekylerne på
krystallens overside; området vokser, efterhånden som krystallen bliver lavere.
Selvtesten måler det.

**Temperaturen** (koldt, lunkent, varmt) bestemmer vandmolekylernes fart. Koldt
vand har isterninger, og varmepladen gløder ved varmt.

**Omrøring** starter magneten og en hvirvel i lupen. Efter 1, 4 og 8 sekunder
knækker krystallen langs et nyt snit (`SNIT`). Stykkerne lægger sig side om side
på bunden, og et stykke, der mister sin nederste række, falder ned. Der arbejder
to hold vandmolekyler pr. stykke, højst fire hold, og vandet bevæger sig 15 %
hurtigere. Et tungtopløseligt salt slipper stadig kun lige så mange ioner.

**Knapperne på varmepladen** kan drejes direkte i billedet. Knappen for omrøring
tænder og slukker. Knappen for varme går slukket → varm → **max** → slukket. Max
findes kun her, ikke i panelet. Panelets knapper følger med.

**Overkogning.** Står varmen på max, koger vandet efter 2 s (bobler i glasset og
i lupen, damp). Efter **30 s** på max koger opløsningen over: skum vælter ud over
kanten, løber ned ad glasset og breder sig på pladen, og vandstanden falder.
**5 s** efter kommer Kemichael med en sarkastisk bemærkning om ungdommen og
foreslår en ny krystal. Han lader varmen være, så eleven kan fortsætte. Skrues
der ned før tid, starter de 30 s forfra. Ny krystal rydder op, og han kommer igen
næste gang. Uheldet skrives i hans regnskab (`K.uheld()`).

**Uret** i lupens hjørne viser, hvor lang tid opløsningen har taget, og står
stille (grønt), når krystallen er væk. Under opgaven "hurtigst" er det stort og
står over bægerglasset.

Målt af selvtesten for NaCl (tre kørsler hver, 6. nov. 2026, efter lupen blev
lavere under papirkortet):

| | står stille | omrøring |
|---|---|---|
| koldt | ca. 48 s | ca. 26 s |
| lunkent | ca. 25 s | ca. 14 s |
| varmt | ca. 13 s | ca. 8 s |
| max | ca. 12 s | |

Derfor er grænsen i opgaven "hurtigst" **10 s** (`GRAENSE_SEK`, før 13 s): den kræver både
varme og omrøring, også hvis man skruer op på max. Målt ved 1100 × 700 til
1920 × 1050: varmt med omrøring 7,5 til 9 s, alt andet mindst 12 s. Ændres farten, antallet af hold,
snittene eller pladsreglerne, skal tallet måles igen.

### Fane 2: Mættet opløsning (runde T6, 21. nov. 2026)

Niels' ja til forslagene efter regelsættet (`../REGELSAET.md`): "Jatak Begynd på
T6". Før runden lå saltvalget, temperaturskyderen og tallene for glasset i
panelet, og tallet "Grænsen lige nu" afslørede svaret på flere af opgaverne. De
fire opgaver kom i tilfældig rækkefølge efter "Start opgave", grafen var meget
stor, og NaCl-kurven lå fladt i bunden, fordi aksen gik til 250 g.

**Intet panel** (regel 2-3). Fanen har fire opgaver, så de står i rækken øverst i
scenen med titler, der låses op i takt (regel 17-18), og ↺ Start forfra yderst til
højre. Kortet står under rækken og har en fast plads (regel 4).

**Scenen** (regel 32): glasset på varmepladen til venstre og kurven på et lyst papir
til højre, samlet i midten med en største bredde på 1260 px. På store skærme bliver
apparaterne større (bægerglasset op til 340 px), og der er højst 40 px luft mellem
kortet og forsøget.

* **Etiketten på glasset** (regel 22): 100 mL vand, Hældt i, Opløst og Bundfald med
  store sorte bogstaver på lyst papir. "Grænsen lige nu" er væk; det er kurvens job.
  Et tal, kortet spørger om, står som "?" (regel 38).
* **Varmepladens − og +** under pladen med temperaturen imellem (regel 2). Et klik er
  1 °C. Holdes knappen nede, går det hurtigt, og det stopper af sig selv, når kortets
  mål er nået. Termometeret i glasset følger med; tallet over termometeret er væk.
* **+5 g, +25 g og ↺** over spatlen. Kun det, kortet beder om, er fremme
  (regel 19a), og det har gul ramme og en boble ("Klik: +5 g", regel 19-20).
* **Kurven** har aksen efter saltet (NaCl 0-60 g, KNO₃ 0-250 g, de andre efter
  kurven) og vokser med, hvis der hældes mere i. "Skaler til stoffet" er væk.
  Aksetitlerne er fede og sorte med stort forbogstav, "Opløselighed (g pr. 100 mL
  vand)" vandret over aksen og "Temperatur (°C)" under den. Saltets formel står ved
  kurvens ende. Områdeteksterne er 14 px. Aflæsningen ved punktet ("20 °C: 36 g pr.
  100 mL") er skjult, mens kortet stiller et spørgsmål.
* **Grafen kan trækkes i** kun, når kortet beder om en handling med temperaturen, og i
  den fri leg. Et klik i scenen under et spørgsmål får kortet til at blinke (regel 15).
* **Hylden** med de seks salte (små pulverglas) står i den fri leg, hvor pulverglasset
  stod. Et nyt salt giver et tomt glas.
* Mens Kemichael roser, træder etiketten og knapperne et øjeblik tilbage, og han står
  foran kurven.

**De fire opgaver** (`NK.SimMaetning.OPGAVER` nederst i `js/sim_maetning.js`,
mekanikken i `js/maet_opgaver.js`). Saltet skifter kun én gang (regel 51): opgave 1
med NaCl, opgave 2-4 med KNO₃.

| Opgave | Trin |
|--------|------|
| 1 Bundfald i glasset (NaCl, 20 °C) | 1) Klik på +5 g, til der ligger salt på bunden. +5 g forsvinder ved 40 g, og kortet går selv videre ca. 1 s efter, at kornene er landet. 2) Hvor mange gram NaCl kan 100 mL vand højst opløse ved 20 °C? (40 g / 36 g / 4 g, aflæses på etiketten). 3) Kurven dukker op (før en stiplet ramme med navnet, regel 13), glasset får 50 g med Opløst og Bundfald som "?": Hvor mange gram bundfald giver 50 g NaCl? (14 g / 50 g / 36 g) |
| 2 Aflæs kurven (KNO₃) | 1) Rolig overgang (regel 42): Hvad sker der med opløseligheden af KNO₃, når vandet bliver varmere? 2) Hvor mange gram KNO₃ kan 100 mL vand højst opløse ved 40 °C? (40 g er temperaturen, 110 g er ved 60 °C). Bagefter flyttes punktet til 40 °C. |
| 3 Varm, til alt er opløst (80 g KNO₃) | 1) Hvad sker der med bundfaldet, når vandet varmes op? 2) Klik på + på varmepladen, til alt er opløst. Ved 48 °C stopper +, og kortet går selv videre (regel 39); op til 50 °C godtages. Indsend svar er reserve og forklarer "for koldt" og "for varmt". |
| 4 Afkøling giver bundfald (100 g KNO₃ ved 60 °C) | 1) Hvor mange gram falder ud ved 20 °C? (31,6 g / 68,4 g / 100 g). 2) Klik på − på varmepladen, til vandet er 20 °C, og se de 68,4 g bundfald. |

Hvert spørgsmål har tre svar, hvor de forkerte er fejl, elever laver, og hvert har sin
egen forklaring (regel 14). Hvert trin har hinttrappen Giv et hint › Næste hint (2 af
3) › Næste hint (3 af 3) › Vis svaret (regel 15). Trinene i opgave 1 er mest spørgsmål
og er derfor ikke en gennemgang efter regel 52; der er ingen spring-knap.

**Gemte fremskridt.** Løste opgaver gemmes i browseren (`nk-sc2.1-maettet`): ★ er løst
uden at se svaret, ✓ med. En løst opgave åbnes med alt fremme (kurven fra trin 1,
regel 16); Start forfra giver trinene igen. Er alle fire løst, åbner fanen i den fri
leg med resultatet på kortet og hylden fremme.

### Opgaverne

Hver fane har fire opgaver. En **runde** er hver opgave én gang i tilfældig
rækkefølge; tælleren i panelet viser fx 2/4. Efter den sidste viser kortet, hvor
mange der blev løst uden at se svaret, og henviser til den anden fane, hvis den har
opgaver tilbage. Kemichael kommer med en tør ros, første gang fanen er gennemført i
dette besøg. Start forfra i panelet begynder en ny runde. Mekanikken ligger i
`js/opgave.js`; opgaverne selv ligger nederst i hver sim-fil.

#### Papirkortet (6. nov. 2026)

Opgaven, svarene, hint, beskeden ved forkert svar og forklaringen står på det
lyse papirkort øverst i scenen (`../faelles/papirkort.css` og `papirkort.js`).
Svar, klik i lupen og knapper i billedet vælger kun; **Indsend svar** sender (grå,
til der er noget at sende). Giv et hint og Vis svaret er den stille knap med gul
kant. Efter et rigtigt svar bliver kortet stående med det grønne svar og
forklaringen, og Næste opgave (til sidst Se resultatet) står, hvor Indsend svar
stod. Start forfra står aldrig på kortet, kun i panelet. Statuslinjen nederst er
væk. Lupen og grafen begynder under kortet (`NK.kortTop()`), og selvtesten måler
det på en almindelig og en lav skærm. Fordi lupen blev lavere, gik opløsningen
hurtigere, og grænsen i opgaven "hurtigst" blev sat ned fra 13 til 10 s.

**Fane 1**

| Opgave | Sådan tjekkes den |
|--------|-------------------|
| Find fejlen: ét vandmolekyle i en vandskal vender forkert | vandet holder op med at starte på nye ioner, holdene ved krystallen giver slip, de ledige molekyler toner ud, og billedet står stille, når ingen ion er på vej ud; eleven klikker på molekylet |
| Opløsningsligningen for et tilfældigt salt | fire svar; de forkerte er typiske fejl (glemt koefficient, ionerne slået sammen, sammensat ion i stykker, ingen ladning, (s) i stedet for (aq), vendte ladninger) |
| Opløs NaCl-krystallen på under 10 s | det store ur; eleven skal selv finde varmt vand og omrøring |
| AgCl: flere ioner ved omrøring? | tre svar; hintet beder eleven prøve det |

**Fane 2** har fra runde T6 sine egne opgaver i fast rækkefølge; se afsnittet
"Fane 2: Mættet opløsning" ovenfor. Kortet og mekanikken i `js/opgave.js` bruges nu
kun af fane 1.

### Kemichael

Figuren er fælles for superanimationerne (`../../v2/kemichael/kemichael.js`), men den er
bygget til et fast tegnebord på 1000 x 600 enheder, og det har denne animation
ikke. `js/laerer.js` laver derfor et `NK.Scene` med de mål, figuren bruger, kobler
ham på begge faner og tegner ham skaleret efter lærredets højde. Hver fane har et
ur, der altid går (`tid`), og `laererPladsPx()`, der siger, hvor han stiller sig.
Man kan klikke på ham. Scenerne er `kogerOver` (fane 1) og `ros` (begge faner).

Brugerens regel 4. nov. 2026 (se `../kemichael/README.md`): han præsenterer ikke
og kommer kun ind af sig selv i to tilfælde, og alt, hvad han siger, er hele
sætninger i formelt sprog som i Kemibogen.

* **Overkogningen** (påskeægget, fane 1): én af tre replikker om ungdommen og
  varmepladen på max og derefter "Der findes også en knap, der hedder Ny krystal."
* **Rosen**, når alle fire opgaver på en fane er gennemført: én replik pr. fane og
  kun første gang i et besøg ("Selv jeg er rørt." på fane 1, fredagskagen på fane 2).

Han roser ikke enkelte svar og kommenterer ikke forkerte svar; det står i
opgavekortet.

### Teori og quiz

**Teori** åbner et kort, roligt ark (`../faelles/teori.css`, klassen `teori-ark`,
runde T6, regel 31): vandmolekylet og opløsningen, opløseligheden som en grænse med
ét eksempel (50 g NaCl giver 14 g bundfald) og henvisningen "Læs mere i Kemibogen:
2.4 Let- og tungtopløselige salte". Teksten står i `index.html`. Før stod der otte
afsnit med fede versaloverskrifter. **Quiz** åbner ni spørgsmål. Svarene er holdt
omtrent lige lange, så det rigtige ikke kan genkendes på længden. Ordene *kinetisk
energi* og *hydratisering* er med vilje ikke brugt; selvtesten holder øje med det.

Direkte link: `index.html#maetning` åbner fane 2 (også `#maettet`).

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>Q</kbd> quiz ·
<kbd>R</kbd> start forfra (på fane 2: opgaven med trinene igen) · <kbd>H</kbd> hjælp · <kbd>Esc</kbd> luk.

### Runde T6 på fane 1 (21. nov. 2026)

Fane 1 er ellers som før (den får sin egen tur som T32). Det fælles fra T6 gælder
også her: ingen versaler i panelets overskrifter og mærker (regel 30), ingen ikoner på
knapperne Teori og Quiz og på knapperne Koldt, Lunkent, Varmt og Omrøring, og teorien
på teori-arket. Fane 1's resultatkort henviser til "Mættet opløsning".

Selvtestens påstand "CaCl₂ lunkent: næsten ingen overlappende vandmolekyler" er
tilfældig og kan en sjælden gang fejle (den fejlede én gang under runden og ikke ved
næste kørsel); den handler om fane 1's fysik og er ikke ændret.

## Filer

```
index.html            markup for begge faner + de tre overlays
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
sprites/              SVG: baegerglas, varmeplade, termometer, spatel,
                      pulverglas, lup
js/kerne.js           NK-navnerum, dansk talformat, hævet/sænket skrift,
                      DPR-skarpt canvas, positurer, tegnehjælpere
js/data.js            ionerne, de seks salte, opløselighedskurven,
                      forkerte ligninger og quiz
js/sprites.js         spritelisten (FILER), deres mål (MAAL), indlæsning
../../v2/kemichael/      Kemichael: figuren og hans sprites
js/valg.js            det valgte salt, delt af begge faner
js/tegning.js         ion, vandmolekyle, vandskal, varmeplade med knapper,
                      termometer
js/opgave.js          opgavekortet på fane 1: den ene knap, runden og resultatet
js/maet_opgaver.js    fane 2: opgaverækken, trinene, hinttrappen og de gemte
                      fremskridt (runde T6)
js/sim_oploes.js      fane 1: lup, krystal, omrøring, kogning og opgaverne
js/sim_maetning.js    fane 2: glas, spatel, etiket, varmepladens − og +, graf,
                      hylden og opgavernes trin (NK.SimMaetning.OPGAVER)
js/laerer.js          Kemichael koblet på begge faner
js/quiz.js            selvtesten i sit overlay
js/app.js             faneskift, overlays, tastatur, tegneløkke; starter
                      indlæsningen af sprites
_selvtest.html        udviklerværktøj (se nedenfor)
```

Ioner og vandmolekyler tegnes i kode, fordi de drejes, skaleres og får δ-mærker.
Glas, varmeplade, termometer, spatel, pulverglas og lup er SVG-filer. Knapperne på
varmepladen tegnes i koden, så de kan drejes. Hver SVG har en kommentar øverst med
de koordinater, animationen tegner efter, og de samme tal står i
`NK.Sprites.MAAL`. Ændres en SVG, skal tallene følge med.

## At rette i den

**Et nyt salt** er én linje i `D.SALTE` i `js/data.js`: de to ioner, antal af
hver, formel, navn, en hverdagsting og seks opløselighedstal (0, 20, 40, 60, 80 og
100 °C, i gram pr. 100 mL vand). `vandfarve` farver vandet, `pulver` farver det
faste stof. En sammensat anion skal have `atomer` (bruges til den forkerte ligning
"ionen går i stykker").

**Fane 1's tempo** styres af `TEMPERATURER`, `MAKS_HOLD`, `SNIT` og faktoren for
omrøring i `opdater()` i `js/sim_oploes.js`. Husk `GRAENSE_SEK` (se tabellen ovenfor).
Overkogningen styres af `KOGE_OVER_SEK` og `LAERER_EFTER_SEK`.

**Kemichaels replikker** i denne animation står øverst i `js/laerer.js`.

**Teksterne**: teorien står i `index.html`, quizzen nederst i `js/data.js` og fane 2's
opgaver nederst i `js/sim_maetning.js`.

**`_selvtest.html`** åbner index.html i en iframe og kontrollerer blandt andet
formler, ladninger, kurverne, de forkerte ligninger, at krystallen går i
opløsning, at vandskallen dannes præcis dér, hvor bærerne sad, at δ-mærkerne står
på ret køl, omrøringens tider og knusning, hvor mange vandmolekyler der ligger
oven i hinanden, knapperne på varmepladen, overkogningen og Kemichael, at alle
otte opgavetyper kan løses og passer med modellen, runden og resultatet,
regnskabet og aksen på fane 2, fane 2's fire opgaver trin for trin (rækken,
de låste titler, at intet kan klikkes under et spørgsmål, "?" på etiketten, at
handlingerne går selv videre, de gemte fremskridt), kortets faste plads i 1100 × 760,
1400 × 860 og 1920 × 1080, teori-arket med linket og at der ingen versaler er, quizzens svarlængder og at der ikke er
tankestreger, 1+/1− eller fagord over C-niveau i teksten. Kør den efter ændringer:

```
chrome --headless=new --allow-file-access-from-files --window-size=1400,4600
       --virtual-time-budget=60000 --screenshot=ud.png .../_selvtest.html
```

Uden `--allow-file-access-from-files` nægter Chrome siden at kigge ind i sin egen
iframe; brug så en lokal server eller Firefox.

## I menuen

I menuen fra 26. sept. 2026 som c2.1 i `kemi-c-filer/samling_c2.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c2.1_salte_vand_oploest_oldversion.html`.
