# sb7.4 Byg figuren: fagord til kapitel B7

Ny 10. nov. 2026 (brugeren: "Kan du lave 'byg figuren' til de resterende kapitler i kemibogen B?").
Bygget efter opskriften i `../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt
kapitel") som kopi af `../sb5.6_byg_figuren` (B5). Mappen hedder sb7.4, fordi sb7.2 og sb7.3 er
optaget af andre animationer.

Kapitlet blev lavet i to halvdele samtidig: B7.1 til B7.4 i denne mappe og B7.5 til B7.8
(fedtstoffer, iodtal, aminosyrer og proteiner, fanerne `fedt`, `iodtal`, `amino` og `protein`) i en
kopi, der blev lagt ind samme dag. Første halvdel er beskrevet først, anden halvdel i sit eget
afsnit længere nede. Otte faner med alle 64 fagord.

**Rettet 10. nov. 2026 (brugeren):** "Fjern gerne galactose som fagord". Galactose er taget ud af
bogens fagordliste og står uden fed i B7.1, og kortet med galactose er taget ud af figuren i B7.1,
så aldose er en ramme om glucose alene. Aldose og ketose bliver, fordi opgaverne bruger dem
(brugerens valg samme dag). Samme dag fik fanelinjen to lige lange rækker, når fanerne ikke kan stå
på én, fordi B7.7 og B7.8 ellers var skjult (fælles i `js/app.js` og stilarket, se sc1.5's README).

**I menuen:** B-panelets fane "byg" som B7 "Fødevarer" (`?emne=b7.byg`, 10. nov. 2026), linjen under
'Byg figuren' i `FEEDBACK_EMNER` i `samling_alt_b.html` og `"b7"` i `BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html` (flisen vises efter næste bygning af bogen). Brugeren
har ikke set den endnu.

## Bestillingen

1. **Pointen i én sætning.** Kapitel B7's fagord sat på figurer i B-bogens stil, så eleven ser,
   hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens b7-naeringsstoffer,
   b7-kulhydrat-oversigt, b7-glucose-fructose, b7-fischer-laes, b7-d-og-l, b7-ringslutning,
   b7-alfa-beta, b7-maltose-dannelse, b7-hydrolyse, b7-disaccharider, b7-polysaccharider og
   b7-fehling-glas (`vaerktoej/lav_figurer.py`, `sf_b7k_...`).
3. **Naboerne.** `sb7.2_ringslutning`, `sb7.3_polysaccharider` og `b7.10_ringslutning_kulhydrater`
   ejer at bygge og dreje molekylerne. Her sættes kun ord på.
4. **Loftet.** Én fane pr. afsnit og alle 64 fagord (29 fra B7.1 til B7.4 og 35 fra B7.5 til B7.8). Polysaccharid står to
   steder (`NK.GENTAGET`), og kondensation fra B4.5 er med igen (`NK.TIDLIGERE`).
   - B7.1 Monosaccharider: 11 pladser (10 fagord og polysaccharid) i tre lag (4, 3, 4).
   - B7.2 Ringslutning: 4 fagord i to lag (2, 2).
   - B7.3 Di- og poly: 12 pladser (11 fagord og kondensation) i fire lag (3, 3, 3, 3).
   - B7.4 Fehlings test: 4 fagord i to lag (2, 2).
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B7.1 | tre kort med rugbrød, en dråbe olie og et æg og energien pr. gram i en ramme; tre kort med én sekskant, to sekskanter og en kæde; D-glucose og D-fructose som fischerprojektioner; glucose med alle atomer tegnet og som fischerprojektion med grønne carbonatomer; D-glucose og L-glucose med et spejl imellem | næringsstof (titel på rammen), monosaccharid, disaccharid og polysaccharid (kortenes titler); glucose og fructose (skilte under kortene), fischerprojektion (titel på kortet til højre for "Alle atomer tegnet"); aldose (titel på en ramme om glucose med CHO i en grøn boks), ketose (titel på en ramme om fructose med C=O i en orange boks), D-form og L-form (titler på kortene med carbonatom 5 i en boks) |
| B7.2 | den åbne kæde med aldehydgruppen i en grøn boks og OH på carbonatom 5 orange; en ligevægtspil; α-glucose og β-glucose som haworthformler med ringens oxygenatom orange og OH på carbonatom 1 grøn, i en ramme | ringslutning (pilen), haworthformel (titel på rammen om begge ringe); α-glucose og β-glucose (skilte under kortene), og fordelingen i vand (36 % og 64 %) kommer frem, når navnet sidder |
| B7.3 | to glucose med de grønne OH-grupper, en pil hver vej, maltose og vand; lactose og saccharose med navnene på enhederne og bindingens navn; amylose som spiral, amylopectin og glykogen som træer med få og mange forgreninger, cellulose som lige kæder med hydrogenbindinger | kondensation (pilen mod højre), hydrolyse (pilen mod venstre), glykosidbinding (oxygenatomet mellem ringene i maltose); maltose, lactose og saccharose (skilte under kortene); stivelse (titel på en ramme om amylose og amylopectin), amylose og amylopectin (skilte); glykogen og cellulose (skilte), polysaccharid (overskrift til venstre for båndet med alle fire) |
| B7.4 | et blåt glas med kobber(II)sulfat og et farveløst med natriumhydroxid og tartrat, en pil og den dybblå blanding; glucose og maltose murstensrøde efter opvarmning, saccharose stadig blå | Fehling I, Fehling II og Fehlings væske (skilte under kortene); reducerende sukker (titel på en ramme om glucose og maltose) |

## Valg og forenklinger

- **Ord, der kan forveksles, står på forskellige ting eller kommer i hvert sit lag:**
  - Navnene glucose og fructose sidder som skilte under kortene i lag 2, og klasserne
    aldose og ketose kommer først i lag 3 som titler på rammer om kortene. Rammen om aldose har
    CHO i en grøn boks og rammen om ketose C=O i en orange boks, så titlen handler om gruppen.
  - D-form og L-form står på et særskilt par af glucose med et spejl imellem. Bogens titler
    D-glucose og L-glucose og linjerne "OH til højre på carbonatom 5" er taget af.
  - haworthformel er titlen på rammen om begge ringe, og α-glucose og β-glucose er skilte under
    hvert sit kort. Det gule felt om α- og β-glucose ligger også om OH på carbonatom 1.
  - kondensation og hydrolyse sidder på hver sin pil med modsat retning. Maltose og vand står til
    højre, så retningen kan læses.
  - amylose og amylopectin kommer i lag 3 sammen med rammen stivelse, og glykogen og cellulose
    først i lag 4, så amylopectin har sit navn, før glykogen dukker op. Glykogen har dobbelt så
    mange forgreninger som amylopectin (bogens træer) og står uden for rammen om stivelse.
  - Fehling I og Fehling II kendes på farven og på linjerne under glasset. Glassene står derfor i
    farver fra start; det er linjerne om indholdet, der får farve, når navnet sidder. Pilen siger
    "blandes lige før".
- **Tekster, der ville afsløre en plads, er taget af:** bogens linjer under kulhydratkortene
  ("én enhed", eksemplerne), "druesukker" og "aldehydgruppe: en aldose" under monosaccharidernes
  kort, titlerne α-D-glucose og β-D-glucose og linjerne om OH på carbonatom 1, linjerne under
  polysacchariderne ("en kæde, der snor sig", "cellevægge i planter"), "positiv test" og "efter
  opvarmning med Fehlings væske" (der står "Alle tre glas er varmet i vandbad med den dybblå
  blanding").
- **Figurer, der ikke er i bogen i denne form:** pilen mod venstre (hydrolyse af maltose; bogen viser
  hydrolysen af saccharose), maltose som skilt under produktet i kondensationen, Fehling I og
  Fehling II i hvert sit glas og maltose i Fehlings test (bogen har saccharose kogt med syre).
  Den åbne kæde og de to ringe i B7.2 er bogens b7-alfa-beta, men ringslutningen står på pilen,
  og de tre kort fra b7-ringslutning er ikke med.
- **Polysaccharid** står to steder: som titel på det tredje kulhydratkort i B7.1 (bogens B7.1 har
  ordet med fed i listen over kulhydrater) og som overskrift over polysacchariderne i B7.3, hvor
  fagordet hører til på bogens liste.
- **Kondensation** er fagord i B4.5 og står i `NK.TIDLIGERE` med B4's forklaring, så hydrolyse
  har sin modsætning ved siden af (gentagelse er godt, brugeren 1. nov. 2026).
- Lagenes rækkefølge, de tre lag i B7.1 og de fire i B7.3 er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de fælles filer fra sb5.6 (kopieret uændret 10. nov.
2026) og skal holdes ens i alle Byg figuren-mapperne. `org.js` er sb4.10's tegnehjælp, kopieret
uændret (kortene `ORG.kortB` og pilene `ORG.reaktionspil`). Kapitlets egne filer er `js/data.js`
(forklaringerne fra `Kemibogen/b/fagord/kapitel-b7.qmd`, lavet med et lille script, sænkede tal
skrevet som tegn), `js/kulhydrat.js` og en `js/fig_*.js` pr. afsnit: `fig_mono.js`, `fig_ring.js`,
`fig_poly.js` og `fig_fehling.js`.

`js/kulhydrat.js` (`NK.KH`) er kapitlets tegnehjælp, overført fra bogens `lav_figurer.py`:
fischerprojektioner med bokse og numre (`KH.fischer`, b7_fischer), glucose med alle atomer
(`KH.gitter`), haworthformler med seks og fem atomer, også vendt om (`KH.ring`, b7_ring), ringe i
række med glykosidbindinger (`KH.ringe`, `KH.bro`), sekskanter med lys og skygge (`KH.hex`,
`KH.obro`), amylosespiralen (`KH.spiral`), træerne (`KH.trae`), hydrogenbindinger, rugbrødet,
dråben og ægget, energibjælken, reagensglas med murstensrødt kobber(I)oxid (`KH.glas`) og en
lille grå pil. Bredden af en tekst regnes som i bogen (`KH.bredde` = b4_bredde).

`_selvtest.html`: ALT OK (970) for B7.1 til B7.4 og ALT OK (2110) for hele kapitlet efter
sammenlægningen 10. nov. 2026. Skærmbilleder af hver fane i første lag, hvert lag,
færdig og i den svære udgave ved 1400 × 860 og 1280 × 720 er set igennem.

## Anden halvdel: B7.5 til B7.8 (10. nov. 2026)

Bygget i en arbejdskopi og lagt sammen med B7.1 til B7.4 bagefter. Fire faner med alle 35 fagord
fra afsnittene, ingen udeladt, ingen gentaget og ingen ord fra B7.1 til B7.4.

- B7.5 Fedtstoffer (`fedt`): 7 fagord i tre lag (3, 2, 2).
- B7.6 Iodtal og forsæbning (`iodtal`, fanen hedder Iodtal): 6 fagord i tre lag (2, 2, 2).
- B7.7 Aminosyrer (`amino`): 10 fagord i tre lag (3, 4, 3).
- B7.8 Proteiner (`protein`): 12 fagord i tre lag (2, 5, 5).

### Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B7.5 | bogens b7-triglycerid-dannelse (glycerol + 3 fedtsyrer → fedtstof + 3 H₂O, estergrupperne som strukturformler i grønne bokse, gyldne kæder); stearinsyre (C18:0) og oliesyre (C18:1) som i b7-fedtsyrer; bogens b7-haerdning (et stykke kæde med cis-dobbeltbinding + H₂ → lige kæde) og under den en hel elaidinsyre (trans-C18:1) med rød dobbeltbinding | glycerol, fedtsyre (de tre syrer), triglycerid (produktet); mættet fedtsyre (stearinsyre), umættet fedtsyre (oliesyre); hærdning (pilen), transfedtsyre (elaidinsyre) |
| B7.6 | tilbagetitreringen i en enkel udgave af b7-tilbagetitrering: tre kolber (dibrom i overskud, dibrom adderer, resten titreres) og bjælkerne n(Br₂, start), forbrugt og overskud; R−CH=CH−R′ + I₂ og bogens b7-iodtal-skala med fem fedtstoffer; bogens b7-forsaebning med kortere kæder; to små kort med kokosfedt (255) og olivenolie (190) og deres kæder og med frisk og harsk olie | tilbagetitrering (kortets titel), iodtal (skalaens titel); forsæbning (kortets titel), sæbe (de tre ioner); forsæbningstal og syretal (titler på de små kort) |
| B7.7 | bogens b7-aminosyre-generel med farvede bokse; de ni essentielle aminosyrer; fem af de syv i b7-aminosyrer-syv (alanin, valin, serin, asparaginsyre, lysin); glycin, der reagerer med sig selv til en amfoion; bogens b7-aminosyre-fordeling for glycin | aminosyre (kortets titel), sidekæde (R), essentiel aminosyre (kortets titel); upolær, polær, sur og basisk sidekæde (kortenes titler); amfoion (produktet), fordelingsdiagram (kortets titel), isoelektrisk punkt (den lodrette linje) |
| B7.8 | bogens b7-peptidbinding (alanin + glycin → Ala-Gly + H₂O); b7-denaturering i lille udgave (foldet → varme → foldet ud, kæden er hel); en ramme om de fire kort fra b7-proteinstruktur (perler, helix og foldeblad, foldet protein, fire kæder), hvor tredje lag lægger hydrogenbindingerne i helixen og mellem strengene, en lilla-grå sky af upolære sidekæder og en gul svovlbro ind | peptidbinding (den grønne boks), dipeptid (produktet); protein (rammens titel), primær, sekundær, tertiær og kvaternær struktur (kortenes titler); α-helix, β-foldeblad, hydrofob vekselvirkning (skyen), disulfidbro (S−S), denaturering (pilen) |

### Valg og forenklinger

- Ord, der ville afsløre en plads, står ikke i figurerne: "glycerol", "3 fedtsyrer" og "fedtstof
  (triglycerid)" under stofferne i B7.5, "mættet" og "monoumættet" ved fedtsyrerne, "mættet kæde" og
  "trans-dobbeltbinding" i hærdningen, "sæbe" under ionerne, kortitlerne over sidekæderne, kurvens navn
  "amfoion" i fordelingsdiagrammet (der står "ladning 0"), "dipeptidet Ala-Gly" og "peptidbindingen er
  markeret", kortitlerne over de fire niveauer og "α-helix" og "β-foldeblad" i sekundær struktur.
- Mættet fedtsyre og transfedtsyre ligner hinanden med vilje: begge kæder er lige. Transfedtsyren
  har en rød dobbeltbinding, og fejlteksterne siger, at dobbeltbindingen ikke giver et knæk. Fejlteksten
  ved transfedtsyre siger ærligt, at umættet fedtsyre passer på alle kæder med dobbeltbindinger.
- De tre fedtsyrer i dannelsen er mættede som i bogens b7-triglycerid-dannelse. I den svære udgave
  kan eleven derfor sætte mættet fedtsyre på dem; pladsen fedtsyre har en fejltekst til mættet,
  umættet og transfedtsyre, der siger, at pladsen spørger efter det fælles navn (lagt til ved
  sammenlægningen).
- Hærdning peger på pilen (reaktionen), ikke på et kort, så ordet ikke står over transfedtsyren.
  Linjen "Biprodukt, når kun nogle dobbeltbindinger adderer H₂" står over elaidinsyren.
- Iodtal, forsæbningstal og syretal er holdt ude fra hinanden med enheden og sammenhængen: iodtallet
  står på skalaen med "få/mange dobbeltbindinger" og "g I₂ pr. 100 g", forsæbningstallet ved korte og
  lange kæder og syretallet ved frisk og harsk olie, begge med "mg KOH pr. g fedtstof". Syretallet har
  ingen tal (der står "lavt tal" og "højt tal"), fordi bogen ingen tal har. Iodtal og forsæbningstal er
  bogens tal; ingen beregning fra titreringsdata (holdt ude af bogen).
- I B7.7 er glycin og cystein fra bogens syv aminosyrer taget ud for at gøre figuren mindre. Glycin
  bruges i stedet til amfoionen og fordelingsdiagrammet. Glycins isoelektriske punkt står ikke som tal
  (holdt ude af bogen, som i figuren b7-aminosyre-fordeling).
- Essentiel aminosyre er titlen på et kort med de ni navne fra afsnittets tekst og linjen "Kød, fisk,
  æg og mælk indeholder alle ni." (afsnittet nævner de ni som tal; navnene står ikke i bogen).
- Protein er titlen på en ramme om de fire niveauer, fordi et overbegreb er en ramme om sine dele.
  Kortenes titler sidder 44 enheder under rammens titel, så de ikke rører hinanden.
- Hydrofob vekselvirkning og disulfidbro sidder inde i det foldede protein i tertiær struktur (en sky
  af upolære sidekæder i midten og to gule svovlatomer), fordi den tertiære struktur "holdes sammen af
  bindinger mellem sidekæderne". Bogens fire små kort med bindingerne er ikke med.
- Helixen i sekundær struktur har bogens mål (r 15, 4,5 vindinger på 126 enheder). Dens
  hydrogenbindinger er røde prikker langs vindingerne; bogens figur viser dem kun mellem strengene.
- Denatureringskortet står øverst til højre, men hører til tredje lag, så den plads er tom i lag 1 og 2.
- Pladserne i B7.8 er 273 enheder brede (hydrofob vekselvirkning), og det har bestemt layoutet med
  to kort ved siden af hinanden i rammen.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

### Filerne til denne halvdel

`js/fedt_protein.js` (`NK.FP`) er tegnehjælpen, oversat fra bogens figurprogram: `hale` (kæden med
cis-knæk eller trans-dobbeltbinding), `ester` (sf_b7f_ester), `glycerol`, `glycerolOH`, `fedtstof`,
`roer`, `helix`, `tegnHelix`, `streng`, `fold` (sf_b7f_fold), `aminosyre` (H₂N−CH−COOH med sidekæden
nedad), `kaedeTekst`, `perle`, `kolbe` og `burette`, gløder og farveforløb. Den bygger på `js/org.js`
(kopieret uændret fra sb4.10_byg_figuren), og `fig_amino.js` bruger `js/kurver.js` (uændret fra sb5.6)
til fordelingsdiagrammet. Figurerne er `js/fig_fedt.js`, `fig_iodtal.js`, `fig_amino.js` og
`fig_protein.js`. Rækkefølgen i index.html og selvtesten efter sammenlægningen: svg, data, motor, kurver, org,
kulhydrat, B7.1-B7.4's fig-filer, fedt_protein, B7.5-B7.8's fig-filer, app.

`_selvtest.html` i arbejdskopien: ALT OK (1130). Skærmbilleder af hver fane (alle lag, færdig og svær
udgave) ved 1400 × 860 og 1280 × 720 er set igennem. Ikke prøvet med en rigtig mus.

## Ikke lavet

- Prøvet med en rigtig mus. Træk og klik er motorens og er de samme som i sb1.5.
- B7.1 og B7.3 er de højeste figurer (1180 × 810 og 1180 × 818). Ved 1280 × 720 bliver formlernes
  skrift lille, men kan læses, som i B5.2.

## Papirkortet

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css`
er indlæst i `index.html` og selvtesten, og `<body class="papirkort">`.
