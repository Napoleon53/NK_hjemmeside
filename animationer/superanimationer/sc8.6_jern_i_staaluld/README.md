# sc8.6 Jern i ståluld

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../kemichael/`. Den skal derfor ligge ved siden af den mappe.

Den afløser `animationer/kemi-c-filer/c8.6_redox_titrering_jernindhold.html`,
som nu ligger i
`animationer/kemi-c-filer/arkiv/c8.6_redox_titrering_jernindhold_oldversion.html`.
Knappen i `samling_c8.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c8.6` og er derfor ikke berørt af flytningen.

## Hvad viser den

Eleven bestemmer jernindholdet i ståluld, som i laboratoriet: afvej ca. 0,1 g
ståluld, opløs den i syre på varmepladen, fyld buretten med 0,0200 M
kaliumpermanganat, aflæs den, titrer til en svag, blivende lyserød farve, aflæs
igen og beregn jernindholdet i procent. Resultatet sammenlignes med, at ståluld
typisk er 98,5 % jern.

* **En rigtig opstilling.** Et åbent laboratoriebord med ståluld og vægt, et
  stinkskab med svovlsyre, saltsyre, kolbe og varmeplade, og en titreropstilling
  med stativ, buret, hvid flise, affaldsbæger og flasken med KMnO₄. Genstandene
  bruges ved at klikke på dem eller trække dem derhen, hvor de skal bruges.
* **Eleven vælger syren.** Der er ingen forklaring før valget. Med svovlsyre
  bliver resultatet omkring 98,5 %. Med saltsyre oxiderer permanganat også
  chlorid: der bruges for meget KMnO₄, den lyserøde farve forsvinder igen, og
  resultatet bliver over 100 %.
* **Opløsningen kræver varme.** I kold syre opløses stålulden meget langsomt.
  På varmepladen tager det ca. 8 sekunder. Stilles kolben under buretten, før
  alt er opløst, bliver resultatet for lavt.
* **Buretten.** Når den fyldes, står menisken lidt over nulstregen. Eleven
  nulstiller den: hanen åbnes, og før startaflæsningen løber den langsomt
  (`BURET.nulFlow`). Lukkes hanen mindre end `BURET.fang` mL fra nulstregen,
  lægger menisken sig på 0,00. Lidt forbi 0 er også i orden. Zoomboblen viser
  skalaen, mens hanen er åben under nulstillingen, og tre sekunder efter, at
  den er lukket. En åben hane kan
  altid lukkes, også mens en animation eller Kemichael kører. Aflæsningen har
  sidste ciffer 0 eller 5. Fyldes en fuld buret igen, løber den over.
* **Titreringen.** Hanen åbnes og lukkes med et klik, knappen **Dråbe** (tasten D)
  giver én dråbe, og kolben rystes ved at tage fat i den og bevæge musen eller
  ved at holde knappen **Ryst** (tasten R) nede. Hver dråbe lander som en lilla
  sky. Så længe der er meget Fe²⁺, forsvinder skyen straks; tæt på endepunktet
  bliver den hængende, især uden rystning. Endepunktet er nået, når farven har
  holdt i 2,5 sekunder. Modellen står i `js/model.js`.
* **Zoomboblen følger indholdet.** Jernatomer i et metalgitter, syren der
  oxiderer jernet til Fe²⁺ og danner H₂, MnO₄⁻ der tager én elektron fra hver af
  fem Fe²⁺ og bliver til Mn²⁺, overskud af MnO₄⁻ ved endepunktet, Cl₂ i saltsyre,
  og burettens skala tæt på, når den skal aflæses.
* **Fri leg.** Træk og hæld udføres altid, også når det er forkert: syre før
  stålulden, to syrer, KMnO₄ direkte i kolben, kolben under buretten før
  nulstillingen, hanen åben efter startaflæsningen, buretten fyldt op midt i
  titreringen eller en aflæsning før endepunktet. Kun det, der fysisk ikke kan
  lade sig gøre, afvises: en fuld vejebåd eller kolbe og en menisk over
  nulstregen. Et klik uden en bestemt betydning giver en kort vejledning.
  Kemichael lader fejlen ske og kommenterer den (`BEMAERK` i `js/laerer.js`),
  ofte med et vink om at starte et nyt forsøg. Buretten kan aflæses igen, så
  længe jernindholdet ikke er beregnet.
* **Tegneserie.** Når jernindholdet er beregnet, låses knappen Tegneserie op.
  Ruderne viser forsøget med elevens egne tal, én rød rude for hver fejl
  undervejs og til sidst resultatskemaet med alle forsøg (`js/tegneserie.js`).
* **Beregning.** Massen og aflæsningerne skrives ind i skemaet i panelet.
  Eleven skriver selv jernindholdet. Et forkert svar giver et hint, der passer
  til fejlen: brøkdel i stedet for procent, massen i gram, slutaflæsningen i
  stedet for det forbrugte volumen, glemt faktor 5, divideret med 5, mL i stedet
  for L, eller divisionen vendt om.
* **Hjælp til beregningen.** Knappen åbner en guide i fem trin: forbrugt volumen,
  n(MnO₄⁻), n(Fe²⁺), m(Fe) og jernindholdet. Hvert trin tjekkes mod elevens eget
  svar i trinnet før, og små tal kan skrives som 0,000356 eller 3,56·10^-4.
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.
* **Flere forsøg.** Nyt forsøg starter forfra. Tidligere resultater bliver
  stående, så forsøgene kan sammenlignes.
* **Quiz** med ti spørgsmål, låst op når jernindholdet er beregnet i et forsøg
  med svovlsyre.

## Påskeæggene

Læreren Kemichael er fælles for superanimationerne og står i
`../kemichael/kemichael.js`. Scenerne her står i `js/laerer.js`.

* **Lærerens kaffe.** Koppen på hylden.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Kolben rystes voldsomt** med musen (`RYST.amok` og `RYST.amokTid` i
  `js/model.js`): noget skvulper ud, og læreren kommer ("Det er en titrerkolbe.
  Ikke en cocktailshaker."). Replikkerne skifter. Knappen Ryst kalder aldrig på
  læreren.
* **Buretten løber over.** Fyldes den, mens den er fuld, kommer læreren og peger
  på regel 3 på plakaten. Pletten på bordet bliver stående resten af sessionen.
* **Syre på vægten.** Syreflaskerne kan også slippes over vægten. Så løber
  syren ud over vejeskålen, og læreren tørrer op ("Vægten er ikke et
  bægerglas."). Vægten markeres ikke som mål, mens en flaske trækkes.
* **Langt forbi endepunktet** (`TITRER.aubergine`): "Svagt lyserød. Ikke
  aubergine."
* **Over 100 %.** Læreren er skeptisk, og tredje gang kommer et lille vink om
  syren.
* **Et godt resultat.** Ligger et resultat med svovlsyre mellem 96 og 100,5 %,
  siger læreren "Rustfrit."
* **Glimt af Kemichaels baggrund** ved rystningen, auberginen og rosen og et
  regnskab over uheld, der følger browseren. Hvert glimt kommer én gang; se
  `../kemichael/README.md`.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om. Kemichael og
kaffekoppen ligger i `../kemichael/sprites/`.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `staaluld.svg` | en pude ståluld på papir | bundens midte (45, 50) |
| `vaegt.svg` | digital vægt, d = 0,001 g | vejeskålen y 0, displayet x 22 til 92 og y 30 til 50 |
| `vejebaad.svg` | vejebåd | bundens midte (32, 14) |
| `kolbe.svg` | konisk kolbe 250 mL, som i sc2.6, tegnet 96 x 128 | åbningen (48, 2,5); inderside i `S.KOLBE_INDRE` |
| `baegerglas.svg` | affaldsbægeret | tuden (68, 3); inderside i `S.BAEGER_INDRE` |
| `flaske_svovlsyre.svg`, `flaske_saltsyre.svg` | 1 M H₂SO₄ med GHS07, 2 M HCl med GHS05 | åbningen (23, 4); låget tegnes i koden |
| `flaske_kmno4.svg` | brun flaske med 0,0200 M KMnO₄ | åbningen (23, 4) |
| `varmeplade.svg` | varmeplade | displayet x 10 til 40, lampen (52, 20) |
| `haand.svg`, `lup.svg` | handske og lup | grebet (40, 46) |

Buretten, stativet, flisen, væsker, ståluld i vejebåden og kolben, bobler,
dråber, den lilla sky, dampe, pletten, lokalet, stinkskabet, lærerens ansigt og
zoomboblen tegnes i koden. Ændres en sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, beregning, intro, tegneserie, guide, teori, rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, ion-notation, positurer, væskeniveau
js/model.js         kemien og tallene: opløsning, titrering, farve, beregning, hints
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlæser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): mål, lokalet, udstyr, buret, væsker
js/mikro.js         partikelmodellen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        Kemichaels scener, bemærkningerne om fejl og påskeæggene
js/tegneserie.js    tegneserien med fejlruder og resultatskemaet
../kemichael/       Kemichael: figuren og hans sprites, fælles for superanimationerne
js/quiz.js          quizkortet og de ti spørgsmål
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           panel, måleskema, guiden, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: jernindholdet i stålulden
(`STAALULD`), afvejningen (`AFVEJ`), syrerne (`SYRER`), opløsningens fart
(`OPLOES`), buretten (`BURET`), blanding og endepunkt (`TITRER`), chloridets
bivirkning (`KLOR`), rystningen (`RYST`) og tjekket af elevens svar.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.
**Fejlene** noteres med `iagttag(noegle, bemaerk)`; nøglerne står i en kommentar
under `TRIN`. Kemichaels replik til hver står i `BEMAERK` i `js/laerer.js`, og
rudens tekst og tegning i `FEJL` i `js/tegneserie.js`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`. Formatet står øverst i `../kemichael/kemichael.js`.

**Guiden** til beregningen står i `js/app.js` (`aabnGuide`, `guideTjek`) med
tolerancer og hints for hvert af de fem trin.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at modellen giver de forventede resultater, at
buretten er let at nulstille, at forkerte handlinger udføres og noteres, at
svovlsyre giver ca. 98,5 % og saltsyre over 103 %, at tegneserien bygges med
de rigtige fejlruder og resultatskemaet, at beregningen og guiden
godtager de rigtige svar og giver de rigtige hints, at zoomboblen tæller rigtigt,
at påskeæggene kan gennemføres, at scenen kan tegnes i alle faser, og at der
ikke er tankestreger eller 1+/1− i teksterne. Den skal åbnes gennem en lokal
server: Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: hold <kbd>R</kbd> ryst · <kbd>D</kbd> dråbe · <kbd>O</kbd> åbn og luk
hanen · <kbd>I</kbd> hint · <kbd>N</kbd> nyt forsøg · <kbd>S</kbd> tegneserie · <kbd>T</kbd> teori ·
<kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
