# sc2.1: Salt i vand

En superanimation i sin egen mappe med adskilt CSS, JavaScript og SVG-sprites.

Åbn **`index.html`**. Mappen er selvstændig: den henter kun filer inde fra sig
selv og bruger hverken `fetch` eller moduler, så den virker også, når den åbnes
direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c2.1_salte_vand_oploest.html`.

## Hvad viser den

To faner om det samme spørgsmål: *hvad sker der, når et salt kommer i vand?*

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Opløsningen | vælger salt, temperatur og omrøring og ser gennem lupen | vandet river ionerne løs udefra og ind; omrøring og varme gør det hurtigere, men ikke mere |
| 2 | Hvor meget kan der være? | hælder salt i 100 mL vand med spatlen og skruer på temperaturen | der er en grænse, og alt over den bliver liggende som bundfald |

Saltet følger med fra fane til fane.

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

Til venstre står et bægerglas på en varmeplade med termometer og et saltkorn i
bunden. Lupen over kornet viser udsnittet til højre, ion for ion. Kornet i glasset
bliver mindre, efterhånden som ionerne går i opløsning, og deles i flere korn, når
krystallen knuses. På en smal skærm ligger glasset som en lille boks i hjørnet af
lupbilledet.

* Vandmolekylerne finder en ion **i overfladen** (en side, der vender ud mod
  vandet; bunden af glasset tæller ikke) og vender den rigtige ende ind:
  oxygen (δ−) mod en positiv ion, hydrogen (δ+) mod en negativ.
* Når fire har fat, river de ionen løs. **De samme fire molekyler bliver siddende
  som ionens vandskal** og glider jævnt ud hele vejen rundt. Arbejdsmolekylerne
  selv toner op et andet sted, så et nyt hold kan tage over.
* Den frie ion beholder sin størrelse. De frie ioner skubber blidt til hinanden,
  så vandskallerne ikke ligger oven i hinanden.
* Er der mere end 7 frie ioner i lupen, driver den ældste videre ud i resten af
  glasset og toner ud. Den er stadig opløst, bare uden for udsnittet.
* Tungtopløselige salte stopper efter nogle få ioner (`D.frieIoner`).

**Temperaturen** (koldt, lunkent, varmt) bestemmer vandmolekylernes fart. Koldt
vand har isterninger, og varmepladen gløder ved varmt.

**Omrøring** starter magneten i glasset og en hvirvel i lupen. Efter 1, 4 og 8
sekunder knækker krystallen langs et nyt snit (`SNIT`). Stykkerne lægger sig side
om side på bunden, og et stykke, der mister sin nederste række, falder ned. Der
arbejder to hold vandmolekyler pr. stykke, højst fire hold (16 molekyler), og
vandet bevæger sig 15 % hurtigere. Et tungtopløseligt salt slipper stadig kun
lige så mange ioner: omrøring ændrer hastigheden, ikke grænsen.

**Uret** i lupens hjørne viser, hvor lang tid opløsningen har taget, og står stille
(grønt), når krystallen er væk.

Målt af selvtesten for NaCl (tre kørsler hver):

| | står stille | omrøring |
|---|---|---|
| koldt | ca. 135 s | ca. 62 s |
| lunkent | ca. 70 s | ca. 34 s |
| varmt | ca. 36 s | ca. 17 s |

Derfor er grænsen i opgaven "hurtigst" sat til **25 s** (`GRAENSE_SEK`): den kan
kun klares med både varmt vand og omrøring. Ændres farten, antallet af hold eller
snittene, skal tallet måles igen.

### Fane 2: hvor meget kan der være?

Til venstre et bægerglas med 100 mL vand på en varmeplade, termometer i glasset,
pulverglas med saltets formel på etiketten og en spatel. Knapperne +5 g og +25 g
får spatlen til at dykke ned og hælde. Regnskabet er rigtigt med det samme;
spatel og korn er kun animation. Varmepladen gløder, og termometeret følger
temperaturen.

Til højre saltets **opløselighedskurve**:

* den blå kurve er grænsen, den gule stiplede linje er det, der er hældt i
* ligger den gule linje over kurven, er forskellen bundfald
* skyderen flytter temperaturen; man kan også klikke og trække i grafen

Kurven er **glat** (monoton kubisk interpolation gennem tabelpunkterne), så den
ikke knækker ved hvert 20 °C og aldrig vender.

Aksen er som udgangspunkt **fælles for alle salte, 0-250 g**, så ingen kurve bliver
klemt flad mod kanten, og saltene kan sammenlignes direkte. Hælder man mere i end
aksen rækker, vokser den med. "Skaler til stoffet" zoomer ind på det valgte salt;
det er nødvendigt for AgCl og CaCO₃.

### Opgaverne

Hver fane har et opgavekort med **én knap**:
Start opgave → Giv hint → Vis svaret → Ny opgave. Løser eleven opgaven selv,
springer knappen til Ny opgave. Mekanikken ligger i `js/opgave.js`; opgaverne
selv ligger nederst i hver sim-fil.

**Fane 1**

| Opgave | Sådan tjekkes den |
|--------|-------------------|
| Find fejlen: ét vandmolekyle i en vandskal vender forkert | billedet står stille; eleven klikker på molekylet |
| Opløsningsligningen for et tilfældigt salt | fire svar; de forkerte er typiske fejl (glemt koefficient, ionerne slået sammen, sammensat ion i stykker, ingen ladning, (s) i stedet for (aq), vendte ladninger) |
| Opløs NaCl-krystallen på under 25 s | uret; eleven skal selv finde varmt vand og omrøring |
| AgCl: flere ioner ved omrøring? | tre svar; hintet beder eleven prøve det |

**Fane 2**

| Opgave | Sådan tjekkes den |
|--------|-------------------|
| Aflæs opløseligheden ved en temperatur | fire tal; de forkerte er naboværdier på kurven og selve temperaturen (akserne byttet om) |
| Hvor meget bundfald ved x g og t °C | fire tal: det rigtige, grænsen, det hældte og 0 |
| Find den laveste temperatur, hvor alt er opløst | simulationen godkender, når bundfaldet er væk og temperaturen højst 2 °C over grænsen |
| Hvor meget falder ud ved afkøling til 20 °C | fire tal |

Ved valgopgaverne vises svaret også i billedet bagefter (temperaturen sættes, eller
saltet hældes i), så eleven kan se, at det passer.

### Teori og quiz

**Teori** åbner otte korte afsnit. **Quiz** åbner ni spørgsmål. Svarene er holdt
omtrent lige lange, så det rigtige ikke kan genkendes på længden. Ordene *kinetisk
energi* og *hydratisering* er med vilje ikke brugt; selvtesten holder øje med det.

Direkte link: `index.html#maetning` åbner fane 2.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>Q</kbd> quiz ·
<kbd>R</kbd> start fanen forfra · <kbd>H</kbd> hjælp · <kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for begge faner + de tre overlays
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
sprites/              SVG: baegerglas, varmeplade, termometer, spatel,
                      pulverglas, lup
js/kerne.js           NK-navnerum, dansk talformat, hævet/sænket skrift,
                      DPR-skarpt canvas, tegnehjælpere
js/data.js            ionerne, de seks salte, opløselighedskurven,
                      forkerte ligninger, teori og quiz
js/sprites.js         indlæser sprites og kender deres mål (MAAL)
js/valg.js            det valgte salt, delt af begge faner
js/tegning.js         ion, vandmolekyle, vandskal, varmeplade, termometer
js/opgave.js          opgavekortet med den ene knap
js/sim_oploes.js      fane 1: lup, krystal, omrøring og opgaverne
js/sim_maetning.js    fane 2: glas, spatel, graf og opgaverne
js/quiz.js            selvtesten i sit overlay
js/app.js             faneskift, overlays, tastatur, tegneløkke
_selvtest.html        udviklerværktøj (se nedenfor)
```

Ioner og vandmolekyler tegnes i kode, fordi de drejes, skaleres og får δ-mærker.
Glas, varmeplade, termometer, spatel, pulverglas og lup er SVG-filer. Hver fil har
en kommentar øverst med de koordinater, animationen tegner efter, og de samme tal
står i `NK.Sprites.MAAL`. Ændres en SVG, skal tallene følge med.

## At rette i den

**Et nyt salt** er én linje i `D.SALTE` i `js/data.js`: de to ioner, antal af
hver, formel, navn, en hverdagsting og seks opløselighedstal (0, 20, 40, 60, 80 og
100 °C, i gram pr. 100 mL vand). `vandfarve` farver vandet, `pulver` farver det
faste stof. En sammensat anion skal have `atomer` (bruges til den forkerte ligning
"ionen går i stykker").

**Opløselighedstallene** er omtrentlige tabelværdier, runde nok til C-niveau.

**Fane 1's tempo** styres af `TEMPERATURER`, `MAKS_HOLD`, `SNIT` og faktoren for
omrøring i `opdater()` i `js/sim_oploes.js`. Husk `GRAENSE_SEK` (se tabellen ovenfor).

**Teksterne** til teoriboksen og quizzen står nederst i `js/data.js`.

**`_selvtest.html`** åbner index.html i en iframe og kontrollerer formler,
ladninger, kurverne (præcise tabelpunkter, aldrig vendende), let/tung,
de forkerte ligninger, at krystallen går i opløsning, at vandskallen starter
præcis dér, hvor bærerne sad, at δ-mærkerne står på ret køl, omrøringens tider og
knusning, at intet stykke svæver, at alle otte opgavetyper kan løses og passer
med modellen, regnskabet på fane 2, grafens akse, quizzens svarlængder og at der
ikke er tankestreger, 1+/1− eller fagord over C-niveau i teksten.
Kør den efter ændringer:

```
chrome --headless=new --allow-file-access-from-files --window-size=1400,3600
       --virtual-time-budget=40000 --screenshot=ud.png .../_selvtest.html
```

Uden `--allow-file-access-from-files` nægter Chrome siden at kigge ind i sin egen
iframe; brug så en lokal server eller Firefox.

## Hvis den skal ind i menuen

`animationer/kemi-c-filer/samling_c2.html` har en knap med `data-emne="c2.1"`,
som peger på den gamle animation. Skal den nye afløse den, er det den ene linje,
der skal skiftes ud. Bemærk `../`, fordi superanimationerne ligger uden for
kapitlets egen mappe:

```html
<button class="tab-btn" data-emne="c2.1"
    data-beskrivelse="Se vandet rive ionerne løs af en saltkrystal, og find ud af, hvor meget der overhovedet kan opløses, før resten bliver til bundfald."
    onclick="visAnimation(this, '../superanimationer/sc2.1_salt_i_vand/index.html')"
    title="Salt i vand"><span class="btn-num">1</span><span class="btn-text">Salt i vand</span></button>
```
