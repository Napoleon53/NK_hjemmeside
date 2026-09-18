# sc6.8 Substitution i benzin

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../../kemichael/` og den fælles laboratoriekode i
`../../laboratoriet/`. Den skal derfor ligge i `superlab/`, der står ved
siden af de to mapper.

Den afløser `animationer/kemi-c-filer/c6.8_eksperiment_substitution.html`, som
nu ligger i `animationer/kemi-c-filer/arkiv/c6.8_eksperiment_substitution_oldversion.html`.
Knappen i `samling_c6.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c6.8` og er derfor ikke berørt af flytningen.

## Hvad viser den

Eleven udfører forsøget i et stinkskab: bromvand og hexan i to reagensglas,
prop i, ryst, det ene glas under en lampe og det andet i alufolie, vent, og
påvis HBr i vandfasen med pH-papir og AgNO₃. Til sidst hældes resterne i
dunken til halogenholdigt organisk affald. Kemien er den samme som i den gamle
animation. Det nye er:

* **En rigtig opstilling** med bromvand i brun flaske, hexan, stativ med to
  reagensglas, propper, lampe, alufolie, pH-papir, dråbeflaske og affaldsdunk.
  Genstandene bruges ved at klikke på dem, og de flyver selv hen og hælder,
  sætter prop i, pakker ind eller drypper.
* **To glas og et valg.** Eleven klikker på et glas for at vælge det (gult
  nummer). Flaskerne, propperne, lampen, folien, pH-papiret og dråbeflasken
  virker på det valgte glas. Kan det valgte glas ikke bruges, men det andet
  kan, bruges det andet, og det bliver valgt. Der er kun plads til ét glas
  under lampen, så det andet bliver kontrolforsøget. Et glas i folie kan
  hverken vælges eller tages fat i; folien tages af, når glasset testes med
  pH-papir eller AgNO₃.
* **Rystning og bæring med musen.** Eleven tager fat i et glas og bevæger
  musen. Det er musens fart, der tæller. Glasset følger musen frit, så det kan
  bæres hele vejen hen til lampen og slippes der, eller tilbage i stativet.
  Knappen **Ryst glasset** (eller tasten R) ryster det valgte glas, så længe
  den holdes nede. Uden rystning vandrer Br₂ kun langsomt op i hexanlaget.
* **Lys og tid.** Under lampen forsvinder farven i løbet af ca. 30 sekunder,
  mens væguret løber hurtigt. Lampen tændes og slukkes på kontakten på foden.
  Slukkes den, går reaktionen i stå. I folien sker der ingenting. Et glas, der
  bare står i stativet, blegner meget langsomt i lokalets lys. Tallene står i
  `LYS` i `js/model.js`.
* **Den store visning.** Første gang et glas stilles under lampen, fylder
  zoomboblen scenen med lampens skærm i toppen, og selve substitutionen kører
  lidt langsommere: fotoner (hν) spalter Br₂, det ene Br-atom sætter sig på et
  hexan i stedet for et H-atom, det andet tager H-atomet med sig som HBr, der
  synker ned i vandet og giver H₃O⁺ og Br⁻. Et klik lukker visningen, og et
  klik på den lille boble åbner den igen.
* **Zoomboblen følger det valgte glas.** Hexanlag og vandfase, Br₂ der vandrer
  op ved rystning, og Ag⁺ der finder Br⁻ og danner AgBr, som synker til bunds.
  Bundfaldet på scenen styres af, hvor mange AgBr der er dannet i boblen. I
  folien er boblen mørk.
* **pH-papir og AgNO₃ dråbe for dråbe.** Strimlen dyppes ned i vandfasen
  gennem hexanlaget og lægges bagefter på stativet. Hvert klik på dråbeflasken
  er én dråbe; der skal tre til. I glasset fra lyset bliver papiret rødt, og
  der kommer bundfald. I glasset fra mørket er papiret gult, og der sker
  ingenting.
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.
  Den huskes i `localStorage` under `nk-sc68-intro`.
* **Hint i panelet.** Hint giver en kort tekst til det aktuelle trin og markerer den
  genstand, det handler om. Der er ingen teori foran forsøget; den ligger bag
  knappen Teori.
* **Tegneserie.** Når resterne er hældt i dunken, låses knappen Tegneserie op.
  Den viser forsøget i ruder, tegnet med de samme funktioner som scenen og
  med elevens egne resultater: hvilket glas der stod i lys, pH-værdierne og
  bundfaldet. Sidste rude er resultatskemaet for de to glas. Var der et
  uheld, får det sin egen rude.
* **Quiz** med ti spørgsmål, låst op når begge glas er testet med pH-papir og
  AgNO₃.

## Påskeæggene

Læreren Kemichael står ikke i panelet, men kommer ind på scenen fra venstre.
Figuren og klik på ham er fælles for superanimationerne og står i
`../../kemichael/kemichael.js`. Scenerne her står i `js/laerer.js`.

* **Proppen springer af.** Rystes der **meget voldsomt** med musen i lidt tid,
  springer proppen af, og indholdet sprøjter ud over bordet. Læreren kommer
  med køkkenrulle, tørrer op og beder om, at glasset fyldes igen. Anden gang
  skal der rystes endnu voldsommere, og efter to uheld kan det ikke ske mere.
  Knappen Ryst glasset taber aldrig proppen. Grænserne står i `RYST` i
  `js/model.js`.
* **Rystning uden prop.** Et glas uden prop kan også tages fat i. Bæres det
  roligt, sker der intet, men rystes det, sprøjter indholdet ud. Læreren
  tørrer op ("Proppen virker bedst i glasset."), og glasset skal fyldes igen.
  Grænsen står i `RYST.SPILD_FART` og `RYST.SPILD_TID`.
* **Bromvand uden udsugning.** Bromvandet kan åbnes, og udsugningen kan
  slukkes, selv om der er brom fremme. Dampene kommer så ud i lokalet, og
  scenen får et rødbrunt slør. Efter 1,6 sekunder løber læreren ind og tænder
  udsugningen. Replikken skifter, hvis det sker igen.
* **Et særlig godt forsøg.** Ingen uheld, kontrolglasset pakket ind, før lyset
  var færdigt, og lampen højst slukket kort undervejs: så kommer læreren ind
  og dabber. Ellers roser læreren blot.
* **Lærerens kaffe.** Koppen på hylden. Læreren tager den med sig, fordi der
  ikke drikkes i laboratoriet, og drikker på vej ud.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Lampen tændt uden glas.** Efter 20 sekunder kommer læreren og slukker.
* **Glimt af Kemichaels baggrund** ved kaffen, dabben og lampen og et regnskab
  over uheld, der følger browseren. Hvert glimt kommer én gang; se
  `../../kemichael/README.md`.
* **Uret.** Et klik på væguret får tiden til at gå fire gange hurtigere i 12
  sekunder. Et klik til stopper det.
* **Hex-1-en.** Flasken står ved siden af hexan og er ikke en del af forsøget.
  Hældes den i et glas med bromvand, og der rystes, forsvinder farven på få
  sekunder, også uden lys: Br₂ lægges til dobbeltbindingen (en addition), og
  der dannes hverken HBr eller bromid. Læreren påtaler, at det ikke hører til
  forsøget. pH-papir og AgNO₃ kan prøves i glasset, og det tømmes i dunken, så
  det kan bruges igen. Reaktionen står i `ADDITION` i `js/model.js`.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om. Kemichael og
kaffekoppen ligger i `../../kemichael/sprites/`.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `flaske_bromvand.svg`, `skruelaag.svg` | brun flaske med bromvand, GHS05, GHS06, GHS09, og låg | åbning (40, 4); lågets bund (17, 22) |
| `flaske_hexan.svg`, `flaske_hexen.svg` | hexan og hex-1-en med GHS02, GHS07, GHS08, GHS09 | åbningen (23, 4); låget tegnes i koden |
| `reagensglas.svg` | reagensglas | åbning (15, 2); inderside i `S.GLAS_INDRE` |
| `stativ.svg` | træstativ til to glas | huller ved x 45 og 105; tegnes efter glassene |
| `prop_lille.svg` | gummiprop til reagensglas | bunden (13, 26) |
| `lampe.svg` | arbejdslampe på arm | fodens midte (165, 296); lyset fra (70, 100); kontakten om (190, 282) |
| `alufolie.svg` | rulle alufolie | midten (38, 22); folien om glasset tegnes i koden |
| `phpapir.svg` | æske med pH-papir og farveskala | strimlen tages ved (60, 20) |
| `draabeflaske_agno3.svg` | dråbeflaske med sølvnitrat | spids (23, 0) |
| `affaldsdunk.svg` | halogenholdigt organisk affald, GHS02, GHS09 | åbning (45, 12) |
| `kontrolpanel.svg` | stinkskabets panel | vinger, lampe, display og kontakt tegnes i `scene.js` |
| `koekkenrulle.svg` | køkkenrulle til pytten | midte (36, 22) |
| `haand.svg`, `lup.svg` | handske og lup, som i sc2.6 | grebet (40, 46) |

Væsker, strålen, dråber, bromdampe, pytten, pH-strimlerne, holderen under
lampen, lyskeglen, uret, den store visnings lampeskærm og zoomboblen
tegnes i koden. Væskens overflade er altid vandret, uanset hvordan glasset
hælder: `NK.vaeskeNiveau` i `kerne.js` finder den højde, hvor netop væskens
areal ligger under overfladen. Ændres en sprite, skal tallene i `scene.js`
passe.

## Filer

```
index.html          markup: scene, panel, resultater, tegneserie, teori og rundvisning
../../laboratoriet/ faelles for laboratorieforsoegene: kerne.js, rundvisning.js og grund.css
css/stil.css        kun det saerlige for forsoeget: resultatskemaet. NB: decimaltal med PUNKTUM i CSS
js/model.js         kemien og tallene: fordeling, lys, pH, farver, rystning
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlaeser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): maal, stinkskab, glas, lampe
js/mikro.js         partikelmodellen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet, den store visning og musen
js/laerer.js        Kemichaels scener: kaffe, uheld, ros, dab, lampen, hexen
../../kemichael/    Kemichael: figuren og hans sprites, faelles for superanimationerne
js/tegneserie.js    forsoeget som tegneserie med resultatskemaet med resultatskemaet
js/quiz.js          quizkortet og de ti spoergsmaal
js/tur.js           rundvisningens stop; selve rundvisningen ligger i ../../laboratoriet/
js/app.js           panel, resultater, knapper, tastatur, tegneloekke
_selvtest.html      udviklervaerktoej, indgaar ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: stofferne, reaktionsskemaerne
(som selvtesten tjekker for afstemning), lysets styrke under lampen, i lokalet
og i folien (`LYS`), fordelingen mellem vand og hexan (`FORDELING`), pH ud fra
omsætningen, uret (`UR`), hvad der tæller som et særlig godt forsøg (`FLOT`)
og farverne. Alle formler med ladning bygges med `NK.ladningHaevet`, så ±1
skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`. Formatet står øverst i `../../kemichael/kemichael.js`.

**Tegneseriens ruder** står i `js/tegneserie.js`: hver rude er en tegnefunktion
og en tekst, som bygges af elevens resultater.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at skemaerne er afstemt, at modellen giver fordeling
ved rystning, reaktion i lys og ingen i folie, at rækkefølgen håndhæves, at
glasset kan bæres til lampen og tilbage, at den store visning åbner og lukker,
at et glas i folie ikke kan røres, at begge tests giver de rigtige resultater i
begge glas, at tegneserien låses op til sidst, at læreren dabber efter et
særlig godt forsøg, at almindelig rystning med musen ikke taber proppen, at
meget voldsom rystning gør, at bromvand uden udsugning får læreren til at
tænde den, at rystning uden prop spilder indholdet, at kaffen, uret og lampen virker, at hex-1-en giver en addition uden lys, og at der
ikke er tankestreger eller 1+/1− i teksterne. Den skal åbnes gennem en lokal
server: Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: hold <kbd>R</kbd> ryst · <kbd>U</kbd> udsugning · <kbd>I</kbd> hint ·
<kbd>S</kbd> tegneserie · <kbd>T</kbd> teori · <kbd>M</kbd> lyd ·
<kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
