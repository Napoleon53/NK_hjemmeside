# sc1.2 Grundstofudstillingen

Superanimation om grundstofferne: navn, symbol, plads i det periodiske system
og elektronstruktur, og hvordan symbolerne tælles i en formel. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv, bortset fra
Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen moduler,
så den virker fra harddisken.

## Bestillingen

1. **Pointen:** et symbol står for ét grundstof med ét navn og én plads i det
   periodiske system; pladsen giver elektronstrukturen, og i en formel tæller
   tallet efter symbolet atomerne.
2. **Afløser** `kemi-c-filer/c1.2_grundstoffer.html`. Med fra den gamle: de 22
   opgaver i navne og symboler i begge retninger, elektronstrukturen fra
   isotopopgaverne, de seks formler med atomtælling og samlet antal, det
   periodiske system for grundstof 1-36 med navnene, facit på løste opgaver,
   frit valg af opgave og hjælp i grader.
3. **Naboerne:** `sc1.1_atombygger` ejer atomets partikler, massetal,
   isotoper og ioner (fane 1 Atommodellen og spilfanens spørgsmål om ladning,
   placering og massetal). `c1.4` ejer afstemning med koefficienter.
   `sc2.3_kemikalielageret` ejer navne og formler på ionforbindelser, og
   `sc3.1_elektronprikformler` ejer valenselektronerne som prikker. Intet af
   det kopieres herind.
4. **Loftet:** 3 faner. 36 grundstoffer (1-36) og 12 formler. På scenen højst
   udstillingen med 36 rum, kassen med prøverne eller de 12 flasker, én prøve eller
   flaske i stort format, tavlen, Kemichael og koppen.
5. **Layoutet:** scene plus panel. Udstillingen hænger øverst i scenen på alle tre
   faner. Fane 1: bordet med kassen, prøven og tavlen med atommodellen;
   panelet er opgavekortet. Fane 2: flasken og tavlen med formlen og
   atomerne; panelet er opgavekortet. Fane 3: udstillingen er spillepladen, og
   tavlen viser opråbet; panelet er point og start.

## Hvad den viser

Skolens grundstofudstilling er et glasskab formet som det periodiske system for
grundstof 1-36. Ordet i koden er stadig "montre" (`sim_montre.js`, `fane-montre`),
men eleven ser kun "udstilling", som er lettere at læse. Rengøringen har tømt den, og de 36 prøver står i en kasse på
bordet. Hver prøve har et mærke, hvor enten symbolet eller navnet mangler.

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Udstillingen | skriver navnet eller symbolet, trækker prøven op på sin plads og skriver elektronstrukturen | pladsen giver strukturen: perioden er antallet af skaller, hovedgruppen er antallet af elektroner i den yderste |
| 2 | Formlerne | tæller atomerne af hvert grundstof i et stof og til sidst dem alle | tallet efter et symbol tæller dets atomer, og tallet efter en parentes ganger alt indeni |
| 3 | Opråbet | finder grundstofferne i udstillingen på tid | navn, symbol og plads skal sidde |

**Udstillingen.** Et klik på en prøve i kassen tager den op på bordet. Panelet
har tre rækker: navnet eller symbolet, pladsen og elektronstrukturen. Det, eleven
skriver, står med blæk på mærket. Prøven trækkes op i det rum, hvis skilt har
symbolet (et klik på rummet virker også), og det kan ske før eller efter navnet.
En gul pil over prøven viser, at den kan flyttes, og linjen under scenen siger
hele tiden, hvad der skal ske nu. Hvert klik giver et svar: et klik på prøven
siger "Træk prøven op på sin plads i udstillingen", og et forkert rum giver
"Skiltet siger K. Find skiltet med Na.", hvorefter prøven flyver tilbage på
bordet. Elektronstrukturen venter, til prøven står på plads. Mens
elektronstrukturen skrives, tegnes atommodellen på tavlen skal for skal, og
elektroner, der ikke er plads til, bliver røde. Samtidig lyser periodens og
hovedgruppens nummer i udstillingen. Er strukturen rigtig, lyser den yderste skal,
og tavlen skriver "3 skaller, 3. periode" og "1 i den yderste, hovedgruppe 1".
Overgangsmetallerne (21-30) har kun navn eller symbol og plads. En prøve, der
er løst uden at se svaret, får en stjerne i sit rum. Et klik på en prøve i
udstillingen viser facit, og "Øv prøven igen" tager den ned på bordet.

Prøverne ligner dem i en rigtig grundstofsamling: de farveløse gasser H, He, N,
O, Ne, Ar og Kr står i klare glasampuller, fluor og chlor er farvet gas i en
ampul, brom er en rødbrun væske i en ampul, lithium, natrium og kalium ligger i olie, og
resten er faste stoffer i akrylkuber (svovlkrystaller, rødt phosphor, et
magnesiumbånd, en galliumdråbe, kobber, grafit osv.). Under scenen står én
linje om, hvor man møder stoffet.

**Formlerne.** Tolv flasker i tre niveauer: *Tal efter symbolet*, *Samme
symbol flere steder* og *Parenteser og ladning*. Formlen står stort på
tavlen. Når et grundstof er talt rigtigt, flyver dets atomer ud af udstillingen og op
på tavlen som kugler i formlens rækkefølge. En parentes bliver til lige så
mange kopier, som tallet efter den siger, med en stiplet ramme om hver. Så kan
man se, hvorfor Al₂(SO₄)₃ har 12 O. Hintet får grundstoffet og eventuelt
parentesen og tallet efter den til at lyse gult i formlen.

**Opråbet.** Tavlen under udstillingen siger et grundstof, og man svarer, før
kridtstregen er væk. Fire niveauer med fem rigtige svar i hvert: navn → plads
(de 20 første plus Fe, Cu og Zn), symbol → navn (et rum blinker, og man vælger
blandt fire navne), elektronstruktur → plads (fx 2,8,5) og til sidst det hele
blandet med alle 36 og kortere tid. Et forkert svar eller en tid, der løber ud,
koster et liv, og efter tre er spillet slut. Et forkert svar forklares ("K er
kalium. Kulstof er C."), og det, man ikke nåede, står bagefter i panelet under
"Øv dem her". Rekorden huskes.

**Kemichael** kommer ikke af sig selv. Første gang en fane åbnes i en browser,
står der to knapper midt foroven: Start præsentation og Nej tak (`js/praesentation.js`,
reglen i `../README.md`). Så kan eleven kigge sig omkring først. Tilbuddet
forsvinder også, når den første opgave er løst eller spillet startet. Trykker
eleven Start, præsenterer han: udstillingen og formlerne tre replikker, hvor han
peger på panelet, opråbet to, hvor han peger op på udstillingen. Han går kun ved
knappen Spring præsentationen over, to klik på ham eller Esc, og på opråbet også
ved Start. <kbd>K</kbd> viser
præsentationen igen. Ellers roser han tørt, når en periode er fyldt, når et
niveau af flasker er talt, og når spillet er slut. Replikkerne står nederst i
`js/data.js`. Kaffekoppen på bordet er det fælles påskeæg.

**Navnetavlen** midt i udstillingen åbner det periodiske system i stort format med
atomnumrene og alle 36 navne i alfabetisk orden (også <kbd>P</kbd>). Hintet til
et navn eller symbol får den til at lyse, men den peger ikke selv på
grundstoffet, for så ville den give svaret.

Direkte links: `index.html#formler` og `index.html#opraab`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>P</kbd> navnetavlen ·
<kbd>R</kbd> start prøven, flasken eller spillet forfra · <kbd>H</kbd> rundvisning ·
<kbd>K</kbd> Kemichaels præsentation · <kbd>Enter</kbd> næste prøve eller flaske,
start spillet · <kbd>1</kbd>-<kbd>4</kbd> vælg et navn i opråbet · <kbd>Esc</kbd>
luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Opgaverne er rigtige prøver**, der skal på plads i en udstilling, i stedet for
  fire faner med spørgsmål. Udstillingen er det periodiske system, så pladsen og
  elektronstrukturen hænger sammen for øjnene af eleven.
* **Navne- og isotopopgaverne er slået sammen.** De 22 navneopgaver er med i
  samme retning som før, og de 14 andre grundstoffer er kommet til, så alle 36 i
  den gamle tabel har en opgave.
* **Elektronstrukturen bliver tegnet, mens den skrives.** Før kom
  atommodellen først, når svaret var vist.
* **Et forkert svar får en besked, der passer til fejlen**, i stedet for "Ikke
  helt rigtigt endnu". Tjekket kender over 70 typiske fejl: K som kulstof, Na
  som nitrogen, Ti som tin, CO for Co, 0 for O, NA for Na, engelske navne, et
  ionnavn (bromid), strukturen skrevet udefra, 2,8,9 for kalium, alle
  elektronerne i én skal, tallet efter H læst som S's, tallene ganget sammen,
  parentesen glemt og ladningen talt som et atom.
* **Stavefejl i lange navne godkendes med en bemærkning** ("Staves silicium"),
  og de gamle danske navne (brint, ilt, kulstof, kvælstof, fosfor, klor)
  godkendes stadig. Store og små bogstaver tæller i symboler.
* **Hjælpen er én knap:** Giv hint, så Vis svaret. Før stod hjælpeteksten fast
  under hvert spørgsmål, og svaret kom af sig selv efter tre fejl.
* **Fejlen i den gamle skalfordeling er rettet.** Efter calcium lagde den gamle
  alt i 3. skal (scandium blev 2,8,11). Det ramte ikke opgaverne, men ville
  have gjort det, hvis der var kommet flere til.
* **Formlerne er blevet tolv**, og atomerne vises. De seks gamle er med
  (H₂O, H₂SO₄, Al₂(SO₄)₃, NH₄NO₃, HNO₃, NO₂⁻), og der er kommet stoffer med
  samme symbol flere steder (ethanol, eddikesyre, myresyre) og flere parenteser
  (calciumhydroxid, ammoniumsulfat) til.
* **Spillet er nyt.** Det træner det, der skal kunnes udenad, på tid.
* **Fremskridtet huskes** i browseren.

### Det, der ikke er med

* **Fagbegreberne** (protonens ladning, hvor elektronerne sidder, isotoper og
  ioner) og **protoner og neutroner** i isotopopgaverne. `sc1.1_atombygger`
  ejer dem og spørger om det samme i sin fane 1 og i spillet. Spørgsmålene om
  skallerne (1. skal højst 2, 2. skal højst 8) er i stedet blevet til
  fejlbeskederne i elektronstrukturen.
* **"Hvad trænes her?"-boksen.** Rundvisningen bag `?` viser, hvad fanen går ud på.

## Filer

```
index.html          markup for de tre faner, navnetavlen i stort format og rundvisningen
css/stil.css        alt udseende (grundlaget er sc2.3's). NB: decimaltal med PUNKTUM i CSS
sprites/            akrylkube, ampul, glas med olie og reagensflaske (SVG)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred (som sc2.3)
js/data.js          de 36 grundstoffer, skalmodellen, de 12 formler, hjælpen og replikkerne
js/tjek.js          tjek af navn, symbol, elektronstruktur og antal atomer; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       udstillingen, prøverne, kassen, mærket, tavlen, atommodellen, flasken, kuglerne
js/opslag.js        navnetavlen i stort format
js/praesentation.js tilbuddet Start præsentation / Nej tak på alle tre faner
js/sim_montre.js    fane 1 (udstillingen)
js/sim_formler.js   fane 2
js/sim_opraab.js    fane 3
js/laerer.js        Kemichael på alle tre faner
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Grundstofferne** står i `G` øverst i `js/data.js`: atomnummer, symbol, navn,
andre navne, der godkendes, periode, søjle, slags, den halvdel af mærket, der
mangler, prøven og linjen om stoffet. Elektronstrukturen regnes ud af
`D.skaller`, så den kan ikke komme til at sige noget andet end pladsen.

**Prøvernes udseende** er beholderen (`ampul`, `olie` eller `kube`), en
form for de faste stoffer (`klump`, `blok`, `krystal`, `pulver`, `baand`,
`draabe`) og en farve. En ampul har `fyld`: `klar` (farveløs gas), `gas` eller
`vaeske`. Stofferne skal have den farve, eleverne kender: en farveløs gas er
klar, også selv om den lyser i et gasrør. Tegningen står i `kubeIndhold`,
`ampulIndhold` og `olieIndhold` i `js/tegning.js`.

**Formlerne** står i `F` i `js/data.js`: formlen med almindelige tal, ladningen,
navnet, niveauet, pulver eller væske, farven og linjen om stoffet. Atomtallene,
hintene og kuglerne på tavlen regnes ud af formlen. Hvert niveau skal have fire.

**Forvekslingerne i opråbet** står i `D.FORVEKSLING`: tre forkerte navne pr.
symbol, helst dem elever faktisk vælger.

**Fejlbeskederne** står i `js/tjek.js`. Engelske navne står i `ENGELSK`,
engelske stavemåder, der godkendes med en bemærkning, i `NAER`, og ionnavne i
`IONNAVNE`. De latinske navne bag Fe, Cu og S står i `D.LATIN`.

**Niveauerne i opråbet** står i `NIVEAUER` i `js/sim_opraab.js`: `tid` er
sekunder pr. opråb.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at de 36
grundstoffer står rigtigt, at elektronstrukturerne passer med kompendiets
tabel, at antallet af skaller altid er perioden og elektronerne i den yderste
hovedgruppen, at de 12 formler tælles rigtigt, at alle rigtige svar godkendes,
at over 70 typiske fejl giver den rigtige besked, at der er hint og svar til
alle 145 felter uden at hintet siger svaret, at opråbets svarmuligheder er
fire forskellige med ét rigtigt, at sproget holder reglerne, at alle tre faner
kan gennemføres, og at layoutet holder fra 520 × 380 til 1500 × 900. Den
kræver en lokal server eller Chrome med `--allow-file-access-from-files`. Den
lægger elevens gemte fremskridt tilbage bagefter.

## Forenklinger

* Skalmodellen er C-niveauets: 1. skal højst 2, 2. skal højst 8 og den yderste
  højst 8. Kalium og calcium lægger derfor den 19. og 20. elektron i 4. skal, og
  fra gallium er 3. skal fuld med 18.
* Der spørges ikke om overgangsmetallernes elektronstruktur. Modellen kender
  den (Cr og Cu har én elektron i yderste skal), men den hører ikke til C-niveau.
* Farverne på de faste stoffer er deres udseende i luft. Lithium, natrium og
  kalium er matte, fordi de har et tyndt lag på overfladen.

## I menuen

Siden 24. september 2026 er den c1.2 i `animationer/kemi-c-filer/samling_c1.html`
og i `animationer/samling_NV.html` (knappen med `data-emne="c1.2"`, der peger
på `sc1.2_grundstofudstilling/index.html`). Delte links via
`samling_alt.html?emne=c1.2` går hertil. Den gamle ligger i
`kemi-c-filer/arkiv/c1.2_grundstoffer_oldversion.html`, og i `FEEDBACK_EMNER` i
`animationer/samling_alt.html` hedder den `'Grundstofudstillingen'`.
