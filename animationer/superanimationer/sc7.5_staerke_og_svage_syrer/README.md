# sc7.5 Stærke og svage syrer

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen Kemichael og ingen statuslinje nederst: al tekst står på ét kort
øverst midt i scenen, også hint og den gule hintknap.

Den er bygget fra bunden og afløser ingen gammel animation. Den er **ikke i
menuen** endnu. Den hører til afsnit 7.2 i Kemibogen (Stærke og svage syrer),
som var det eneste afsnit i kapitel 7 uden sin egen animation.

## Bestillingen (9. oktober 2026)

Brugeren bad om forslag til animationer, Kemibogen til kemi C mangler, valgte
det første forslag og skrev: "Start med at lave animationen til stærke og
svage syrer. Det skal være en superanimation". Forslaget var: to glas med
samme koncentration, saltsyre og eddikesyre, hvor luppen viser, at alle 100
molekyler er delt i saltsyren og kun 1 i eddikesyren; en fane, hvor eleven
afgør ud fra luppen, om en ukendt syre er stærk eller svag; og en fane, hvor
saltsyren fortyndes 100 gange (stærk er ikke det samme som koncentreret).

1. **Pointen:** En stærk syre afgiver alle sine hydroner i vand, en svag kun
   få, og derfor har den svage syre langt færre oxoniumioner end den stærke
   ved samme koncentration.
2. **Afløser intet.** Udgangspunktet er Kemibogens afsnit 7.2 og dens to
   figurer (hele molekyler som grå piller, syrens ion blå, oxonium rød) og
   opgaverne 7.2.2 til 7.2.5.
3. **Naboerne:** `sc7.1` ejer hydronens vej fra syre til base og de
   korresponderende par. `sc7.2` ejer pH-skalaen, faktor ti og fortyndingen
   som emne; her er fortyndingen kun et middel, og der regnes ikke på pH.
   `sc7.3` ejer beregningerne med log, `sc7.4` titreringen. `sc5.2` ejer
   formel og aktuel koncentration for salte. `sc8.1` ejer metaller i syre;
   derfor er det kalk, der bruser her, ikke magnesium.
4. **Loftet:** tre faner, fem syrer (saltsyre, salpetersyre, eddikesyre,
   myresyre, citronsyre), 15 mål (5 + 5 + 5), højst to lupper med 100
   molekyler i hver og højst fem glas på bordet.
5. **Layoutet:** scene plus panel. Scenen har glassene på et bord forneden
   og luppen over dem.

Stop-listen er overholdt: der er ingen flasker at hælde fra, intet stativ,
intet affald og ingen uheld. Kalken trækkes fra en skål (eller et klik på
glasset), og fortyndingen er én knap.

### Tilføjelsen 9. oktober 2026: gættet midt i scenen

Brugeren efter første kig: "Det er fint. De tal passer fint. Der er flere
animationer hvor man skal besvare en hypotese før man begynder, men de fleste
elever er tosser, som trykker før de læser (husk det), og det må derfor gerne
notches meget tydeligt hvis de skal udfylde en hypotese først. Måske en
kombination af blink eller pile eller blot meget mere central placering af
hypotesen. Der er jo plads i denne animation til at lægge det ovenover
forsøget".

Sådan blev det (Claudes udformning): de fire gæt (fane 1 mål 1, fane 2 mål 4
og 5, fane 3 mål 1) står på et stort gult kort midt i scenen over glassene,
dér hvor lupperne ellers er: mærket Gæt først, en kort indledning (`intro`),
selve spørgsmålet med stor skrift (`tekst`) og de tre svar som store knapper
side om side. Kortet pulserer stille. Spørgsmålet står kun ét sted (panelets
opgavekort blev fjernet helt senere samme dag, se næste tilføjelse). Hintknappen er kun et gult
omrids under gættet, så kortet er det eneste fyldte gule. Det, der først skal
bruges bagefter, er skjult imens: lupperne og knappen Fortynd på fane 3 og
luppens plads på fane 2. Klikker eleven på et glas, på skålen eller på noget
andet i forsøget før gættet, sker handlingen ikke; kortet blinker tre gange,
og kortet siger Gæt først. Reglen står i `../../../CLAUDE.md` og under
Fælles krav i `../README.md`.

### Tilføjelsen 9. oktober 2026: spørgsmålene samme sted og nye former i luppen

Brugeren efter gætkortet: "Det er fint nok. Men i næste opgave kommer endnu en
gæt først mekanisme og her ser jeg gerne samme placering igen. Desuden synes
jeg mikroplanet er lidt forvirrende. Hvorfor gøre Cl⁻ til nogle aflange
rektangler (som måske bedre kunne være CH₃COOH, som jo er aflangt)? Legenderne
må også gerne være mere tydelige".

Sådan blev det (Claudes udformning):

* **Scenekortet.** Hele opgaven står nu på ét kort øverst midt i scenen:
  gættet (stort og gult), det, eleven skal gøre (mærket Opgave 1), og
  spørgsmålene (mærket Spørgsmål, gul ramme, svarene som knapper side om
  side). Et forkert svar bliver rødt på kortet, det rigtige grønt, og kortet
  får mærket Løst. Panelets opgavekort er væk, og panelet er smallere (340 px,
  310 px under 1320 px), så scenen får pladsen.
* **Pladsen er sat af.** Lupperne begynder under kortets plads (`kortZone`:
  se den sidste tilføjelse for tallene), så intet flytter sig, når et spørgsmål
  kommer. Glassene er blevet mindre, og titlen over hver lup er væk: sedlen på
  glasset og signaturen siger, hvad luppen viser. Derfor er teksterne korte.
* **Reaktionsskemaet på fane 2** står på kortet under spørgsmålet om pilen,
  ikke under luppen.
* **Formen følger stoffet** (`FORM` i `js/lup.js`): HCl og Cl⁻ er kugler,
  eddikesyre, myresyre og citronsyre er aflange i hver sin størrelse, og
  salpetersyre er en trekant med runde hjørner. Et helt molekyle er gråt med
  hydronen på som en lille orange kugle, syrens ion er blå med et minus, og
  H₃O⁺ er en rød kugle med plus. Når et molekyle afgiver sin hydron, kommer
  oxoniumionen frem dér, hvor den orange kugle sad.
* **Signaturen** er tre store mærker over hver lup med tegnet og formlen
  (`T.signatur` i `js/tegning.js`). Et klik på et mærke forklarer partiklen.
* **pH-metret** viser pH som sidste linje på glassets seddel i stedet for et
  display over glasset, hvor der ikke længere er plads.

### Tilføjelsen 9. oktober 2026: forklaringen i det grønne kort

Brugeren efter scenekortet: "Det ser bedre ud, men noget som forvirrer eleverne
er også, at forklaringen til det rigtige svar kommer helt nede i bunden, mens
det med fordel kunne være samlet i den nu grønne boks oppe i toppen. Også her
bør der ledes videre til næste opgaver."

Sådan blev det (Claudes udformning): når et mål er løst, viser det grønne kort
mærket Rigtigt ✓ (Løst ✓ efter et forsøg uden spørgsmål), det rigtige svar med
fed grøn skrift, forklaringen og knappen Næste opgave →, der banker.
Svarknapperne er væk imens, så kortet bliver på sin plads over lupperne. Det
samme sker efter et rigtigt svar, når der kommer et spørgsmål til (knappen
hedder så Næste spørgsmål →). Er svaret vist med hjælpeknappen, er kortet gult
med mærket Svaret. (Linjen forneden blev senere samme dag fjernet helt, se den
sidste tilføjelse.)

I det sidste mål på fane 3 er de to glas væk, mens tavlen er fremme, så tavlen
kan stå fast under kortets plads og ikke flytter sig, når kortet får
forklaringen.

Forklaringen til et forkert svar blev først ikke flyttet; den kom op på kortet
med den sidste tilføjelse.

### Tilføjelsen 9. oktober 2026: intet indforstået, og en ring om glasset

Brugeren: "Undgå at lave indforstået spørgsmål. Her står fx 'Også her blev der
hældt 100 molekyler i. Hvor mange af dem har afgivet en hydron?' Hvad er også
her? Vær mere skarp i sproget, så eleverne ikke skal gætte hvad du mener. Lav
eventuelt en ring om det bægerglas, som du henviser til".

Sådan blev det (Claudes udformning):

* **Alle tekster er skrevet om** (`js/data.js`): gæt, opgaver, spørgsmål,
  svar, hint, forklaringer til forkerte svar og forklaringen til det rigtige.
  Hver tekst nævner selv det glas, den syre og den lup, den handler om
  ("Luppen over eddikesyren: 100 eddikesyremolekyler blev hældt i vandet.
  Hvor mange af dem har afgivet en hydron?"), og ingen tekst begynder med
  "også", "nu" eller "her". Det samme gælder kortets nederste række ("Kom også et
  stykke kalk i glasset med eddikesyre.").
* **Ringen** (`om` i `js/data.js`, `omNu` i `js/fane.js`): det eller de glas,
  et spørgsmål handler om, får en rolig gul ring, og glassets lup får en gul
  ramme. Ringen er væk, når spørgsmålet er besvaret. Ringen, der pulserer med
  et gult skilt, betyder stadig "klik her".
* **Glas A til E** står nu på sedlen på hvert glas på fane 2 ("Glas A", og
  under det syrens navn, når eleven har fundet det), ikke som et bogstav under
  glasset, hvor linjen forneden kunne dække det.
* **Ét ord:** panelet siger Opgaverne (før Målene), som kortet siger Opgave 1
  og knappen Næste opgave.
* Et spørgsmål er højst 118 tegn og et svar højst 46 (kortets plads står i
  den sidste tilføjelse).

### Tilføjelsen 9. oktober 2026: al tekst over animationen

Brugeren: "Fair nok. Men der sidder stadig noget tekst fast nede i bunden af
animationen. Kan du ikke samle alt tekst over animationen?"

Sådan blev det (Claudes udformning):

* **Statuslinjen nederst er væk.** Den sidder nu som kortets nederste række
  (`.sk-bund`, stadig id `x-status`, `x-besked` og `x-knap`): hint,
  forklaringen til et forkert svar (rød, lige under svarknapperne), det,
  fanen har at tilføje til opgaveteksten, og svaret på et klik i scenen.
  Scenen går helt til bunds (`baand()` giver højden 0).
* **Kortets plads** (`kortZone`) blev 218 px (200 px på lave skærme): det, der
  før var kortets plads plus statuslinjens højde. (Siden sat ned til 198 og
  172 px, se næste tilføjelse.)
* **Kun det, kortet ikke selv siger.** Linjer som "Vælg et svar på kortet" og
  "Gæt først i opgavekortet" er væk; `sceneLinje` giver en tom tekst, når
  opgaveteksten er nok.
* **Hintknappen** sidder i kortets nederste række. Under et gæt er den væk
  (først var den et lille omrids, Spring gættet over; taget ud i næste
  tilføjelse). Når opgaven er løst, er rækken væk, og kortets grønne knap
  fører videre.
* **Efter et forsøg** med et gæt eller en iagttagelse (`set`) står det, eleven
  så, alene på det grønne kort med knappen Næste spørgsmål (mærket Godt ✓,
  eller Forsøget ✓, når gættet ikke holdt). Før stod det i linjen forneden.
* **Forfra-knappen** er ude af rækken: på fane 3 står Ny saltsyre under
  knappen Fortynd mellem glassene; på fane 1 gør tasten R og et klik på
  opgaven i listen det samme.
* Mærker, der sidder på tingene selv (sedlen på glasset, det gule skilt "Klik
  for at se i luppen", "Kalk" under skålen, skiltene i luppen), er blevet i
  scenen.

### Tilføjelsen 9. oktober 2026: mindre tekst, og en lås på forsøget

Brugeren: "Fint arbejde. Men der er stadig en smule for meget tekst, og nogle
gange er det muligt at starte animationen inden man har fået spørgsmålet."

Sådan blev det (Claudes udformning):

* **Låsen.** Eleven kan kun sætte noget i gang i scenen, mens kortet viser et
  forsøg, og kun det, opgaven beder om. Under et gæt, mens et spørgsmål står
  på kortet, og mens kortet er grønt og venter på Næste, sker der intet ved
  et klik på et glas, skålen eller en knap: kortet blinker i stedet (er det
  grønt, er det knappen Næste, der blinker). Koden er `iForsoeg()`, `spaer()`
  og `kortBlink()` i `js/fane.js`; hver fane begynder det, der sætter noget i
  gang, med `if (this.spaer()) return;`.
  * Fane 1: luppen over et glas åbner kun i den opgave, der beder om netop
    det glas (`forsoeg.aabn` i `js/data.js`). Før kunne begge lupper åbnes,
    så snart kalken var i.
  * Fane 2: kun opgavens glas kan vises i luppen. Før kunne eleven klikke
    rundt mellem alle fem glas, også mens et spørgsmål om et andet glas stod
    på kortet.
  * Fane 3: knapperne Fortynd og Ny saltsyre er kun fremme i et forsøg. Før
    kunne saltsyren fortyndes videre under spørgsmålene, så tallene i
    spørgsmålet ikke længere passede med glasset. I den første opgave lukker
    knappen efter én fortynding.
  * Fane 1, Hydroner frem og tilbage: det første bytte venter 5 sekunder, så
    opgaven kan læses først.
  * At se nærmere på det, der allerede er fremme, er altid i orden: et klik
    på en partikel i en lup eller på et mærke i signaturen.
* **Mindre tekst.** Alle tekster på kortet er skrevet kortere, og linjer, der
  gentog kortet, er væk ("Gæt først ...", "Se, hvor meget kalken bruser ...",
  "Luppen viser glas B. Klik på glas A." og linjerne under en fortynding;
  mærket over glasset siger stadig "9 tiendedele hældes fra"). Grænserne, som
  selvtesten tæller: et spørgsmål højst 105 tegn (før 118), et svar 34 (før
  46), et forsøg 95 (før 150), et hint 100, forklaringen til et forkert svar
  110 og forklaringen til det rigtige 160. Navnet på glasset eller syren er
  blevet i hver tekst (intet indforstået).
* **Under et gæt** er der kun gættet på kortet: knappen Spring gættet over er
  væk.
* **Kortets plads** (`kortZone`) er sat ned til 198 px (172 px på lave
  skærme), så lupperne er blevet 20 til 28 px højere.

### Valg, brugeren ikke har taget stilling til

* **Kalk i stedet for magnesium.** Forslaget sagde magnesium. Afsnit 7.2
  slutter med syre og kalk, og metaller i syre kommer først i kapitel 8.
* **pH-metret er et tilvalg** bag knappen pH-meter i toplinjen og er slået
  fra, hver gang siden åbnes. Bogen indfører først pH i afsnit 7.3, så alle
  mål kan løses uden. Forslaget lod eleven sætte pH-metret i selv.
* **Fane 3 sammenligner oxoniumionerne**, ikke pH, af samme grund.
* **Mappen hedder sc7.5**, fordi det er den næste ledige plads i
  `samling_c7.html`. I bogen er emnet afsnit 7.2.

## Fane 1: To glas (`#glas`)

To bægerglas på et bord: saltsyre og eddikesyre, begge 0,10 M, og en skål
med kalk imellem. Fem mål:

1. **Kalk i syre.** Et gæt først. Så trækker eleven et stykke kalk ned i
   hvert glas: det bruser kraftigt i saltsyren, og i eddikesyren kommer der
   en boble nu og da.
2. **Saltsyren i luppen.** Et klik på glasset åbner luppen over det. Af 100
   HCl-molekyler er ingen hele: 100 blå chloridioner og 100 røde
   oxoniumioner.
3. **Eddikesyren i luppen.** 99 grå, hele molekyler (aflange, med hydronen
   på), 1 blå acetation og 1 rød oxoniumion. Antallet står stille i dette mål, så det kan tælles, og
   andet hint sætter en gul ring om oxoniumionen.
4. **Frem og tilbage.** Nu bytter eddikesyren hydroner: et helt molekyle
   afgiver en hydron, og lidt efter tager en acetation en hydron tilbage.
   Små skilte siger, hvad der sker. Derfor dobbeltpilen.
5. **Stærk og svag.** Hvorfor bruser saltsyren mest? Ordene stærk og svag
   kommer først her.

Panelet husker det, eleven har talt i lupperne.

## Fane 2: Stærk eller svag? (`#styrke`)

Fem glas med 0,10 M syre og et stykke kalk. På sedlen står Glas A til Glas E
uden syrens navn (`D.GLAS`). Et klik på et glas viser det i den ene lup.

* **Glas A, B og C** (salpetersyre, eddikesyre, citronsyre): eleven afgør
  ud fra luppen, om syren er stærk eller svag. Så får glasset sit navn, og
  eleven vælger pilen i reaktionsskemaet på kortet (→ eller ⇌).
  Citronsyre har 8 delte ud af 100 og svaret "Midt imellem" som fælde.
* **Glas D og E** (saltsyre og myresyre) har fået deres etiket, og eleven
  gætter først på, hvad luppen viser. Glas E slutter med, at svage syrer
  ikke er lige svage: myresyre bruser mere end eddikesyre.

Efter et rigtigt svar på det første spørgsmål står forklaringen alene, og
eleven går selv videre med knappen Næste spørgsmål (reglen fra `sc5.1`).

## Fane 3: Fortyndet? (`#fortynd`)

Til venstre 0,10 M eddikesyre, til højre saltsyre, begge med kalk og hver
sin lup. Knappen Fortynd 10 gange hælder ni tiendedele af saltsyren fra og
fylder op med vand. Fem mål:

1. **Fortynd 10 gange.** Et gæt først. Saltsyren på 0,010 M har stadig 10
   oxoniumioner i luppen mod eddikesyrens ene.
2. **Lige mange oxoniumioner.** To fortyndinger: 0,0010 M og 1 oxoniumion.
   En tredje fortynding tømmer luppen, og linjen sender eleven tilbage med
   Ny saltsyre. Spørgsmålet bagefter: 100 gange, ikke 20.
3. **Er saltsyren blevet svag?** Nej: dens ene molekyle i luppen har afgivet
   sin hydron.
4. **Hvor er der mest syre?** I eddikesyren: 100 molekyler mod 1.
5. **To slags ord.** En tavle med fire flasker (`D.ORD`), hvor eleven
   vælger stærk eller svag og koncentreret eller fortyndet til hver. En
   forkert række bliver rød, og linjen forklarer den første fejl.

## Hjælpen

Al tekst står på kortet øverst i scenen (se tilføjelserne ovenfor): opgaven,
spørgsmålene, forklaringen til det rigtige svar og knappen videre. Kortets
nederste række viser hint og forklaringen til et forkert svar; den bliver rød
og ryster ved en fejl. Den gule knap i samme linje giver ét
hint ad gangen (tre trin) og til sidst svaret: Giv et hint er fyldt gul, Vis
svaret kun et gult omrids, og knappen lyser stille op efter et forkert svar.
Under et gæt er knappen væk. Det, der skal klikkes på eller trækkes i, har en
gul ring og et lille gult skilt, og alt andet i scenen er låst, til kortet
viser et forsøg (et klik får kortet til at blinke). Koden til kortet er
`visKort`, `kortHTML`, `slutNu`, `videreTekst`, `kortZone`, `kortBlink`,
`iForsoeg` og `spaer` i `js/fane.js`. Teorien ligger bag knappen Teori, rundvisningen bag `?`.

Et klik på en partikel i en lup eller på et mærke i signaturen siger, hvad
den er. Påskeæg: tre klik på den
ene oxoniumion i eddikesyren på fane 1.

## Modellen og forenklingerne

* **Syrekonstanterne er Databogens** (25 °C): eddikesyre pKs 4,76, myresyre
  3,75 og citronsyre 3,13 (første trin). Andelen, der har afgivet en hydron,
  regnes af Ks = x² / (c − x): 1,3 %, 4,1 % og 8,2 % ved 0,10 M. Saltsyre og
  salpetersyre regnes som helt delt.
* **Luppens rum** er valgt, så 0,10 M svarer til netop 100 molekyler:
  1,66 · 10⁻²¹ L. I samme rum er der ca. 55.000 vandmolekyler, som ikke er
  tegnet. Det siger teorien og et af de forkerte svar.
* **Antallet af delte er gennemsnittet afrundet** til et helt tal (1, 4 og
  8) og holdes dér. I virkeligheden svinger det. Under et bytte er der
  kortvarigt én mere, aldrig én mindre, så eddikesyren aldrig står uden
  oxoniumion. Hvor tit der byttes, er valgt (ca. hvert 6. sekund ved 1 delt,
  oftere ved flere).
* **Partiklerne er enkle former**, ikke molekylmodeller: formen følger
  stoffet (kugle, aflang eller trekant), og farven følger bogen (helt molekyle
  gråt, syrens ion blå, oxonium rød, hydronen orange). Der står ikke formler
  på dem; signaturen over luppen siger, hvad de er. Salpetersyres trekant er
  valgt, fordi nitrationen er plan med tre oxygenatomer; størrelserne er ikke
  i målestok.
* **Brusen følger [H₃O⁺]:** 60 bobler i sekundet i 0,10 M saltsyre og
  proportionalt færre ellers (0,8 i eddikesyre). Kalken bliver ikke mindre,
  og syren bliver ikke brugt op. I virkeligheden ville den svage syre blive
  ved længere, fordi de hele molekyler leverer nye hydroner; det er ikke med.
* **Fortyndet saltsyre:** ved 0,00010 M er der i gennemsnit en tiendedel
  molekyle i luppens rum, så luppen er tom, og der står en linje om det.
  Vands egne ioner (10⁻⁷ M) er ikke med.
* **Kun syrer med én hydron, der betyder noget.** Svovlsyre er udeladt,
  fordi det andet trin (pKs 1,99) ville give to slags ioner i luppen.
  Kulsyre er udeladt, fordi kun 1 ud af 500 molekyler er delt, så luppen
  for det meste ville være uden ioner. Citronsyrens andet og tredje trin er
  uden betydning ved 0,10 M.
* **Baser er ikke med.** Afsnit 7.2 har også stærke og svage baser; de kan
  blive en udvidelse af fane 2.
* **pH** regnes som −log[H₃O⁺] og vises med to decimaler på glassets seddel,
  når pH-metret er slået til.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        grundlaget fra sc8.6 og sc1.4 og nederst den gule
                    hjælpeknap, pH-knappen, knappen Fortynd og tavlen.
                    NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, tekst og lærred (som sc8.6)
js/kemi.js          modellen: syrerne og pKs, K.oxonium, K.andel, K.pH,
                    K.iLup (antal i luppen), K.brus og skemaerne
js/data.js          målene på de tre faner, de fem glas, tavlens flasker
                    og klikteksterne
js/sprites.js       indlæser sprites/ uden fetch
js/lup.js           partikelbilledet i luppen: stoffernes former (FORM),
                    byttet af hydroner og signaturens tegn
js/tegning.js       bordet, zoomrammen, signaturen og det gule skilt
js/glas.js          et bægerglas med syre, kalk, bobler, seddel og pH-meter
js/fane.js          det fælles: scenekortet, listen, målenes dele,
                    kortets nederste række, hjælpeknappen, musen
js/sim_glas.js      fane 1
js/sim_styrke.js    fane 2
js/sim_fortynd.js   fane 3
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, pH-knappen, tastatur og tegneløkken
sprites/            baegerglas.svg (fra sc7.2), kalk.svg og kalkskaal.svg
_sprites.html       viser de tre sprites alene
_selvtest.html      udviklerværktøj, se nedenfor
```

En ny syre er én linje i `K.SYRE` (navn, formel, ion og pKs eller
`staerk: true`), en form i `FORM` i `js/lup.js` og et bogstav i `D.GLAS`. Et mål er én post i `D.G_MAAL`,
`D.S_MAAL` eller `D.F_MAAL`. Brusen står i `BRUS` i `js/glas.js`, og hvor
tit der byttes, i `interval` i `js/lup.js`.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>R</kbd> forfra (stil opgaven op igen; på fane 3 ny saltsyre, kun i et forsøg) ·
<kbd>P</kbd> pH-meter · <kbd>Enter</kbd> tjek tavlen · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>Esc</kbd> luk. Direkte links:
`#glas`, `#styrke` og `#fortynd`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som
rod. Den tjekker modellen mod Databogens tal, at luppen viser det antal
partikler, modellen siger, og at byttet af hydroner hverken taber eller
skaber molekyler, at kalken bruser efter [H₃O⁺], alle 15 mål (selv med mus
og klik, med forkerte svar og med Vis svaret), at startbilledet på hver fane
kun viser det, første trin har brug for, at opgaven står på kortet i scenen
og ikke i panelet, at forklaringen til et løst mål står på det grønne kort
med knappen videre, at der ingen tekst står nederst i scenen, at låsen holder
(i alle dele af alle 15 mål prøves et klik på hvert glas, skålen og knapperne:
uden for et forsøg må intet flytte sig, og kortet skal blinke), at teksterne
holder længdegrænserne, at formen følger stoffet, at intet er
indforstået (hver tekst på kortet nævner et glas eller en syre), at glasset,
spørgsmålet handler om, har en ring, sproget og layoutet fra 1100 × 620 til
1600 × 950 (kortet måles i alle dele af alle 15 mål: et gæt må ikke dække
glassene, og alt andet må ikke være højere end sin plads over lupperne).
Kortets højde måles også med hvert hint og hvert forkert svar. Sidst kørt
9. oktober 2026: ALT OK (157 påstande).

## Menuen

Ikke lagt i menuen. Når brugeren siger til:

* `kemi-c-filer/samling_c7.html`: en knap med
  `visAnimation(this, '../superanimationer/sc7.5_staerke_og_svage_syrer/index.html')`,
  `data-emne="c7.5"` og titlen "Stærke og svage syrer". Brugeren afgør, om
  den skal stå som nr. 5 eller som nr. 2 efter Syre/Base-reaktioner, som i
  bogen (så omnummereres de næste).
* `FEEDBACK_EMNER` i `samling_alt.html` under C7.
* Rækken i `../README.md`.
* Kemibogen: boksen Prøv selv i `kapitler/7-2-staerke-og-svage-syrer.qmd`.
