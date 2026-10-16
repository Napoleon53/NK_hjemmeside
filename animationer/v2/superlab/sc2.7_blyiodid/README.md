# sc2.7 Opløselighedsprodukt for blyiodid

En superlab-animation: i modsætning til de gamle animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../../kemichael/` og den fælles laboratoriekode i
`../../laboratoriet/`. Den skal derfor ligge i `superlab/`, der står ved
siden af de to mapper.

## Hvor den står

Forsøget hører til **kemi B, B2 Ligevægt**, som knap 7 "Forsøg: Kₒ for PbI₂"
i `kemi-b-filer/samling_b2.html` (`data-emne="b2.7"`). Det følger afsnit B2.7
Opløselighedsprodukt i Kemibogen B.

Indtil 11. oktober 2026 stod det i kemi C som knap 7 i `samling_c2.html`
(`c2.7`) og målte opløselighedskurven i g pr. 100 mL. Brugeren bad om at få
det flyttet til ligevægt i kemi B og om et nyt fagligt fokus: at beregne
opløselighedsproduktet ud fra forsøget, og at det ikke skal være nødvendigt at
gentage forsøget tre gange. Mappen hedder stadig `sc2.7_blyiodid`, så adresser
og links holder (Kemibogen linker hertil). Et gammelt link med
`samling_alt.html?emne=c2.7` sendes videre til `samling_alt_b.html?emne=b2.7`.

Den afløste i sin tid `animationer/kemi-c-filer/c2.7_eksperiment_blynitrat.html`,
som ligger i `animationer/kemi-c-filer/arkiv/c2.7_eksperiment_blynitrat_oldversion.html`.

## Hvad viser den

Eleven udfører forsøget på et laboratoriebord: 100 mL vand i et bægerglas på en
varmeplade med magnetomrører, ca. 0,100 g Pb(NO₃)₂ og samme masse KI afvejet med
spatel, gult bundfald, opvarmning til bundfaldet er væk og afkøling til de
første krystaller kommer (gyldne regn). Temperaturen noteres, og eleven
beregner opløselighedsproduktet Kₒ for PbI₂ ud fra sine egne masser. Til sidst
afleveres resterne som tungmetalaffald.

Pointen i én sætning: lige når de første krystaller kommer, er opløsningen
netop mættet, så reaktionsbrøken med alt stoffet opløst er Kₒ ved den
temperatur.

    PbI₂(s) ⇌ Pb²⁺(aq) + 2 I⁻(aq)        Kₒ = [Pb²⁺] · [I⁻]²

* **Én måling er nok.** Forløbet har syv trin: vand, Pb(NO₃)₂, KI, opvarmning,
  temperaturen ved de første krystaller, beregningen af Kₒ og resterne. Et
  ottende trin er valgfrit og tæller ikke med: ca. 0,050 g mere af hvert stof
  giver Kₒ ved en højere temperatur, og det kan gøres op til to gange. Det
  valgfri trin står afdæmpet i listen med et plus i stedet for et nummer og
  bliver aldrig det aktuelle trin (`valgfri: true` i `TRIN`).
* **Kortet Beregning** i panelet har et måleskema med elevens egne tal:
  m(Pb(NO₃)₂), m(KI), V = 0,100 L og temperaturen. Når temperaturen er noteret,
  åbner feltet Kₒ(PbI₂) = … M³. Svaret tjekkes mod reaktionsbrøken i glasset
  (3 % tolerance), ikke mod en tabelværdi. De typiske fejl får hver sit hint:
  [I⁻] uden i anden, [I⁻] ganget med 2, stofmængder i stedet for
  koncentrationer, volumen i mL og en forkert titalspotens (`tjekKo` i
  `js/model.js`, teksterne i `HINT` i `js/app.js`). Tal kan skrives som
  4,5·10^-6, 4,5·10⁻⁶, 4,5e-6 eller 0,0000045 (`tal` i `js/model.js`).
  Eksemplet på skrivemåden er med vilje et tal, der ikke er et svar i forsøget.
* **Hjælp til beregningen** åbner en guide med fem trin, der låses op ét ad
  gangen: n(Pb(NO₃)₂), [Pb²⁺], n(KI), [I⁻] og Kₒ. Hvert trin er et regnestykke
  med størrelsen til venstre, formlen og elevens egne tal sat ind med rigtig
  brøkstreg. Et trin tjekkes mod elevens svar i trinnet før, så en afrunding
  ikke giver fejl senere. Mønsteret er det samme som i `sc8.6_jern_i_staaluld`.
* **Bundfaldet følger opløselighedsproduktet.** Kₒ(T) = 4 · s(T)³, hvor
  s(T) = 0,044 · e^(0,0223 · T) g pr. 100 mL er regnet om til mol/L. Det passer
  med tabelværdierne 0,044 g ved 0 °C, 0,069 g ved 20 °C og 0,41 g ved 100 °C
  og giver Kₒ = 1,3 · 10⁻⁸ M³ ved 20 °C. Der fældes x mol/L PbI₂, til
  (c(Pb²⁺) − x) · (c(I⁻) − 2x)² = Kₒ(T) (`ligevaegt` i `js/model.js`), så et
  lille overskud af KI giver lidt mere bundfald (fælles ion). Derfor er den Kₒ,
  eleven regner ud fra sine masser, præcis den, glasset opførte sig efter. Med
  omrøring hvirvler bundfaldet rundt; uden lægger det sig, og nye krystaller
  daler glinsende ned.
* **En rigtig opstilling** med brunt glas med Pb(NO₃)₂ og faresymboler, KI,
  digital vægt med vejebåd, spatel, måleglas, stativ med temperaturføler,
  varmeplade med to knapper, digitalt termometer og dunk til tungmetalaffald.
  Genstandene bruges ved at klikke på dem.
* **Afvejning på 0,001 g.** Vægten viser tre decimaler. En spatelspids
  indeholder mellem 0,038 og 0,062 g, forskelligt hver gang. Et klik på spatlen
  tager 0,004 til 0,016 g af igen. Første gang skal der afvejes 0,090 til
  0,110 g Pb(NO₃)₂, de næste gange 0,040 til 0,060 g, og KI skal have samme masse
  som Pb(NO₃)₂, højst 0,010 g fra. Vinduet er bredere end det mest, spatlen
  tager af, så massen altid kan rammes. M(Pb(NO₃)₂) = 331,2 g/mol er næsten
  2 · M(KI) = 332,0 g/mol, så samme masse giver forholdet 1 : 2. Tallene står i
  `SPATEL` i `js/model.js`.
* **Temperaturen styres af varmepladen.** Opvarmning ca. 2 °C pr. sekund,
  afkøling mod 20 °C, og pladen er varm lidt tid efter, at der er slukket. Vandet
  koger ved 100 °C. Tallene står i `VARME` i `js/model.js`.
* **Målingen ved afkøling.** Eleven varmer op, til opløsningen er klar, slukker
  og klikker på termometret (eller knappen Notér temperatur), når de første
  krystaller kommer. Det kan kun lade sig gøre, når opløsningen har været helt
  klar siden sidste tilsætning. Med 0,100, 0,150 og 0,200 g af hvert stof i alt
  bliver temperaturerne ca. 52, 70 og 83 °C og Kₒ ca. 1,1 · 10⁻⁷, 3,7 · 10⁻⁷
  og 8,8 · 10⁻⁷ M³.
* **Zoomboblen er talt.** 0,05 g Pb(NO₃)₂ giver 1 Pb²⁺ og 2 NO₃⁻, 0,05 g KI
  giver 2 K⁺ og 2 I⁻. Krystallen nederst har lige så mange PbI₂-enheder, som der
  er bundfald til, lagdelt som I⁻, Pb²⁺, I⁻. Den første enhed kommer præcis, når
  der igen er bundfald i glasset.
* **Forløb og hint i panelet.** Trinene får flueben efter tilstanden. Hint giver
  en kort tekst til det aktuelle trin og markerer den genstand, det handler om.
  Er eleven i gang med en ekstra måling, hjælper hintet med den. Der er ingen
  teori foran forsøget; den ligger bag knappen Teori.
* **Tegneserie.** Panelet har ingen løbende iagttagelser. Når Kₒ er beregnet og
  resterne er afleveret, låses knappen Tegneserie op. Hver iagttagelse bliver en
  rude med et udsnit af bordet, tegnet med de samme funktioner som scenen, og
  elevens egne tal. Sidste rude er resultatskemaet: masserne, temperaturen og Kₒ
  for hver måling, en graf med Kₒ som funktion af temperaturen, hvor den blå
  kurve er tabelværdierne og de gule punkter er elevens målinger, og en sætning
  med elevens Kₒ ved siden af tabelværdien ved samme temperatur. Var der spild,
  får det sin egen rude.
* **Quiz** med ti spørgsmål, låst op, når Kₒ er beregnet: ligevægtsskemaet,
  udtrykket for Kₒ, hvorfor de første krystaller giver Kₒ, Y større end Kₒ,
  enheden, to små beregninger og hvad temperaturen gør ved Kₒ.
* **Sikkerhed.** Resterne afleveres som tungmetalaffald. Tages bægerglasset op
  over 50 °C, skvulper der lidt ud, og det lander på varmepladen igen (se
  Påskeæggene).
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.

## Forenklinger

* Opløsningens volumen regnes som de 100 mL vand, og alt det afvejede stof
  regnes som opløst, når opløsningen er klar.
* Aktiviteter og ionstyrke er udeladt: Kₒ regnes med koncentrationer, som i
  Kemibogen B.
* Kₒ(T) er en eksponentiel tilpasning til tre tabelværdier for opløseligheden,
  ikke en målt kurve for Kₒ.
* Resterne kan afleveres, før Kₒ er beregnet. Forsøget er først slut, når begge
  dele er gjort.

## Påskeæggene

Læreren Kemichael kommer ind på scenen fra venstre. Figuren, kaffen og klik på
ham er fælles for superanimationerne og står i `../../kemichael/kemichael.js`.
Scenerne her står i `js/laerer.js`.

* **Spild.** Klikkes der hektisk på et stofglas, mens spatlen er i gang (mindst
  4 ekstra klik inden for 1,6 s), ryger pulveret ud over bordet. Læreren kommer
  med køkkenrulle og tørrer op. Anden gang skal der 6 klik til, og efter to uheld
  sker det ikke mere. Grænserne står i `SPILD` i `js/model.js`.
* **Varmt glas.** Klikkes der på dunken, mens bægerglasset er over 50 °C,
  tager eleven fat i det varme glas. Hånden rykker til, der skvulper lidt ud,
  og glasset lander på varmepladen igen. Læreren kommer med køkkenrulle
  ("Varmt glas ser ud præcis som koldt glas.") og peger på termometret.
  Uheldet får sin egen rude i tegneserien.
* **Det koger.** Har vandet kogt i 6 sekunder, kigger læreren ind fra kanten og
  siger til.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Ros**, når den første Kₒ er regnet rigtigt, afhængigt af om den passer med
  tabelværdien, og igen, hvis eleven vælger at lave tre målinger.
* **Glimt af Kemichaels baggrund** ved spildet og ved tre målinger på kurven og
  et regnskab over uheld, der følger browseren. Hvert glimt kommer én gang; se
  `../../kemichael/README.md`. I tegneserien er det Kemichael, der tørrer op.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om. Kemichael og
kaffekoppen ligger i `../../kemichael/sprites/`.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `glas_pbno32.svg` | brunt glas, GHS03, GHS05, GHS07, GHS08, GHS09 | åbning (29, 6); låget tegnes i koden |
| `glas_ki.svg` | hvid plastbeholder med KI | åbning (29, 6) |
| `vaegt.svg` | digital vægt | skålen y 5; display x 44-106, y 28-46 |
| `vejebaad.svg` | vejebåd | bundens midte (30, 16) |
| `spatel.svg` | skespatel | skeens midte (12, 6) |
| `maaleglas.svg` | måleglas 100 mL | åbning (22, 4); inderside i `S.MAALE_INDRE` |
| `baegerglas.svg` | bægerglas 250 mL | åbning (56, 4); inderside i `S.BAEGER_INDRE`, 0,46 i højden pr. mL |
| `varmeplade.svg` | varmeplade med magnetomrører | knapperne (52, 46) og (128, 46), lamperne (82, 38) og (158, 38) |
| `termometer.svg` | digitalt termometer | display x 8-56, y 17-41 |
| `affaldsdunk.svg` | tungmetalaffald, som i sc2.6 | åbning (45, 12) |
| `koekkenrulle.svg` | køkkenrulle til spildet, som i sc4.8 | midte (36, 22) |
| `lup.svg` | lup ved zoomboblens glas | linsens midte (15, 15) |

Væskerne, bundfaldet, krystallerne, kogeboblerne, dampen, pulveret, stativet med
føleren, ledningen, knapperne, displayene og zoomboblen tegnes i koden. Væskens
overflade er altid vandret, uanset hvordan glasset hælder: `NK.vaeskeNiveau` i
`kerne.js`. Ændres en sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, beregningsguide, tegneserie, teori og rundvisning
../../laboratoriet/ faelles for laboratorieforsoegene: kerne.js, rundvisning.js og grund.css
css/stil.css        kun det saerlige for forsoeget: maaleskema, beregning, guide. NB: decimaltal med PUNKTUM i CSS
js/model.js         kemien og tallene: opløselighed, Ko, masser, varme, graenser, elevens tal
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlaeser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): maal og tegning
js/mikro.js         ionerne og krystallen i zoomboblen
js/forsoeg.js       trinene, tilstanden, handlingerne, logbogen og tjekket af Ko
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        Kemichaels scener og paaskeaeggene
../../kemichael/    Kemichael: figuren og hans sprites, faelles for superanimationerne
js/graf.js          grafen med Ko som funktion af temperaturen
js/tegneserie.js    forsoeget som tegneserie med resultatskemaet til sidst
js/quiz.js          quizkortet og de ti spoergsmaal
js/tur.js           rundvisningens stop; selve rundvisningen ligger i ../../laboratoriet/
js/app.js           panel, kortet Beregning, guiden, knapper, tastatur, tegneloekke
_selvtest.html      udviklervaerktoej, indgaar ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: stofferne, reaktionsskemaerne (som
selvtesten tjekker for afstemning), molarmasserne, opløselighedskurven (`OPL`)
og Kₒ(T) (`ko`), spatelspidsen og afvejningens vinduer (`SPATEL`), varmepladen
(`VARME`), hvor hurtigt bundfaldet opløses og dannes (`BUNDFALD`) og farverne.
Alle formler med ladning bygges med `NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.
Forsøget er slut, når `erSlut()` er sand: Kₒ er beregnet, og resterne er
afleveret.

**Beregningen:** en måling (`maalinger` i `forsoeg.js`) har masserne, den
noterede temperatur og `Y`, reaktionsbrøken med alt stoffet opløst, som er det
rigtige svar. `tjekSvar` tjekker feltet i panelet, og guidens trin tjekkes i
`guideTjek` i `js/app.js`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`. Formatet står øverst i `../../kemichael/kemichael.js`.

**Tegneseriens ruder** står i `RUDER` i `js/tegneserie.js`: én funktion pr.
iagttagelse, der giver teksten og tegner et udsnit af bordet. Iagttagelserne
gemmes i `logbog` i `forsoeg.js` med glassets temperatur og masser, i den
rækkefølge de skete.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at skemaerne er afstemt, at opløseligheden og Kₒ
passer med tabelværdierne, at bundfaldet følger reaktionsbrøken, at elevens tal
læses rigtigt og de typiske fejl genkendes, at afvejningen kræver det rigtige
vindue, at de første krystaller kommer, når Y er lig med Kₒ, at kortet
Beregning og guidens fem trin virker med både forkerte og rigtige svar, at én
måling er nok, at de valgfri målinger ligger på kurven, at glasset skal køle af
før affald, at tegneserien først låses op, når Kₒ er beregnet og resterne
afleveret, at for meget stof ikke kan opløses i kogende vand, at spild og
læreren virker, og at der ikke er tankestreger eller 1+/1− i teksterne. Den
skal åbnes gennem en lokal server: Chrome nægter en side på `file://` at kigge
ind i sin egen iframe.

Genveje: <kbd>V</kbd> varme · <kbd>O</kbd> omrøring · <kbd>N</kbd> notér
temperatur · <kbd>I</kbd> hint · <kbd>S</kbd> tegneserie · <kbd>T</kbd> teori ·
<kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
