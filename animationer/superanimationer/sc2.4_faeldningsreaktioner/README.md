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
5. **Layoutet:** scene plus panel. Scenen er tekstboksen med opgaven
   øverst, arbejdsbordet med reaktionsskemaet lige under og bægerglassene
   nederst (fra 4. nov. 2026; før stod glassene øverst og spørgsmålet
   nederst). Panelet har trinene, knappen Ny opgave og fældningstabellen.

Skemaformen er valgt af brugeren: eleven ender med **ionskemaet**, hvor
tilskuerionerne er streget ud, fx 3 Ag⁺(aq) + PO₄³⁻(aq) → Ag₃PO₄(s). Sådan
skriver lærebogen og c2.5 det. Den gamle c2.4 afstemte hele saltskemaet.

## Samme opgave i tre sværhedsgrader

Brugeren ønskede, at det skal være tydeligt, at det er den samme opgave. Fanerne
hedder derfor Let, Middel og Svær med en lille måler (1, 2 og 3 streger) og en
linje om, hvad eleven selv gør. Tekstboksen begynder med blandingen
("Sølvnitrat og natriumphosphat blandes.") på alle tre, og panelet viser de samme
fire trin. Direkte links: `#let`, `#middel`, `#svaer`.

| Fane | Eleven | Stilladset |
|------|--------|------------|
| Let · slå op i tabellen | finder de to nye par i opslaget og siger, hvad der falder ud | ionerne er givet, formlen og ionskemaet vises |
| Middel · vælg svarene | går de fire trin igennem med svarmuligheder og Indsend svar | forkerte svar er typiske fejl med forklaring |
| Svær · skriv selv | går de fire trin igennem og skriver selv ionerne, formlen og ionskemaet | skrivefeltet sætter tallene og bogstaverne rigtigt, og fejlen bliver genkendt |

På Let står trin 1 som "givet" og trin 3 og 4 som "vises" i trinlisten; de
klares af sig selv (`givet` i `js/niveauer.js`). Trin 2 har to dele: de nye par
i tabellen, så hvad der falder ud. Let har blandinger med ét bundfald (55 %),
intet bundfald (30 %) og to bundfald (15 %). Middel og Svær har altid ét
bundfald. De fire trin:

1. **Ionerne.** Hvilke ioner er der i de to opløsninger? På Middel vælger
   eleven alle fire blandt otte og trykker Indsend svar. Er et forkert valg
   med, godkendes intet: de forkerte bliver røde med forklaring, og de rigtige
   bliver stående som valgt. Når begge ioner fra ét salt er godkendt (Middel)
   eller skrevet rigtigt (Svær), dukker de op i det salts glas.
2. **Bundfaldet.** Eleven slår op i fældningstabellen og klikker på det
   tungtopløselige par (se Opslaget nedenfor). Så hældes glassene sammen,
   bundfaldet klumper sammen og synker, og tilskuerionerne streges ud på
   tavlen.
3. **Formlen.** Bundfaldets formel, med ladningsregnskab i forklaringen.
4. **Ionskemaet.** Tal foran og tilstandsform. Middel har + og − ved tallene
   og (aq)/(s) som knap; Svær har tre felter pr. led.

Hintknappen i tekstboksen er `Giv et hint` → `Vis svaret`. Et vist svar
tæller ikke med i "løst". De svære forhold (3 : 1, 3 : 2) kommer på Middel og
Svær først, når eleven har løst to lette.

## Tekstboksen og opslaget (4. nov. 2026)

Brugeren: det var "lidt svært at gætte sig til at man skal klikke på
fældningstabellen". Opgaveteksten skulle stå inde i hovedanimationen og være
tydeligere, tekstboksen skulle bede eleven slå op i tabellen, og knappen skulle
give tabellen i næsten fuld skærm sammen med reaktionsskemaet. Når de rigtige
er klikket, er man tilbage ved den almindelige skærm.

**Tekstboksen** er papirkortet fra `../faelles/papirkort.css` (lyst kort,
Lexend), øverst midt i scenen som i de andre superanimationer. Al tekst står
dér: "Trin 2 af 4" som indlejret overskrift, blandingen, spørgsmålet,
svarmulighederne, beskeden (hint, forkert svar) og knapperne. Der er ingen
tekstlinje på arbejdsbordet længere; under tavlen står kun ladningsknapperne
på Svær. Svarknapperne vælger kun, og **Indsend svar** sender ind (grå, til
noget er valgt). Enter i et felt på tavlen er det samme som Indsend svar.
Efter et rigtigt svar bliver kortet på spørgsmålet: svaret bliver grønt,
forklaringen står under, og **Næste trin →** står, hvor Indsend svar stod
(til sidst **Ny opgave →**). Felterne på tavlen er låst imens. Ny opgave i
panelet giver en anden blanding.

**Opslaget.** I trinet med tabellen siger tekstboksen "Slå op i
fældningstabellen", og hovedknappen hedder det samme. Knappen, eller et klik
på tabellen i panelet, åbner opslaget: tekstboksen med det, eleven skal finde,
reaktionsskemaet med ionerne og fældningstabellen i næsten fuld skærm. På Let
finder eleven de to nye par; hvert fundet par kommer ind efter pilen med L
eller T. På Middel og Svær klikker eleven på det tungtopløselige par. Hint og
Vis svaret virker også i opslaget og markerer række og søjle i tabellen. Når
det rigtige er fundet, står opslaget 1,7 sekund med beskeden i grønt og
lukker så af sig selv; tabellen flytter tilbage i panelet. Bægerglassene står
stille, mens opslaget er åbent, så eleven ser dem blive hældt sammen
bagefter. Luk tabellen, Esc og et klik ved siden af lukker opslaget uden at
miste det fundne. Tabellen er ét element, der flyttes ind og ud
(`Opslag` i `js/opgave.js`).

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
js/opgave.js      motoren: trin, tekstboksen, Indsend svar, Næste trin,
                  tavlen, opslaget og fælles hændelser
js/niveauer.js    de tre sværhedsgrader og deres trin
js/laerer.js      Kemichaels præsentation af hver sværhedsgrad (den fælles
                  ../kemichael/praesentation.js)
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
skal til for at svare: `muligheder` og `bedoem` (svarknapper og Indsend svar,
`flere` når der vælges flere), `tabelKlik` og `opslagSpm` (opslaget) eller
`tjek` (felterne på tavlen). `vaerktoej` er HTML under tavlen. Motoren i
`js/opgave.js` står for resten; hovedkommentaren dér har hele listen.

## Selvtesten

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker tabellen, at
alle 533 par har rigtigt udfald og et afstemt fuldt skema, at svarmulighederne
har præcis ét rigtigt svar med forklaring, at skrivefeltet formaterer alle 20
ioner rigtigt, at de typiske fejl bliver genkendt, at det rigtige svar
godkendes i alle opgaver, at alle tre niveauer kan gennemføres (med Indsend
svar og Næste trin), at bundfaldet lander i glasset, at tekstboksen står
øverst og er højst 215 px høj (kortet blev større og glassene mindre 4. nov.), at opslaget åbner, svarer og lukker,
Kemichaels præsentation (tilbuddet, Næste, Spring præsentationen over, Esc,
K, de gule rammer, armen, niveauskift og opslaget, trinenes længde og den
fælles test fra `../kemichael/praesentation.js` på alle tre sværhedsgrader),
og at sproget overholder reglerne.

## Kemichael

Kemichael præsenterer hver sværhedsgrad første gang, den åbnes i en browser,
hvis eleven siger ja (se nedenfor). Præsentationen er den fælles fra 4. nov.
2026 (`../kemichael/praesentation.js` og `praesentation.css`): han går ind
foran det tomme glas i midten og siger tre trin (`D.INTRO` i `js/data.js`),
hvert med to til fire hele sætninger i Kemibogens sprog: hvad sværhedsgraden
træner, og hvordan tingene bruges. Teksten står i et lyst papirkort ved hans
hoved med to knapper, "Næste" (på sidste trin "Afslut") og "Spring
præsentationen over". Han går aldrig videre af sig selv; Enter og pil til
højre er Næste, og Esc springer over. Det, trinnet handler om, får en gul
ramme, der blinker: glassene (kun væsken med ionerne), tavlen, arbejdsbordet,
fældningstabellen, trinene i panelet og tekstboksen. Armen sigter op mod
tekstboksen og tavlen og til højre mod panelet; mod det venstre glas peger
han ikke, men kigger derhen. Scenen låser ikke. Et andet niveau, opslaget i
fældningstabellen og Spring præsentationen over sender ham ud, og <kbd>K</kbd>
viser præsentationen igen. Hvad der er vist, huskes under `nk-sc2.4-intro` i
browseren. Taleboblen er 47 % af området med glassene (`#laerred-boble` i
`css/stil.css`), så de to knapper står på én linje ved 1400 px.

Han kommer ellers ikke ind af sig selv (brugerens regel 4. nov. 2026). Her
er ingen ros, intet påskeæg og ingen kaffekop; tilbage er kun de fælles svar,
når man klikker på ham. De tre vittige replikker i den gamle præsentation
("Jeg holder øje.", "De forkerte svar har jeg rettet før. Mange gange." og
"Rødpennen er klar.") er taget ud, og to klik på ham sender ham ikke
længere ud. Figuren og klik på ham kommer fra
`../../v2/kemichael/kemichael.js`; koblingen står i `js/laerer.js`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven over glassene. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er den fælles `../kemichael/praesentation.js`, som i
`js/app.js` pakker `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".

## I menuen

Knappen med `data-emne="c2.4"` i `animationer/kemi-c-filer/samling_c2.html`
peger på `../superanimationer/sc2.4_faeldningsreaktioner/index.html`, og
`FEEDBACK_EMNER` i `animationer/samling_alt.html` har navnet
`'Fældningsreaktioner'`.
