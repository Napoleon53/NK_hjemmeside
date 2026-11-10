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
| 2 | Beregningen | skriver formlen og regner tallet ud, trin for trin | kender man tre af p, V, n og T, kan man regne den fjerde |

**Stemplet.** Cylinderen står på en varmeplade, der også kan køle (150 K
til 500 K). Skalaen på glasset viser volumen, manometeret trykket i
gassen og displayet temperaturen i kelvin og °C. Stemplet er vægtløst;
udefra trykker luften med 1,013 bar og hvert lod med 1 bar. Frit stempel:
volumen indstiller sig, så trykket inde er det samme som udefra. Låst
stempel (klik på stemplet): volumen er fast, og trykket følger af n og T.
Ved 60 L står stemplet mod stoppet, og så stiger trykket i stedet.

Alt kan gøres både i scenen og i kortet Gassen i panelet: træk et lod fra
hylden op på stemplet (eller klik), klik på et lod på stemplet for at tage
det af, klik på gasflasken for 0,25 mol mere og på den røde hane for at
lukke 0,25 mol ud, og brug knapperne på varmepladen (25 K ad gangen) eller
skyderen. Hvert klik giver et kort svar på papirkortet. Molekylernes fart
er proportional med kvadratroden af T.

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

I hvert trin med en formel skriver eleven formlen først og så tallet
(som `sc7.4`). Formlen tjekkes ved at regne efter, så alle rigtige
skrivemåder godkendes: `pV = nRT`, `V = n·R·T/p`, `nRT/p`, `n = pV/(RT)`,
`V(NH₃) = n(NH₃)·R·T/p` osv. En formel, der ikke er isoleret, er rigtig,
og den isolerede vises. Underforstået gange binder stærkere end /, så
`pV/RT` er pV/(RT) som på papir. Første hint siger, hvad man kender, ikke
formlen; Vis svaret giver formlen og derefter beregningen.

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
  scenen eller på panelets knapper får kortet til at blinke. Efter svaret
  bliver kortet på spørgsmålet: svaret er grønt (rødt ved et forkert gæt og
  det rigtige grønt), forklaringen står under svarene (rød boks ved et
  forkert gæt), og Næste opgave eller Videre til Beregningen står, hvor
  Indsend svar stod. Panelet har kortet Opgaverne med prikkerne og Start
  opgaven forfra (samme som R). Svarene i opgave 5 (Hvorfor?) er gjort
  kortere ("Molekylerne får mere fart"), så kortet ikke bliver for højt.
- Beregningen: felterne, eleven skriver i, står stadig i panelet (kortet
  Beregningen); Enter eller Indsend svar sender feltet ind (knappen ↵ i
  feltet er væk). Når opgaven er regnet, står facit og rosen på kortet med
  Næste opgave; efter den sidste uløste opgave er der ingen knap på kortet,
  og Nye tal står i panelet.

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
css/stil.css        alt udseende (grundlaget er sc5.5's, felterne sc7.4's). NB: decimaltal med PUNKTUM i CSS
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
1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt
tilbage bagefter. Sidst kørt 6. november 2026: ALT OK (157 påstande).

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
