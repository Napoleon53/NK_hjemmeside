# sc2.7 Opløselighed af blyiodid

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig og henter kun filer inde fra sig
selv, så den kan flyttes uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c2.7_eksperiment_blynitrat.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c2.7_eksperiment_blynitrat_oldversion.html`.
Knappen i `samling_c2.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c2.7` og er derfor ikke berørt af flytningen.

## Hvad viser den

Eleven udfører forsøget på et laboratoriebord: 100 mL vand i et bægerglas på en
varmeplade med magnetomrører, Pb(NO₃)₂ og KI afvejet med spatel på en vægt, gult
bundfald, opvarmning til bundfaldet er væk, gyldne regn ved afkøling, tre
målinger med stigende mængde stof og til sidst tungmetalaffald.

Den gamle animation havde skydere for masser og temperatur og en graf med
reaktionsbrøk og opløselighedsprodukt. Kₒ hører ikke til C-niveau, så den nye
bruger opløselighed i g pr. 100 mL og en opløselighedskurve, som sc2.1. Det nye
er:

* **En rigtig opstilling** med brunt glas med Pb(NO₃)₂ og faresymboler, KI,
  digital vægt med vejebåd, spatel, måleglas, stativ med temperaturføler,
  varmeplade med to knapper, digitalt termometer og dunk til tungmetalaffald.
  Genstandene bruges ved at klikke på dem.
* **Afvejning med spatel.** Hvert klik på et glas er en spatelspids på ca.
  0,05 g. Et klik på vejebåden hælder stoffet i. KI skal have samme masse som
  Pb(NO₃)₂ (højst 0,02 g forskel); for meget tages af ved at klikke på spatlen.
  M(Pb(NO₃)₂) = 331,2 g/mol er næsten 2 · M(KI) = 332,0 g/mol, så samme masse
  giver forholdet 1 : 2. Der kan højst komme 0,30 g Pb(NO₃)₂ i alt.
* **Temperaturen styres af varmepladen.** Opvarmning ca. 2 °C pr. sekund,
  afkøling mod 20 °C, og pladen er varm lidt tid efter, at der er slukket. Vandet
  koger ved 100 °C. Tallene står i `VARME` i `js/model.js`.
* **Bundfaldet følger opløseligheden.** s(T) = 0,044 · e^(0,0223 · T) g pr.
  100 mL passer med tabelværdierne 0,044 g ved 0 °C, 0,069 g ved 20 °C og
  0,41 g ved 100 °C. Massen af PbI₂ regnes ud fra stoffet i underskud, og
  bundfaldet nærmer sig hele tiden max(0, m(PbI₂) − s(T)). Med omrøring hvirvler
  det rundt; uden lægger det sig, og nye krystaller daler glinsende ned.
* **Målinger.** Temperaturen noteres ved at klikke på termometret (eller
  knappen Notér temperatur), når bundfaldet er væk. Det kan kun lade sig gøre,
  når der har været bundfald siden sidste tilsætning, og det er forsvundet. Med
  0,10, 0,15 og 0,20 g af hvert stof bliver temperaturerne ca. 52, 70 og 83 °C.
  Tabellen og grafen i panelet viser målingerne; den blå kurve med
  tabelværdierne kommer frem ved tre målinger.
* **Zoomboblen er talt.** 0,05 g Pb(NO₃)₂ giver 1 Pb²⁺ og 2 NO₃⁻, 0,05 g KI
  giver 2 K⁺ og 2 I⁻. Krystallen nederst har lige så mange PbI₂-enheder, som der
  er bundfald til, lagdelt som I⁻, Pb²⁺, I⁻. Den sidste enhed forsvinder præcis,
  når bundfaldet i glasset er væk.
* **Forløb, hint og iagttagelser i panelet.** Trinene får flueben efter
  tilstanden. Hint giver en kort tekst til det aktuelle trin og markerer den
  genstand, det handler om. Der er ingen teori foran forsøget; den ligger bag
  knappen Teori.
* **Quiz** med ti spørgsmål, låst op ved tre målinger, blandt andet en
  beregning af m(PbI₂) og hvad et punkt på kurven betyder.
* **Sikkerhed.** Glasset kan først tømmes under 50 °C. Resterne afleveres som
  tungmetalaffald.

## Påskeæggene

Læreren kommer ind på scenen fra venstre. Alt står i `js/laerer.js`.

* **Spild.** Klikkes der hektisk på et stofglas, mens spatlen er i gang (mindst
  4 ekstra klik inden for 1,6 s), ryger pulveret ud over bordet. Læreren kommer
  med køkkenrulle og tørrer op. Anden gang skal der 6 klik til, og efter to uheld
  sker det ikke mere. Grænserne står i `SPILD` i `js/model.js`.
* **Det koger.** Har vandet kogt i 6 sekunder, siger læreren til.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Ros** ved tre målinger, afhængigt af om punkterne ligger på kurven.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om.

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
| `kaffekop.svg`, `koekkenrulle.svg`, `laerer_*.svg` | læreren og hans ting, som i sc6.8 | se `S.ANKER` |
| `lup.svg` | lup ved zoomboblens glas | linsens midte (15, 15) |

Væskerne, bundfaldet, krystallerne, kogeboblerne, dampen, pulveret, stativet med
føleren, ledningen, knapperne, displayene og zoomboblen tegnes i koden. Væskens
overflade er altid vandret, uanset hvordan glasset hælder: `NK.vaeskeNiveau` i
`kerne.js`. Ændres en sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, målinger, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, ion-notation, positurer, vaeskeniveau
js/model.js         kemien og tallene: opløselighed, masser, varme, grænser
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlaeser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): maal og tegning
js/mikro.js         ionerne og krystallen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        laereren og paaskeaeggene
js/graf.js          grafen i panelet
js/quiz.js          quizkortet og de ti spoergsmaal
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           panel, tabel, knapper, tastatur, tegneloekke
_selvtest.html      udviklervaerktoej, indgaar ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: stofferne, reaktionsskemaerne (som
selvtesten tjekker for afstemning), molarmasserne, opløselighedskurven (`OPL`),
spatelspidsen og grænserne (`SPATEL`), varmepladen (`VARME`), hvor hurtigt
bundfaldet opløses og dannes (`BUNDFALD`) og farverne. Alle formler med ladning
bygges med `NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at skemaerne er afstemt, at opløseligheden passer med
tabelværdierne, at rækkefølgen håndhæves, at forkert masse KI afvises og kan
rettes med spatlen, at bundfaldet forsvinder tæt på den beregnede temperatur, og
at krystallen i luppen følger med, at gyldne regn kommer ved afkøling, at tre
målinger ligger på kurven, at glasset skal køle af før affald, at for meget stof
ikke kan opløses i kogende vand, at spild og læreren virker, og at der ikke er
tankestreger eller 1+/1− i teksterne. Den skal åbnes gennem en lokal server:
Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: <kbd>V</kbd> varme · <kbd>O</kbd> omrøring · <kbd>N</kbd> notér
temperatur · <kbd>I</kbd> hint · <kbd>T</kbd> teori · <kbd>M</kbd> lyd ·
<kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
