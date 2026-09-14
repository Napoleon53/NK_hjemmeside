# sc6.9 Fedt i chips

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig og henter kun filer inde fra sig
selv, så den kan flyttes uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c6.9_eksperiment_fedtchips.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c6.9_eksperiment_fedtchips_oldversion.html`.
Knapperne i `samling_c6.html` og `samling_NV.html` peger direkte på denne
`index.html`. Delte links går via `samling_alt.html?emne=c6.9` og er derfor ikke
berørt af flytningen.

## Hvad viser den

Eleven bestemmer fedtindholdet i chips, som i laboratoriet: afvej ca. 5 g chips,
knus dem i en morter, tilsæt et opløsningsmiddel, rør rundt, vej en tom
petriskål, filtrer ned i den, inddamp, vej skålen igen og beregn fedtindholdet i
procent. Resultatet sammenlignes med varedeklarationen på posen (34 g fedt pr.
100 g).

* **En rigtig opstilling.** Et åbent laboratoriebord med chipspose, vægt,
  petriskål og morter, og et stinkskab med bunsenbrænder på trefod, vand,
  heptan, bægerglas, filtrering og varmeplade. Genstandene bruges ved at klikke
  på dem, og de flyver selv hen og hælder, filtrerer eller stiller sig på vægten.
* **Træk med musen.** Flaskerne skal trækkes hen over bægerglasset (eller
  tragten, for at skylle filteret); et klik giver kun en besked. Vejebåden,
  bægerglasset og petriskålen kan også trækkes derhen, hvor de skal bruges,
  men kan stadig klikkes. Mens en genstand holdes, markeres målet under den, og
  slippes den et forkert sted, flyver den tilbage.
* **Knusning og røring med musen.** Eleven tager fat i pistillen eller
  glasstaven og bevæger musen. Knappen **Knus** eller **Rør rundt** (tasten R)
  gør det samme, så længe den holdes nede. Knuses der meget voldsomt, springer
  krummer ud af morteren, og de er tabt.
* **Eleven vælger opløsningsmidlet.** Der er ingen forklaring før valget. Med
  vand bliver fedtet i chipsene, og kun saltet opløses; resultatet er omkring
  1 %. Med heptan opløses fedtet.
* **To varmekilder.** Petriskålen kan trækkes hen på varmepladen (eller klik på
  skålen) eller på trefoden over bunsenbrænderen (eller klik på trefoden). Brænderen tændes og
  slukkes ved at klikke på den eller på gashanen. Vand kan inddampes over
  brænderen; heptan antændes (se påskeæggene). Står skålen over en tændt
  brænder, skal brænderen slukkes, før skålen kan køle af og vejes.
* **Tallene afhænger af, hvordan forsøget udføres.** Hvor godt chipsene er
  knust, hvor længe der er rørt, og om filteret skylles med lidt mere
  opløsningsmiddel (træk flasken hen over tragten efter filtreringen), giver forskellige
  resultater. Uden skylning bliver resultatet ca. 29 %, med skylning ca. 32 %.
  Modellen står i `js/model.js`.
* **Zoomboblen følger indholdet.** Chipsstykker af stivelseskæder med
  fedtstofmolekyler imellem, heptan der omgiver fedtet og trækker det ud, vand
  der holder sammen med sig selv og opløser Na⁺ og Cl⁻, filtrerpapirets porer,
  og opløsningsmidlet der forlader overfladen ved inddampningen.
* **Iagttagelser er fejlkilder.** Kun det, der kan forklare et resultat, bliver
  noteret: krummer der sprang ud af morteren, delvist knuste chips, en blanding
  der blev filtreret før den var rørt færdig, og våde chipsrester i filteret
  (når der ikke er skyllet). Listen hører til det aktuelle forsøg og ryddes ved
  nyt forsøg.
* **Måleskema og beregning.** Vejningerne skrives ind i skemaet. Eleven skriver
  selv fedtindholdet. Et forkert svar giver et hint, der passer til fejlen:
  massen af fedtet i gram, en brøkdel i stedet for procent, skålen er ikke
  trukket fra, eller divisionen er vendt om.
* **Hjælp til beregningen.** Når de ni første trin er gjort, vises knappen
  **Hjælp til beregningen**. Den åbner en guide i tre trin: massen af fedtet,
  fedtets andel af chipsene (med mindst tre decimaler) og fedtindholdet i
  procent. Hvert trin tjekkes, før det næste låses op, og et forkert svar giver
  et hint. Til sidst skrives svaret ind i måleskemaet.
* **Flere forsøg.** Nyt forsøg starter forfra med nye chips. Tidligere
  resultater bliver stående, så forsøgene kan sammenlignes.
* **Quiz** med ti spørgsmål, låst op når fedtindholdet er beregnet i et forsøg
  med heptan.

## Påskeæggene

Læreren kommer ind på scenen fra venstre. Hovedet er et sprite uden ansigt;
øjne, bryn, mund, rødme og et skeptisk løftet bryn tegnes i koden, så udtrykket
kan skifte. Armen drejer om skulderen. Alt står i `js/laerer.js`.

* **Chips spises.** Klikkes der på posen, når chipsene er afvejet, tager en
  hånd en chip. Tredje gang kommer læreren med en løftet pegefinger, og regel 2
  på plakaten lyser. Sjette gang tager læreren posen med. Den er tilbage ved
  næste forsøg.
* **Amok med morteren.** Bliver eleven ved med at knuse ekstremt voldsomt med
  musen (`KNUS.amok` og `KNUS.amokTid` i `js/model.js`), kommer læreren og er
  sarkastisk ("Det er en morter. Ikke et trommesæt."). Replikkerne skifter fra
  gang til gang. Knappen Knus kalder aldrig på læreren.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Vandflasken.** Holdes vandflasken i mere end 1 sekund, kigger læreren ind:
  "Jeg håber ikke, at du har tænkt dig at hælde det i tragten." Én gang pr.
  forsøg. Slippes vandet så alligevel over tragten (uden at det er en skylning
  med vand), svarer læreren igen.
* **Salt.** Når vand er inddampet, og der kun er salt tilbage, kommer læreren
  med en sarkastisk bemærkning. Replikkerne skifter fra gang til gang.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Heptan over bunsenbrænderen.** Står heptanfiltratet over en tændt brænder,
  antændes dampene efter lidt tid (`BRAND.tid`). Røgalarmen hyler, læreren
  løber ind, kaster et brandtæppe over ("Heptan og åben ild? Heller ikke i et
  stinkskab.") og konfiskerer brænderen resten af sessionen. Der er sod på
  stinkskabets bagvæg, og forsøget skal startes forfra.
* **Et godt resultat.** Ligger et resultat med heptan højst 3 procentpoint
  under varedeklarationen, siger læreren "Fedt."

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `pose.svg` | chipspose med opdigtet mærke og varedeklaration | åbningen (50, 14) |
| `vaegt.svg` | digital vægt | vejeskålen y 0, displayet x 22 til 92 og y 30 til 50 |
| `vejebaad.svg` | vejebåd | bundens midte (32, 14) |
| `chip.svg`, `chipstykke.svg` | én chip og et stykke | midten (17, 13) og (9, 7) |
| `morter.svg`, `pistil.svg` | morter og pistil | bunden (50, 56); pistillens hoved (11, 92) |
| `baegerglas.svg` | bægerglas 250 mL | tuden (68, 3); inderside i `S.BAEGER_INDRE` |
| `petriskaal.svg` | petriskål i glas | bundens midte (40, 21); bunden er en ellipse om (40, 16) |
| `flaske_heptan.svg` | heptan med GHS02, GHS07, GHS08, GHS09 | åbningen (23, 4); låget tegnes i koden |
| `sproejteflaske.svg` | sprøjteflaske med vand | tudens spids (44, 9) |
| `tragt.svg`, `filterstativ.svg` | glastragt og stativ med ring | stilkens spids (38, 108); ringen (58, 130) |
| `trefod.svg`, `braender.svg` | trefod med trådnet og bunsenbrænder | nettets midte (35, 0) |
| `varmeplade.svg` | varmeplade | displayet x 10 til 40, lampen (52, 20) |
| `kaffekop.svg` | lærerens kop | bunden (18, 40) |
| `laerer_krop.svg`, `laerer_hoved.svg`, `laerer_arm.svg` | læreren | halsen (110, 18) og (55, 126); skulderen (28, 142) |
| `brandtaeppe.svg` | brandtæppe | toppen (75, 6) |
| `haand.svg`, `lup.svg` | handske og lup, som i sc2.6 | grebet (40, 46) |

Væsker, indholdet i petriskålen, filtrerpapir, stråler, dråber, dampe, krummer,
flammer, ild, røg, gashanen, lokalet, stinkskabet, lærerens ansigt og zoomboblen
tegnes i koden. Ændres en sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, måleskema, guide, teori, rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, ion-notation, positurer, væskeniveau
js/model.js         kemien og tallene: ekstraktion, filter, beregning, hints
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlæser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): mål, lokalet, udstyr, væsker
js/mikro.js         partikelmodellen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        læreren, påskeæggene og branden
js/quiz.js          quizkortet og de ti spørgsmål
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           panel, måleskema, guiden, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: chipsenes indhold (`CHIPS`),
opløsningsmidlerne (`MIDLER`), knusning og amok-grænsen (`KNUS`), røring,
filterets tilbageholdelse, petriskålens masse (`SKAAL`) og tjekket af elevens
svar.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.
**Iagttagelserne** står i `IAGTTAGELSER` samme sted. **Trækzonerne** står i
`MAAL`, `NK.TRAEKREKT` og `MULIGE` i `js/forsoeg.js`; hvad der sker, når noget
slippes, afgøres i `slipTil`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`.

**Guiden** til beregningen står i `js/app.js` (`aabnGuide`, `guideTjek`) med
tolerancer og hints for hvert af de tre trin.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at modellen giver de forventede resultater, at
rækkefølgen håndhæves, at heptan giver et resultat tæt på varedeklarationen og
vand omkring 1 %, at skylning hæver resultatet, at iagttagelserne kun er
fejlkilder og ryddes ved nyt forsøg, at beregningen og guiden godtager de rigtige
svar og giver de rigtige hints, at brænderen kan tændes og bruges til vand, at
heptan over flammen antændes, at påskeæggene kan gennemføres, og at der ikke er
tankestreger eller 1+/1− i teksterne. Den skal åbnes gennem en lokal server:
Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: hold <kbd>R</kbd> knus eller rør · <kbd>I</kbd> hint ·
<kbd>N</kbd> nyt forsøg · <kbd>T</kbd> teori · <kbd>M</kbd> lyd ·
<kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
