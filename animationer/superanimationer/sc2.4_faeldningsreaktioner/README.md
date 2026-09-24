# sc2.4 Fældningsreaktioner

Superanimation om at opskrive fældningsreaktioner. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv og virker også, når den åbnes direkte fra
harddisken.

Den afløser den gamle c2.4, som nu ligger i
`animationer/kemi-c-filer/arkiv/c2.4_afstem_faeldning_oldversion.html`. Knappen i
`samling_c2.html` peger direkte på denne `index.html` (23. sept. 2026). Delte
links går via `samling_alt.html?emne=c2.4` og brækker ikke.

## Bestillingen

1. **Pointen:** når to saltopløsninger blandes, finder ionerne nye partnere.
   Fældningstabellen afgør, om et af de nye par er tungtopløseligt, og
   reaktionsskemaet viser kun det par.
2. **Afløser** den gamle c2.4. Med fra den gamle: de fire trin (ionerne, de nye
   par, tilstandsformen, afstemningen), og at de forkerte svarmuligheder er
   typiske fejl (Ba⁺, Cl₂⁻, K₂⁺). Nyt: fældningstabellen, blandinger uden
   bundfald, tre niveauer og bægerglas med ionerne.
3. **Naboerne:** `sc2.2_saltbygger` ejer at bygge formlen ud fra ladningerne,
   `sc2.3` navngivningen, `c2.5` og `c2.7` forsøgene. Her er formlen ét trin,
   ikke emnet, og der er ingen dråbeflasker, uheld eller forløb i laboratoriet.
4. **Loftet:** 3 faner (sværhedsgrader). En tabel med 12 positive og 8 negative ioner,
   40 opløsninger. På scenen 3 bægerglas med højst 20 ioner.
5. **Layoutet:** scene plus panel. Scenen er bægerglassene foroven og
   arbejdsbordet med reaktionsskemaet forneden. Panelet har trinene, den ene
   hjælpeknap og fældningstabellen.

Skemaformen er valgt af brugeren: eleven ender med **ionskemaet**, hvor
tilskuerionerne er streget ud, fx 3 Ag⁺(aq) + PO₄³⁻(aq) → Ag₃PO₄(s). Sådan
skriver lærebogen og c2.5 det. Den gamle c2.4 afstemte hele saltskemaet.

## Samme opgave i tre sværhedsgrader

Brugeren ønskede, at det skal være tydeligt, at det er den samme opgave. Fanerne
hedder derfor Let, Middel og Svær med en lille måler (1, 2 og 3 streger) og en
linje om, hvad eleven selv gør. Opgavekortet har den samme opgavetekst ("Sølvnitrat
og natriumphosphat blandes. Hvad falder ud, og hvad er ionskemaet?") og de samme
fire trin på alle tre. Direkte links: `#let`, `#middel`, `#svaer`.

| Fane | Eleven | Stilladset |
|------|--------|------------|
| Let · slå op i tabellen | finder de to nye par i tabellen og siger, hvad der falder ud | ionerne er givet, formlen og ionskemaet vises |
| Middel · vælg svarene | går de fire trin igennem med svarmuligheder | forkerte svar er typiske fejl med forklaring |
| Svær · skriv selv | går de fire trin igennem og skriver selv ionerne, formlen og ionskemaet | skrivefeltet sætter tallene og bogstaverne rigtigt, og fejlen bliver genkendt |

På Let står trin 1 som "givet" og trin 3 og 4 som "vises" i trinlisten; de
klares af sig selv (`givet` i `js/niveauer.js`). Trin 2 har to dele: de nye par
i tabellen, så hvad der falder ud. Let har blandinger med ét bundfald (55 %),
intet bundfald (30 %) og to bundfald (15 %). Middel og Svær har altid ét
bundfald. De fire trin:

1. **Ionerne.** Hvilke ioner er der i de to opløsninger? Når begge ioner fra ét
   salt er fundet (Middel) eller skrevet rigtigt (Svær), dukker de op i det
   salts glas.
2. **Bundfaldet.** Eleven klikker på det tungtopløselige par i
   fældningstabellen. Så hældes glassene sammen, bundfaldet klumper sammen og
   synker, og tilskuerionerne streges ud på tavlen.
3. **Formlen.** Bundfaldets formel, med ladningsregnskab i forklaringen.
4. **Ionskemaet.** Tal foran og tilstandsform. Middel har + og − ved tallene
   og (aq)/(s) som knap; Svær har tre felter pr. led.

Den ene knap i panelet er `Giv hint` → `Vis svaret` → (næste trin) → `Ny
opgave`. Et vist svar tæller ikke med i "løst". De svære forhold (3 : 1, 3 : 2)
kommer på Middel og Svær først, når eleven har løst to lette.

### Skrivefeltet på Svær

Eleven skal kunne skrive kemiske symboler uden at lede efter hævet og sænket
skrift. `NK.Formel.formater` i `js/formel.js` retter, mens der tastes, og hvert
tegn bliver til præcis ét tegn, så markøren bliver stående:

* Tal efter et symbol eller en parentes bliver sænket: `Ca3(PO4)2` → Ca₃(PO₄)₂.
* Store og små bogstaver rettes, når det skrevne passer på kendte ioner:
  `no3-` → NO₃⁻, `ag3po4` → Ag₃PO₄, som i kemiautocorrect.
* Parenteser sættes ind som i kemiautocorrect, når en sammensat ion med et tal
  efter står sammen med en anden ion: `ca3po42` → Ca₃(PO₄)₂, `feoh3` → Fe(OH)₃,
  `nh42so4` → (NH₄)₂SO₄. En ion alene får ingen parentes, for i `so42-` er
  2-tallet ladningen. Kommer der en parentes til, flyttes markøren med.
* `+` og `-` til sidst bliver til ladning. Tallet lige før fortegnet er ladningen
  (`Fe3+` → Fe³⁺, `PO43-` → PO₄³⁻), medmindre formlen med tallet er en kendt ion
  (`NO3-` → NO₃⁻, `NH4+` → NH₄⁺). Opslaget er ligeglad med store og små
  bogstaver. Skriver eleven `PO4-`, bliver det PO₄⁻ med
  forkert ladning, ikke PO⁴⁻.
* Ladningsknapperne sætter ladningen på det felt, man står i, og tager et
  sænket tal med, hvis det var ment som ladning (Fe₃ + 3+ → Fe³⁺).
* Et tal skrevet foran formlen i ionskemaet flyttes over i talfeltet.

`vurderIon`, `vurderSalt` og `vurderSkema` finder den typiske fejl og svarer på
den: det lille tal regnet med til ionen (Na₃⁺, Cl³⁻ ud fra FeCl₃), manglende
ladning eller forkert fortegn, en sammensat ion delt (P³⁻), manglende parentes
(Ca₃PO₄₂), tallene byttet om, ikke mindste forhold, positiv ion sidst,
ladninger skrevet i saltets formel, store og små bogstaver, det letopløselige
par i stedet for bundfaldet og tilskuerioner i ionskemaet. Beskeden om store og
små bogstaver kommer kun, når det skrevne ikke passer på kendte ioner.

## Fældningstabellen

L = letopløseligt, T = tungtopløseligt, ÷ = findes ikke. Grænsen er 1 g pr.
100 mL vand ved 20 °C, som i sc2.1. Tallene er fra CRC Handbook of Chemistry
and Physics (opløselighed i vand). De salte, der ligger tæt på grænsen:

| Salt | g pr. 100 mL | I tabellen |
|------|--------------|------------|
| Ca(OH)₂ | 0,17 | T |
| CaSO₄ | 0,2 | T |
| Ag₂SO₄ | 0,8 | T (som i c2.5) |
| PbBr₂ | 0,97 | T |
| PbCl₂ | 0,99 | T |
| Ba(OH)₂ | 3,9 | L |

÷ står ved NH₄⁺ + OH⁻, Ag⁺ + OH⁻, Al³⁺ og Fe³⁺ + CO₃²⁻ og Fe³⁺ og Cu²⁺ + I⁻.
Dér sker der noget andet end en fældning, og holder man musen over feltet,
står det i tabellens infolinje. Par med ÷ kommer aldrig i en opgave.

## Forenklinger

* T betyder, at der dannes bundfald. Koncentrationen er ikke med.
* Bundfaldet af Cu²⁺ og CO₃²⁻ kaldes CuCO₃. I virkeligheden er det et basisk
  kobbercarbonat.
* Ionerne er tegnet store og ikke i skala. Mængderne i glassene følger det fulde
  saltskema (3 AgNO₃ til 1 Na₃PO₄), så der er præcis nok til hele formelenheder
  af bundfaldet, og tilskuerionerne bliver tilbage.
* Bundfaldets farve (hvidt, gult, rødbrunt, lyseblåt) og opløsningernes farve
  (Cu²⁺ blå, Fe³⁺ gulbrun, Fe²⁺ lysegrøn) er med. Falder den farvede ion ud,
  mister opløsningen farven.

Påskeæg: klik på blandingen, og der røres rundt. Bundfaldet hvirvles op og
synker igen; det går ikke i opløsning af at blive rørt.

## Filer

```
index.html        toplinje, scene, panel, teori og rundvisning
css/stil.css      alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js       NK-navnerum, hævet og sænket skrift, canvas
js/data.js        ionerne, fældningstabellen, opløsningerne, opgaverne,
                  formler og de forkerte svarmuligheder
js/formel.js      skrivefeltet: formatering, læsning og genkendelse af fejl
js/tabel.js       fældningstabellen i panelet
js/sprites.js     lageret til Kemichaels sprites
js/baeger.js      de tre bægerglas med ionerne og bundfaldet
js/opgave.js      motoren: trin, hjælpeknap, tavle og fælles hændelser
js/niveauer.js    de tre sværhedsgrader og deres trin
js/laerer.js      Kemichaels præsentation af hver sværhedsgrad
js/rundvisning.js rundvisningen bag ?
js/app.js         faneskift, tastatur, tegneløkke
sprites/          bægerglasset (samme som sc2.1)
_selvtest.html    udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Tabellen** er strengene i `TABEL` i `js/data.js`, én pr. positiv ion, med
søjlerne i rækkefølgen NO₃⁻ Cl⁻ Br⁻ I⁻ OH⁻ SO₄²⁻ CO₃²⁻ PO₄³⁻. Et nyt ÷ skal have
en tekst i `FINDES_IKKE`. **Opløsningerne**, opgaverne laves af, står i
`D.OPLOESNINGER`; opgaverne er alle par af dem, hvor ionerne kan bytte partner.
En ny ion kræver en linje i `D.IONER`, en plads i `KAT_ORDEN` eller `AN_ORDEN`
og et bogstav i hver række af `TABEL`.

**De forkerte svar** laves af `D.ionAtrapper` (Middel, trin 1) og
`D.formelVarianter` (Middel, trin 3). Rækkefølgen i dem er vigtig: den første
fejl, der passer på opgaven, kommer med. `D.formelKatalog` bruger de samme
forklaringer til at genkende elevens egen formel på Svær.

**Et trin** er et objekt i `js/niveauer.js` med `spm`, `hint`, `vis` og det, der
skal til for at svare (`valg`, `tabelKlik`, `tjek`). Motoren i `js/opgave.js`
står for resten.

## Selvtesten

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker tabellen, at
alle 533 par har rigtigt udfald og et afstemt fuldt skema, at svarmulighederne
har præcis ét rigtigt svar med forklaring, at skrivefeltet formaterer alle 20
ioner rigtigt, at de typiske fejl bliver genkendt, at det rigtige svar
godkendes i alle opgaver, at alle tre niveauer kan gennemføres, at
bundfaldet lander i glasset, og at sproget overholder reglerne.

## Kemichael

Kemichael præsenterer hver sværhedsgrad første gang, den åbnes i en browser,
som i sc2.3: han går ind foran det tomme glas i midten, siger tre korte
replikker og går igen. Under anden replik peger han på det, den handler om, og
det lyser op: tabellen (Let), opgavekortet (Middel) og arbejdsbordet (Svær).
Scenen låser ikke. Knappen Spring præsentationen over, to klik på ham og Esc
sender ham ud, og <kbd>K</kbd> viser præsentationen igen. Replikkerne står i
`D.INTRO` i `js/data.js`, og hvad der er vist, huskes under `nk-sc2.4-intro` i
browseren. Figuren, klik på ham og baggrundslivet kommer fra
`../../v2/kemichael/kemichael.js`; koblingen står i `js/laerer.js`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".

## I menuen

Knappen med `data-emne="c2.4"` i `animationer/kemi-c-filer/samling_c2.html`
peger på `../superanimationer/sc2.4_faeldningsreaktioner/index.html`, og
`FEEDBACK_EMNER` i `animationer/samling_alt.html` har navnet
`'Fældningsreaktioner'`.
