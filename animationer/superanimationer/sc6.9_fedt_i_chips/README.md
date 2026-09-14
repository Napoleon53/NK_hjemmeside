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
knus dem i en morter, tilsæt et opløsningsmiddel, rør rundt, vej et tomt
bægerglas, filtrer, inddamp, vej glasset igen og beregn fedtindholdet i procent.
Resultatet sammenlignes med varedeklarationen på posen (34 g fedt pr. 100 g).

Den gamle animation var en række knapper med en fast tekst til hvert trin. Det
nye er:

* **En rigtig opstilling.** Et åbent laboratoriebord med chipspose, vægt,
  morter og bunsenbrænder, og et stinkskab med vand, heptan, bægerglas,
  filtrering og varmeplade. Genstandene bruges ved at klikke på dem, og de
  flyver selv hen og hælder, filtrerer eller stiller sig på vægten.
* **Knusning og røring med musen.** Eleven tager fat i pistillen eller
  glasstaven og bevæger musen. Knappen **Knus** eller **Rør rundt** (tasten R)
  gør det samme, så længe den holdes nede. Knuses der meget voldsomt, springer
  krummer ud af morteren, og de er tabt.
* **Eleven vælger opløsningsmidlet.** Der er ingen forklaring før valget. Med
  vand bliver fedtet i chipsene, og kun saltet opløses; efter inddampningen er
  der en tynd hvid belægning, og resultatet er omkring 1 %. Med heptan
  opløses fedtet.
* **Tallene afhænger af, hvordan forsøget udføres.** Hvor godt chipsene er
  knust, hvor længe der er rørt, og om filteret skylles med lidt mere
  opløsningsmiddel, giver forskellige resultater. Uden skylning bliver
  resultatet ca. 29 %, med skylning ca. 32 %. Modellen står i `js/model.js`.
* **Zoomboblen følger indholdet.** Chipsstykker af stivelseskæder med
  fedtstofmolekyler imellem, heptan der omgiver fedtet og trækker det ud, vand
  der holder sammen med sig selv og opløser Na⁺ og Cl⁻, filtrerpapirets porer,
  og heptan der forlader overfladen ved inddampningen. Antallet af opløste og
  tilbageholdte fedtmolekyler kommer fra modellen.
* **Måleskema og beregning.** Vejningerne skrives ind i skemaet. Eleven skriver
  selv fedtindholdet. Et forkert svar giver et hint, der passer til fejlen:
  massen af fedtet i gram, en brøkdel i stedet for procent, glasset er ikke
  trukket fra, eller divisionen er vendt om.
* **Flere forsøg.** Nyt forsøg starter forfra med nye chips. Tidligere
  resultater og iagttagelser bliver stående, så forsøgene kan sammenlignes.
* **Quiz** med ti spørgsmål, låst op når fedtindholdet er beregnet i et forsøg
  med heptan.

## Påskeæggene

Læreren står ikke i panelet, men kommer ind på scenen fra venstre. Hovedet er
et sprite uden ansigt; øjne, bryn, mund og rødme tegnes i koden, så udtrykket
kan skifte. Armen drejer om skulderen. Alt står i `js/laerer.js`.

* **Chips spises.** Klikkes der på posen, når chipsene er afvejet, tager en
  hånd en chip. Tredje gang kommer læreren med en løftet pegefinger, og regel 2
  på plakaten lyser. Sjette gang tager læreren posen med. Den er tilbage ved
  næste forsøg.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.
* **Heptan over bunsenbrænderen.** Klikkes der på brænderen i stedet for at
  flytte filtratet til varmepladen, antændes heptandampene efter lidt tid
  (`BRAND.tid`). Røgalarmen hyler, læreren løber ind og kaster et brandtæppe
  over, og brænderen bliver konfiskeret resten af sessionen. Der er sod på
  væggen, og forsøget skal startes forfra. Med vand sker der ingen brand.
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
| `flaske_heptan.svg` | heptan med GHS02, GHS07, GHS08, GHS09 | åbningen (23, 4); låget tegnes i koden |
| `sproejteflaske.svg` | sprøjteflaske med vand | tudens spids (44, 9) |
| `tragt.svg`, `filterstativ.svg` | glastragt og stativ med ring | stilkens spids (38, 108); ringen (58, 97) |
| `trefod.svg`, `braender.svg` | trefod med trådnet og bunsenbrænder | nettets midte (35, 0) |
| `varmeplade.svg` | varmeplade | displayet x 10 til 40, lampen (52, 20) |
| `kaffekop.svg` | lærerens kop | bunden (18, 40) |
| `laerer_krop.svg`, `laerer_hoved.svg`, `laerer_arm.svg` | læreren | halsen (110, 18) og (55, 126); skulderen (28, 142) |
| `brandtaeppe.svg` | brandtæppe | toppen (75, 6) |
| `haand.svg`, `lup.svg` | handske og lup, som i sc2.6 | grebet (40, 46) |

Væsker, filtrerpapir, stråler, dråber, dampe, krummer, ild, røg, lokalet,
stinkskabet, lærerens ansigt og zoomboblen tegnes i koden. Ændres en sprite,
skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, måleskema, teori og rundvisning
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
js/app.js           panel, måleskema, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: chipsenes indhold (`CHIPS`),
opløsningsmidlerne (`MIDLER`), knusning, røring, filterets tilbageholdelse og
tjekket af elevens svar.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener (`laererKoer` i `laerer.js`) virker på samme måde med
`gaa`, `sig`, `arm` og `udtryk`.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
at alle sprites indlæses, at modellen giver de forventede resultater, at
rækkefølgen håndhæves, at heptan giver et resultat tæt på varedeklarationen og
vand omkring 1 %, at skylning hæver resultatet, at beregningen godtager det
rigtige svar og giver det rigtige hint til hver fejl, at påskeæggene og branden
kan gennemføres, og at der ikke er tankestreger eller 1+/1− i teksterne. Den
skal åbnes gennem en lokal server: Chrome nægter en side på `file://` at kigge
ind i sin egen iframe.

Genveje: hold <kbd>R</kbd> knus eller rør · <kbd>I</kbd> hint ·
<kbd>N</kbd> nyt forsøg · <kbd>T</kbd> teori · <kbd>M</kbd> lyd ·
<kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
