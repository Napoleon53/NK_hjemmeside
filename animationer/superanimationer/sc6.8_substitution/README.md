# sc6.8 Substitution i benzin

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig og henter kun filer inde fra sig
selv, så den kan flyttes uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c6.8_eksperiment_substitution.html`, som
nu ligger i `animationer/kemi-c-filer/arkiv/c6.8_eksperiment_substitution_oldversion.html`.
Knappen i `samling_c6.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c6.8` og er derfor ikke berørt af flytningen.

## Hvad viser den

Eleven udfører forsøget i et stinkskab: bromvand og hexan i to reagensglas,
prop i, ryst, det ene glas under en lampe og det andet i alufolie, vent, og
påvis HBr i vandfasen med pH-papir og AgNO₃. Kemien er den samme som i den
gamle animation. Det nye er:

* **En rigtig opstilling** med bromvand i brun flaske, hexan, stativ med to
  reagensglas, propper, lampe, alufolie, pH-papir, dråbeflaske og dunk til
  halogenholdigt organisk affald. Genstandene bruges ved at klikke på dem,
  og de flyver selv hen og hælder, sætter prop i, pakker ind eller drypper.
* **To glas og et valg.** Eleven klikker på et glas for at vælge det (gult
  nummer). Flaskerne, propperne, lampen, folien, pH-papiret og dråbeflasken
  virker på det valgte glas. Kan det valgte glas ikke bruges, men det andet
  kan, bruges det andet, og det bliver valgt. Der er kun plads til ét glas
  under lampen, så det andet bliver kontrolforsøget.
* **Rystning med musen.** Eleven tager fat i et glas og bevæger musen. Det er
  musens fart, der tæller. Knappen **Ryst glasset** (eller tasten R) gør det
  samme, så længe den holdes nede. Uden rystning vandrer Br₂ kun langsomt op i
  hexanlaget.
* **Lys og tid.** Under lampen forsvinder farven i løbet af ca. 25 sekunder,
  mens væguret løber hurtigt. Slukkes lampen, går reaktionen i stå. I folien
  sker der ingenting. Et glas, der bare står i stativet, blegner meget langsomt
  i lokalets lys. Tallene står i `LYS` i `js/model.js`.
* **Zoomboblen følger det valgte glas.** Hexanlaget øverst og vandfasen
  nederst. Br₂ vandrer op over grænsefladen, når der rystes. I lys kommer
  fotoner (hν) oppefra: et Br₂ spaltes, det ene Br-atom sætter sig på et
  hexan i stedet for et H-atom, og det andet tager H-atomet med sig som HBr,
  der synker ned i vandet og giver H₃O⁺ og Br⁻. Ag⁺ finder Br⁻ og danner
  AgBr, der synker til bunds. Bundfaldet på scenen styres af, hvor mange AgBr
  der er dannet i boblen. I folien er boblen mørk.
* **pH-papir og AgNO₃ dråbe for dråbe.** Strimlen dyppes ned i vandfasen
  gennem hexanlaget og lægges bagefter på stativet. Hvert klik på dråbeflasken
  er én dråbe; der skal tre til. I glasset fra lyset bliver papiret rødt, og
  der kommer bundfald. I glasset fra mørket er papiret gult, og der sker
  ingenting.
* **Resultater, iagttagelser og hint i panelet.** Resultaterne for de to glas
  står ved siden af hinanden, så de kan sammenlignes. Det, eleven ser, skrives
  som iagttagelser med en farveprøve. Hint giver en kort tekst til det aktuelle
  trin og markerer den genstand, det handler om. Der er ingen teori foran
  forsøget; den ligger bag knappen Teori.
* **Quiz** med ti spørgsmål, låst op når begge glas er testet med pH-papir og
  AgNO₃.

## Påskeæggene

Læreren står ikke i panelet, men kommer ind på scenen fra venstre. Hovedet er
et sprite uden ansigt; øjne, bryn, mund og rødme tegnes i koden. Alt står i
`js/laerer.js`.

* **Proppen springer af.** Rystes der **meget voldsomt** med musen i lidt tid,
  springer proppen af, og indholdet sprøjter ud over bordet. Læreren kommer
  med køkkenrulle, tørrer op og beder om, at glasset fyldes igen. Anden gang
  skal der rystes endnu voldsommere, og efter to uheld kan det ikke ske mere.
  Knappen Ryst glasset taber aldrig proppen. Grænserne står i `RYST` i
  `js/model.js`.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Et rigtigt kontrolforsøg.** Når begge glas er testet, kommer læreren og
  roser.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `flaske_bromvand.svg`, `skruelaag.svg` | brun flaske med bromvand, GHS05, GHS06, GHS09, og låg | åbning (40, 4); lågets bund (17, 22) |
| `flaske_hexan.svg` | hexan med GHS02, GHS07, GHS08, GHS09 | åbningen (23, 4); låget tegnes i koden |
| `reagensglas.svg` | reagensglas | åbning (15, 2); inderside i `S.GLAS_INDRE` |
| `stativ.svg` | træstativ til to glas | huller ved x 45 og 105; tegnes efter glassene |
| `prop_lille.svg` | gummiprop til reagensglas | bunden (13, 26) |
| `lampe.svg` | arbejdslampe på arm | fodens midte (165, 296); lyset fra (70, 100) |
| `alufolie.svg` | rulle alufolie | midten (38, 22); folien om glasset tegnes i koden |
| `phpapir.svg` | æske med pH-papir og farveskala | strimlen tages ved (60, 20) |
| `draabeflaske_agno3.svg` | dråbeflaske med sølvnitrat | spids (23, 0) |
| `affaldsdunk.svg` | halogenholdigt organisk affald, GHS02, GHS09 | åbning (45, 12) |
| `kontrolpanel.svg` | stinkskabets panel | vinger, lampe, display og kontakt tegnes i `scene.js` |
| `kaffekop.svg` | lærerens kop | bunden (18, 40) |
| `koekkenrulle.svg` | køkkenrulle til pytten | midte (36, 22) |
| `laerer_krop.svg`, `laerer_hoved.svg`, `laerer_arm.svg` | læreren | halsen (110, 18) og (55, 126); skulderen (28, 142) |
| `haand.svg`, `lup.svg` | handske og lup, som i sc2.6 | grebet (40, 46) |

Væsker, strålen, dråber, bromdampe, pytten, pH-strimlerne, holderen under
lampen, lyskeglen, uret og zoomboblen tegnes i koden. Væskens overflade er
altid vandret, uanset hvordan glasset hælder: `NK.vaeskeNiveau` i `kerne.js`
finder den højde, hvor netop væskens areal ligger under overfladen. Ændres en
sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, resultater, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, ion-notation, positurer, vaeskeniveau
js/model.js         kemien og tallene: fordeling, lys, pH, farver, rystning
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlaeser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): maal, stinkskab, glas, lampe
js/mikro.js         partikelmodellen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        laereren og paaskeaeggene
js/quiz.js          quizkortet og de ti spoergsmaal
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           panel, resultater, knapper, tastatur, tegneloekke
_selvtest.html      udviklervaerktoej, indgaar ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: stofferne, reaktionsskemaerne
(som selvtesten tjekker for afstemning), lysets styrke under lampen, i lokalet
og i folien (`LYS`), fordelingen mellem vand og hexan (`FORDELING`), pH ud fra
omsætningen og farverne. Alle formler med ladning bygges med
`NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at skemaerne er afstemt, at modellen giver fordeling
ved rystning, reaktion i lys og ingen i folie, at rækkefølgen håndhæves, at
lampen kun har plads til ét glas, at begge tests giver de rigtige resultater i
begge glas, at quizzen låses op, at almindelig rystning med musen ikke taber
proppen, at meget voldsom rystning gør, at anden gang kræver mere, at læreren
tørrer op, og at der ikke er tankestreger eller 1+/1− i teksterne. Den skal
åbnes gennem en lokal server: Chrome nægter en side på `file://` at kigge ind i
sin egen iframe.

Genveje: hold <kbd>R</kbd> ryst · <kbd>U</kbd> udsugning · <kbd>I</kbd> hint ·
<kbd>T</kbd> teori · <kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.
