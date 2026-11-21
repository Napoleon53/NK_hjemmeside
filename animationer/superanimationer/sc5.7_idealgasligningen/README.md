# sc5.7 Idealgasligningen

Superanimation om idealgasligningen: tryk, volumen, stofmængde og
temperatur hænger sammen i p · V = n · R · T. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv.
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** p · V = n · R · T. Skruer man på én af de fire
   størrelser, må mindst én anden ændre sig, og kender man tre, kan man
   regne den fjerde ud.
2. **Afløser** `kemi-c-filer/c5.6_idealgasligning_simulation.html`. Med fra
   den gamle: cylinderen med stemplet og molekylerne, der farer rundt og
   giver et glimt, når de rammer, varme og kulde under cylinderen, lodderne
   på stemplet, frit eller låst stempel, stofmængden, de fire måletal og
   pV-grafen med kurven for samme n og T. Quizzen ("Test din forståelse")
   er blevet til forudsigelser på fane 1: eleven vælger først og prøver så.
   Ud: den opfundne gaskonstant (17,5 L ved 298 K) og atm. Nu regnes der
   med bar og R = 0,0831 L·bar/(mol·K) som i kompendiet til Basiskemi C.
3. **Naboerne:** `sc5.2` ejer m = n · M, `sc5.5` mængdeberegning med
   reaktioner og `c5.9` lightergasforsøget. Her bruges n = m / M kun i
   de svære opgaver, med molarmassen givet. `c5.10` ejer betydende cifre.
4. **Loftet:** 2 faner. Fane 1: én cylinder, højst 80 molekyler
   (40 pr. mol, 0,25 til 2,00 mol), 3 lodder og 7 forudsigelser. Fane 2:
   12 opgaver (4 Let, 4 Middel, 4 Svær) med nye tal.
5. **Layoutet:** scene plus panel som `sc5.5`. Cylinderen er stjernen.

Brugerens valg (25. sept. 2026): de to faner Stemplet og Beregningen.
Ingen knapper til præsentationen.

9. okt. 2026 (brugerens valg): Kemichael ved katederet er taget helt ud
(han hører til i laboratoriet). Scenen har fået hans bånd, og hintknappen
er gul, så eleven altid kan finde hjælpen selv.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Stemplet | forudsiger, hvad der sker, og prøver det: varmer, lægger lodder på, lukker gas ind og ud, låser stemplet | én ting ad gangen: V følger T og n og falder med p; låst stempel: p følger T og n |
| 2 | Beregningen | vælger formlen på kortet og skriver tallet i feltet på kortet, trin for trin | kender man tre af p, V, n og T, kan man regne den fjerde |

**Stemplet.** Cylinderen står på en varmeplade, der også kan køle (150 K
til 500 K). Skalaen på glasset viser volumen, manometeret trykket i
gassen og displayet temperaturen i kelvin og °C. Stemplet er vægtløst;
udefra trykker luften med 1,013 bar og hvert lod med 1 bar. Frit stempel:
volumen indstiller sig, så trykket inde er det samme som udefra. Låst
stempel (knappen Lås stemplet): volumen er fast, og trykket følger af n og T.
Ved 60 L står stemplet mod stoppet, og så stiger trykket i stedet.

Alt gøres på apparaterne i scenen (se "Runde 2" nedenfor): klik på et lod
på hylden ("Klik: læg på") eller træk det op på stemplet, klik på et lod på
stemplet for at tage det af, klik på gasflasken for 0,25 mol mere ("Klik:
gas ind") og på den røde hane for at lukke 0,25 mol ud ("Klik: gas ud"), brug
− og + på varmepladen (20 K ad gangen), og lås stemplet med knappen under
skiltet med volumen. Hvert klik giver et kort svar på papirkortet.
Molekylernes fart er proportional med kvadratroden af T.

Grafen øverst til venstre viser p mod V med sporet af de sidste
bevægelser og den stiplede kurve for samme n og T. Den vises kun, når der
er plads (ikke på en telefon).

De syv forudsigelser: varmere gas ved frit stempel, et lod på (næsten
dobbelt tryk giver næsten halvt volumen), dobbelt så meget gas, varmere
gas ved låst stempel, hvorfor trykket stiger (den gamle quiz' spørgsmål
3 med de samme forkerte svar), gas ud ved låst stempel og hvor meget
1 mol fylder (24,0 L ved 20 °C og 1,013 bar). Eleven vælger først. Når
det, der skal prøves, er gjort, og stemplet står stille, aflæser modellen
resultatet: "Volumen steg fra 24,0 L til 29,0 L." Et forkert gæt afvises
ikke; linjen siger, hvad man gættede, hvad der skete, og hvorfor. Skruer
eleven på noget andet undervejs, stilles gassen tilbage med en besked.
Kræver opgaven et låst stempel, og eleven åbner det, beder linjen om at
låse det igen. En opgave løst uden Vis svaret og med rigtigt gæt får en
stjerne.

**Beregningen.** Samme cylinder, stillet som i opgaven. De kendte tal
står på instrumenterne; det ukendte er dækket (malertape over skalaen,
et spørgsmålstegn på manometeret, "?" på displayet og skiltene). Når
tallet er regnet, kommer det frem. Flasker, dåser og dæk har et låst
stempel. Tavlen viser de pæne beregninger, som de skal skrives, med
enheder og brøkstreg, og R står i hjørnet.

* **Let:** temperaturen i kelvin (V, n, p og T).
* **Middel:** temperaturen i °C, som først regnes om (vanddamp, stofmængde,
  spraydåse, og cykeldækket, hvor svaret skal i °C).
* **Svær:** massen er med: ammoniak (n = m / M først), CO₂ i en ballon og
  heliumflasken (m = n · M til sidst) og den ukendte gas (volumen i mL, M
  = m / n til sidst; slutsætningen siger, hvilken gas det passer med).

I hvert trin med en formel vælger eleven først formlen blandt tre knapper
på kortet og skriver så tallet i feltet på kortet (se "Runde 2" nedenfor).
Første hint siger, hvad man kender, ikke formlen; Vis svaret giver formlen
og derefter beregningen. Fortolkeren af skrevne formler (`T.formel` i
`js/tjek.js`, der godkender `pV = nRT`, `V = n·R·T/p`, `n = pV/(RT)` osv.)
bruges ikke længere af kortet, men står der stadig, og selvtesten tjekker
den.

**Fejlbeskederne kender fejlene:** temperaturen i °C i stedet for kelvin,
R = 8,314 i stedet for 0,0831, mL i stedet for L, 24 L pr. mol brugt uden
for stuetemperatur, en størrelse, der står på den forkerte side af
brøkstregen eller mangler, kommaet, n = m · M og brøken vendt om, 273
trukket fra i stedet for lagt til, og svaret i °C, når der spørges om
kelvin.

**Hint og svar.** Knappen med gul kant på papirkortet er hjælpen: Giv hint skriver
hintet i linjen lige over knappen, og knappen bliver til Vis svaret (kun et
omrids, så den ikke frister), der skriver svaret og næste skridt i samme
linje. Efter et forkert svar lyser den gule knap stille op, til linjen
skifter igen. Der er ingen Kemichael og ingen knapper til præsentationen.

## Papirkortet (6. nov. 2026)

Begge faner har ét lyst papirkort øverst i midten af scenen (`js/kort.js`, kopi
af sc5.2's med en ekstra notelinje, og `../faelles/papirkort.css/js`).
Opgavekortene i panelet er fjernet. Kortet har etiketten ("Opgave 2 af 7",
"Let 1 af 4"), spørgsmålet eller opgaven, svarene, linjen med næste skridt,
fejl og hint, Giv hint (gul kant, bliver til Vis svaret) og Indsend svar (grå,
til der er noget at sende). Korte beskeder fra scenen ("0,25 mol gas mere")
står i en notelinje under teksten i nogle sekunder.

- Stemplet: et svar vælger kun; Indsend svar (eller Enter) sender det. I
  opgaver med et forsøg er forsøget låst, til svaret er sendt: et klik i
  scenen får kortet til at blinke. Efter svaret
  bliver kortet på spørgsmålet: svaret er grønt (rødt ved et forkert gæt og
  det rigtige grønt), forklaringen står under svarene (rød boks ved et
  forkert gæt), og Næste opgave eller Videre til Beregningen står, hvor
  Indsend svar stod. Opgaverne og Start forfra (samme som R) står fra runde 3
  i rækken øverst i scenen. Svarene i opgave 5 (Hvorfor?) er gjort
  kortere ("Molekylerne får mere fart"), så kortet ikke bliver for højt.
- Beregningen: formlerne og feltet står på kortet (runde 2, se nedenfor).
  Når opgaven er regnet, står facit og rosen på kortet med Næste opgave;
  efter den sidste uløste opgave er der ingen knap på kortet, og Nye tal står
  i rækken øverst i scenen.

## Trinvis start (21. nov. 2026)

Første opgave på Stemplet er trinvis (som sb2.6): én ting ad gangen, og
det, et spørgsmål handlede om, kommer frem, når det er løst. Kortet siger
"Trin 1 af 3".

1. Kun cylinderen med stemplet og V-mærket er fremme. Grafen, manometeret og
   varmepladen har en stiplet plads med navnet; lodhylden, gasflasken og
   låseknappen er væk. **Hvad holder stemplet i cylinderen oppe?**
   (Molekylernes stød / Luften over stemplet / Det svæver af sig selv.)
   Svaret: Manometeret kommer frem.
2. **Hvad sker der med molekylernes fart, når gassen bliver varmere?**
   Svaret: Varmepladen med − og + kommer frem.
3. Forudsigelsen som før, nu med "frie" i spørgsmålet: **Hvad sker der med
   volumenet, når gassen under det frie stempel bliver varmere?** Forsøget og
   forklaringen er som før.

Trin 1 og 2 er rigtige spørgsmål: Et forkert svar bliver rødt og får sin egen
forklaring, hintknappen giver tre hint og så Vis svaret, og efter det rigtige
svar bliver kortet på spørgsmålet med Næste spørgsmål. Scenen er låst, mens et
trin står på kortet. Trinene står i `D.FORUDSIG[0].trin` i `js/data.js`.

Resten kommer med den opgave, der bruger det (`D.VIS_FRA`): grafen og lodhylden
med trykket udefra med opgave 2, gasflasken, hanen og skiltet med n med opgave
3, låseknappen med opgave 4. Det, der er kommet frem, bliver fremme. Det, der ikke er fremme, kan
hverken klikkes eller give et vink, og rundvisningen springer det over. Er
opgave 1 løst før (gemt i browseren), er der ingen trin, og det, eleven har
nået, er fremme fra start. Start opgaven forfra på opgave 1 giver trinene
igen med kun cylinderen fremme.

Kortets mindste plads er sat fra 150 til 178 px (`D.ZONE.stempel`), så kortet
med to linjer forklaring eller hint har plads, og scenen ikke hopper, når
manometeret og varmepladen kommer frem. Mærket på det grønne kort hedder nu
"Rigtigt" og "Svaret" uden punktum, fordi papirkortet selv sætter punktummet
(før stod der "Rigtigt..").

## Runde 2 (21. nov. 2026): roligere molekyler og ingen betjening i panelet

Brugeren efter at have prøvet trinene: "molekylerne bevæger sig overordnet
for hurtigt. Det er ikke rart for øjnene", og eleven skal ikke "lave input i
højre bjælke". Som i sc6.2: svarene står i kortet og aldrig i panelet, og
panelet var 300 px bredt (før 430 px; fra runde 3 er det helt væk).

* **Molekylerne** (begge faner): grundfarten er 40 % af før (`grundfart` i
  `js/gas.js`, højst 76 px/s mod 190), forholdet til temperaturen er det
  samme, glimtene ved væggene er taget ud, og prikkerne er lys blågrå med en
  blød kant (`Tg.partikler` i `js/tegning.js`). Intet i modellen afhænger af
  den viste fart.
* **Stemplet:** Panelets kort Gassen er væk. Varmepladens − og + går 20 K ad
  gangen (`T_KNAP`, før 25 K og en skyder), så 0 °C og påskeægget kan nås.
  Lodderne klikkes på og af (eller trækkes), og "udefra 1,013 bar" står under
  hylden. Gasflasken og den røde hane lukker 0,25 mol ind og ud (de faste
  klik-tekster blev taget ud igen i runde 4), og "n = 1,00 mol"
  står nederst i gassen. Låseknappen "Lås stemplet" / "Lås op" står under
  skiltet med volumen og følger stemplet (`laasKnap` i `js/sim_stempel.js`,
  `Tg.laasKnap`); et klik på selve stemplet låser ikke længere. Hylden står
  så langt ude, at knappen kan komme forbi den. Teksterne er rolige (intet
  blink). Hint og rundvisning nævner apparaterne, ikke panelet.
* **Beregningen:** Kortet Beregningen i panelet er væk. Kortet viser opgaven,
  det, eleven skal gøre ("Vælg formlen for volumenet.", "Regn volumenet ud."),
  og svarene: tre formler som knapper (den rigtige og to typiske fejl med
  hver sin forklaring, `D.FORMELVALG` i `js/data.js`) og bagefter feltet
  "V = [ tallet ] L". Efter et rigtigt svar bliver kortet på spørgsmålet med
  svaret grønt, en kort forklaring og Næste. Etiketten tæller formlen og
  tallet som to trin ("Let 1 af 4 · Trin 2 af 2"). Fejlbeskederne ved tallet
  er de samme som før (`T.tal`). Kortets plads er 220 px (200 på en lav
  skærm, `D.ZONE.regn`), så tavlen ikke hopper mellem formlen og tallet.

## Runde 3 (21. nov. 2026): uden panel, opgaverne i en række, scenen ligger fast

Brugeren: "Jeg kan egentlig godt lide at panelet måske helt falder bort" og
"Det var som om animationen blev zoomet ud hver gang" eleven lukkede gas ind.

* **Zoomfejlen:** Kortets plads fulgte det kort, der stod der lige nu. En
  kort besked fra scenen ("0,25 mol gas mere. Nu er der 1,50 mol.") gjorde
  kortet en linje højere, og så blev scenen lagt om og blev mindre. Nu er
  pladsen det højeste kort, fanen kan vise (`kortTilstande` i
  `js/sim_stempel.js` og `js/sim_regn.js`, målt med `maal` i `js/kort.js` på en
  skjult kopi af kortet). Scenen lægges kun om, når vinduet får en ny størrelse
  eller skriften er hentet, aldrig når gas, lodder, beskeder eller opgaven
  skifter. Kun rosen for alle syv (én gang) kan gøre kortet højere end pladsen.
  Er der ikke plads til grafen over manometeret, står den til venstre for det.
* **Intet panel:** Scenen har hele bredden. Øverst i scenen, over kortet, står
  en smal række (`.opgaverad` i `css/stil.css`): på Stemplet de syv opgaver med
  nummer og tema (`tema` i `D.FORUDSIG`: Varmere gas, Et lod på, Mere gas, Låst
  stempel, Hvorfor trykket stiger, Gas ud, Et mol gas) og "↺ Start forfra" til
  højre; på Beregningen Let, Middel og Svær, opgaverne på niveauet med navn og
  "⟳ Nye tal" til højre. Den aktive opgave er blå, de løste har ★ (eller ✓,
  når svaret blev vist), og et klik går til opgaven.
* **Låste opgaver** (CLAUDE.md, brugeren 21. nov. 2026): Kun de løste, den,
  eleven er ved, og dem, eleven har nået, har tema og kan klikkes. De kommende
  står som et stiplet nummer uden tema og åbner, når eleven kommer dertil (Vis
  svaret tæller som løst). På Beregningen kan alle tre niveauer vælges, og
  inden for et niveau er den første uløste åben.
* **Smal skærm** (under 1200 px): rækken viser kun numrene, temaet står som
  værktøjstip og på kortets etiket ("Opgave 3 af 7 · Mere gas").
* Rundvisningen peger på rækken i stedet for panelet.

## Runde 4 (21. nov. 2026): klik-opfordringer kun, når eleven skal klikke

Brugeren: "Lad være med at lave 'KLIK: læg på' når det er meningen at man skal
svare ... 'klik'-symboler kommer først frem, når man skal klikke, og de må gerne
generelt være mere tydelige" (CLAUDE.md og REGELSAET 19-21). De faste tekster
"Klik: læg på", "Klik: gas ind" og "Klik: gas ud" fra runde 2 er væk, og
låseknappen har en stille grå kant. Mens kortet stiller et spørgsmål, et gæt
eller et trin, er der ingen opfordringer. Når kortet beder om en handling
("Prøv det: Luk gas ind ..."), får præcis det apparat, der skal bruges, en gul
ramme og en gul boble med pil som krukken i sc6.1 (`opfordring` og
`tegnOpfordring` i `js/sim_stempel.js`, `Tg.opfordring` i `js/tegning.js`):
varmepladens + ("Klik: varm op"), lodderne på hylden ("Klik: læg på"),
gasflasken ("Klik: gas ind"), hanen ("Klik: gas ud"), lodderne på stemplet
("Klik: tag af") eller låseknappen, når opgaven kræver låst stempel, og eleven
har åbnet det ("Klik: lås"). Boblen forsvinder, så snart det er gjort.

Tegningen begynder under kortets plads (`D.ZONE` i `js/data.js`, almindelig
og lav skærm), og lærredet lægges om, hvis kortet bliver højere. På en smal
skærm er scenen lidt højere (min. 580 px), så cylinderen har plads.
Molekylnavnene var allerede rigtige (dinitrogen i opgaven Den ukendte gas).

**Påskeæg:** stil gassen på 1,00 mol, 0 °C, uden lodder og med frit
stempel: 22,4 L, tallet fra de gamle lærebøger.

Direkte link til fane 2: `index.html#regn`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning ·
<kbd>R</kbd> opgaven forfra (fane 2: nye tal) · <kbd>Enter</kbd> tjek
feltet eller næste opgave · <kbd>Esc</kbd> luk.

### Det nye i forhold til den gamle animation

* **Rigtige tal:** R = 0,0831 L·bar/(mol·K) og bar. 1 mol fylder 24,0 L
  ved 20 °C og 1,013 bar, ikke 17,5 L.
* **Quizzen er blevet til forsøg:** eleven gætter og prøver, og modellen
  er facit.
* **Stoppet** i toppen af cylinderen: når stemplet ikke kan komme
  længere, stiger trykket.
* **Manometeret** viser trykket i gassen, også mens stemplet bevæger sig
  (p = n · R · T / V med det volumen, der ses).
* **Beregningen er ny:** tolv opgaver med formlen først, tavlen og en
  besked til hver typisk fejl.

## Filer

```
index.html          markup for de to faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc5.5's, feltet på kortet sc6.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            loddet, manometeret, gasflasken og varmepladen
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc5.5)
js/data.js          konstanterne, forudsigelserne, regneopgaverne og replikkerne
js/gas.js           modellen: idealgasligningen, stemplet, opgavernes trin og facit, molekylerne
js/tjek.js          formlerne (fortolker og regner efter), tallene og beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       cylinderen, manometeret, varmepladen, flasken, hylden, skiltene, grafen og tavlen
js/sim_stempel.js   fane 1
js/sim_regn.js      fane 2
js/kort.js          papirkortet øverst i scenen (NK.SceneKort, kopi af sc5.2's)
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Konstanterne** (R, lufttrykket, 273) står øverst i `js/data.js`, og
grænserne for fane 1 i `D.STEMPEL` (60 L, 150 til 500 K, 0,25 til 2,00
mol, 3 lodder à 1 bar, 40 molekyler pr. mol). **Forudsigelserne** står i
`D.FORUDSIG`: starttilstanden, spørgsmålet, svarene (det rigtige har
`ok: true`, et forkert kan have sin egen forklaring i `svar`), det, der
skal prøves (`handling`), hint og forklaring. **Regneopgaverne** står i
`D.REGN`: de kendte tal første gang (`std`), listerne, nye tal trækkes fra
(`tal`), og teksten med {n}, {T} osv. Trinene og facit regnes af
`js/gas.js`; intet facit er skrevet i hånden. **Linjerne i papirkortet**
står i `D.INTRO`, `D.FAERDIG` og `D.ROS`, og de korte svar fra
scenen i `D.SCENE`.

**Fejlbeskederne** står i `js/tjek.js`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker modellen
(24,0 L og 22,4 L pr. mol, frit og låst stempel, stoppet og grænserne),
facit for de tolv opgaver regnet i hånden, at hvert facit følger af
tallene i trinene før for 30 træk med nye tal, at over 20 rigtige skrivemåder
af formlerne godkendes og de typiske forkerte afvises med den rigtige
besked, de typiske regnefejl, sproget (også alt, der siges undervejs),
at formlen ikke står på siden uden for teorien, at alle syv
forudsigelser og alle tolv opgaver kan gennemføres, også med forkert gæt,
to ting på én gang, åbnet lås, hint og Vis svaret, at hint og svar kun
kommer fra den gule knap og står på papirkortet, papirkortet (i scenen, Indsend
svar grå uden valg, et svar bedømmer ikke af sig selv, låst forsøg før svaret,
kortet bliver på spørgsmålet med Næste, Start forfra ikke på kortet, kortet i
sin plads også med det højeste kort), og at layoutet holder fra 520 × 380 til
1500 × 900. Trinene (afsnit 7a og 7b): at kun cylinderen er fremme fra start,
at de skjulte dele ikke kan klikkes, at scenen er låst under et trin, at
manometeret og varmepladen kommer efter det rigtige trin og ikke før, at
trinene kan løses med forkerte svar, hint og Vis svaret, at intet hopper, at
delene kommer med opgave 2, 3 og 4, og at Start forfra giver trinene igen.
Runde 2 (afsnit 7c og 8): at panelet ingen skyder, intet felt og ingen knap
til forsøget har på nogen fane (fra runde 3: at der intet panel er), at lodder, gas, lås og
varme virker ved rigtige klik i scenen, at grundfarten er højst 76 px/s uden
glimt og stadig følger temperaturen, og at formlen vælges og tallet skrives
på kortet på fane 2 med de gamle fejlbeskeder.
Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt
tilbage bagefter. Runde 3 (afsnit 7c, 7d og 11): intet panel, scenen ligger
fast ved 4 × gas ind, 3 lodder, varme og lås og ved opgaveskift, rækken med 7 og
4 opgaver, låste kommende opgaver, stjerner, klik, Start forfra og Nye tal fra
rækken, og at rækken hverken går ned over kortet eller ud af scenen fra
1100 × 620 til 1600 × 950. Runde 4 (afsnit 7e): ingen bobler under et spørgsmål,
et gæt eller et trin, præcis det rigtige apparat har ramme og boble under en
handling (gas ind, lod, varme, lås, gas ud, 1 mol), og boblen er væk bagefter.
Sidst kørt 21. november 2026: ALT OK (225 påstande).

## Forenklinger

* R = 0,0831 L·bar/(mol·K) med tre betydende cifre (Databogen: 8,3145
  J/(mol·K)), og T = t + 273. Svar med 0,08314 og 273,15 godkendes, da et
  tal godkendes, når det højst er 1 % fra facit.
* Stemplet er vægtløst og glider uden gnidning. Lodderne trykker med
  præcis 1 bar hver.
* Temperaturen skifter med det samme, når der skrues; det er kun stemplet,
  der glider på plads.
* 1 prik er 1/40 mol, ikke ét molekyle. Molekylerne støder ikke ind i
  hinanden (det er en idealgas), kun i væggene og stemplet.
* Farten er proportional med kvadratroden af T; hvert molekyle har sin
  egen faktor, så farterne er fordelt.
* På fane 2 regnes hvert trin videre med det tal, der står skrevet
  (tre betydende cifre, kelvin i hele grader), så den pæne beregning går
  op. Molarmasser, der er givet, har to decimaler; den beregnede har tre
  betydende cifre.
* Cylinderen på fane 2 er en illustration: skalaen og manometeret er
  valgt, så tallet ligger godt på dem.

## I menuen

I menuen fra 26. sept. 2026 som c5.6 i `kemi-c-filer/samling_c5.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c5.6_idealgasligning_simulation_oldversion.html`.
