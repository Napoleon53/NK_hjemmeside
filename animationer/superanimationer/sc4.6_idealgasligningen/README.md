# sc4.6 Idealgasligningen

Superanimation om idealgasligningen: tryk, volumen, stofmængde og
temperatur hænger sammen i p · V = n · R · T. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`).
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** p · V = n · R · T. Skruer man på én af de fire
   størrelser, må mindst én anden ændre sig, og kender man tre, kan man
   regne den fjerde ud.
2. **Afløser** `kemi-c-filer/c4.6_idealgasligning_simulation.html`. Med fra
   den gamle: cylinderen med stemplet og molekylerne, der farer rundt og
   giver et glimt, når de rammer, varme og kulde under cylinderen, lodderne
   på stemplet, frit eller låst stempel, stofmængden, de fire måletal og
   pV-grafen med kurven for samme n og T. Quizzen ("Test din forståelse")
   er blevet til forudsigelser på fane 1: eleven vælger først og prøver så.
   Ud: den opfundne gaskonstant (17,5 L ved 298 K) og atm. Nu regnes der
   med bar og R = 0,0831 L·bar/(mol·K) som i kompendiet til Basiskemi C.
3. **Naboerne:** `sc4.2` ejer m = n · M, `sc4.5` mængdeberegning med
   reaktioner og `c4.9` lightergasforsøget. Her bruges n = m / M kun i
   de svære opgaver, med molarmassen givet. `c4.10` ejer betydende cifre.
4. **Loftet:** 2 faner. Fane 1: én cylinder, højst 80 molekyler
   (40 pr. mol, 0,25 til 2,00 mol), 3 lodder og 7 forudsigelser. Fane 2:
   12 opgaver (4 Let, 4 Middel, 4 Svær) med nye tal.
5. **Layoutet:** scene plus panel som `sc4.5`. Cylinderen er stjernen;
   nederst Kemichaels bånd med katederet.

Brugerens valg (25. sept. 2026): de to faner Stemplet og Beregningen, og
den rolige Kemichael fra `sc4.5` (han blander sig kun, når eleven beder
om et hint eller svaret, og kan sendes ud). Ingen knapper til
præsentationen.

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
skyderen. Hvert klik giver et kort svar i opgavekortet. Molekylernes fart
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

**Kemichael ved katederet** (som `sc4.5`): han sidder stille bag sit
kateder nederst til venstre og siger kun noget ved Giv hint (til
delopgaven er løst) og Vis svaret. Knappen Send Kemichael ud sender ham på
lærerværelset (seddel på katederet); så står hintene i opgavekortet.
Valget gælder begge faner og huskes i browseren. Klik på ham og koppen
giver korte svar. <kbd>K</kbd> får ham til at sige, hvor man er.

**Påskeæg:** stil gassen på 1,00 mol, 0 °C, uden lodder og med frit
stempel: 22,4 L, tallet fra de gamle lærebøger. Er alle lodder på, er
"kaffekoppen ikke et lod".

Direkte link til fane 2: `index.html#regn`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichael siger, hvor man er ·
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
css/stil.css        alt udseende (grundlaget er sc4.5's, felterne sc7.4's). NB: decimaltal med PUNKTUM i CSS
sprites/            loddet, manometeret, gasflasken og varmepladen (nye) og katederet (som sc4.5)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.5)
js/data.js          konstanterne, forudsigelserne, regneopgaverne og replikkerne
js/gas.js           modellen: idealgasligningen, stemplet, opgavernes trin og facit, molekylerne
js/tjek.js          formlerne (fortolker og regner efter), tallene og beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       cylinderen, manometeret, varmepladen, flasken, hylden, skiltene, grafen og tavlen
js/laerer.js        Kemichael ved katederet (NK.RoligLaerer, som sc4.5)
js/sim_stempel.js   fane 1
js/sim_regn.js      fane 2
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
`js/gas.js`; intet facit er skrevet i hånden. **Kemichaels replikker**
står i `D.INTRO`, `D.FAERDIG`, `D.ROS`, `D.KAFFE` og de korte svar fra
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
to ting på én gang, åbnet lås, hint og Vis svaret, at Kemichael kun
taler, når eleven beder om det, og at layoutet holder fra 520 × 380 til
1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt
tilbage bagefter. Sidst kørt 25. september 2026: ALT OK (143 påstande).

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

I menuen fra 26. sept. 2026 som c4.6 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.6_idealgasligning_simulation_oldversion.html`.
