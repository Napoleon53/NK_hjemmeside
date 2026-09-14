# sc1.3 Knaldgas

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig og henter kun filer inde fra sig
selv, så den kan flyttes uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c1.3_eksperiment_dihydrogen_dioxygen.html`,
som nu ligger i
`animationer/kemi-c-filer/arkiv/c1.3_eksperiment_dihydrogen_dioxygen_oldversion.html`.
Knappen i `samling_c1.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c1.3` og er derfor ikke berørt af flytningen.

## Kun én fane

Det er ét forsøg, så der er ingen fanelinje. Toppen har kun titel, Teori, lyd og
rundvisningen.

## Hvad viser den

Eleven fylder et måleglas med H₂ og O₂ (6 streger i alt), antænder det og
aflæser lydstyrken. Når alle syv blandinger fra 0 : 6 til 6 : 0 er testet, låses
en quiz op.

Indholdet er det samme som i den gamle animation: de to gasser, de 6 streger,
antænd med knap eller ved at trække glasset til flammen, lyd, søjlediagram over
lydstyrken, teorien bag en knap og quizzen. Styrkerne er de samme tal
(0, 25, 50, 75, 100, 50, 0). Det nye er opstillingen og rækkefølgen:

* **En rigtig opstilling.** Trykflaskerne er forbundet med slanger til et
  pneumatisk kar, hvor glasset står på hovedet på en hylde. Gassen bobler op i
  glasset og fortrænger vandet. Glasset flyver selv hen til flammen, når man
  trykker Antænd. Det bliver stående ved flammen, indtil man trykker
  **Genfyld glasset**, som sidder på Antænds plads så længe.
* **Molekyler i glasset.** Hver streg er 2 molekyler, så forholdet mellem
  stregerne også er forholdet mellem molekylerne. Ved knaldet dannes præcis det
  vand, som reaktionsskemaet giver. Der dannes også dug på indersiden af glasset.
* **Varmebevægelse.** Ved samme temperatur har alle molekyler samme
  gennemsnitlige kinetiske energi, så farten er omvendt proportional med
  kvadratroden af molmassen: H₂ bevæger sig 3 gange så hurtigt som H₂O og 4
  gange så hurtigt som O₂. Det enkelte molekyles fart er tilfældig omkring
  middelværdien (Maxwell-Boltzmann i to dimensioner). Knaldet hæver
  temperaturen for vand og overskud på én gang, den varme gas udvider sig, og
  en del af alle molekyler strømmer ud af åbningen. H₂ kommer hurtigst ud.
  Konstanterne står øverst i `js/forsoeg.js`.
* **Ingen lyd ved ren H₂ eller ren O₂**, for der sker ingen reaktion.
* **Påskeæg:** ved det helt rigtige forhold, 4 : 2, knækker glasset i 10 % af
  forsøgene (`knaekChance` i `js/forsoeg.js`). Skårene falder ned på bordet,
  og Genfyld glasset hedder da **Nyt glas**. Resultatet tæller stadig.
* **Kun et fuldt glas kan antændes.** Den gamle lod et halvt glas knalde uden at
  registrere det. Nu siger animationen, at glasset skal fyldes helt op først.
* **Forløbet i tre trin** (Fyld glasset, Antænd, Aflæs lydstyrken) står øverst
  på scenen og følger med. Det erstatter startskærmen, og teorien åbner ikke
  længere af sig selv.
* **Grafen og tjeklisten er slået sammen.** De syv cirkler og søjlediagrammet
  viste det samme; nu står en utestet blanding som en stiplet plads med et
  spørgsmålstegn.
* **Quizzen ligger i panelet** ved siden af forsøget i stedet for i et
  pop op-vindue, og der er kommet et femte spørgsmål om overskud.
* **Rettet kemi og sprog.** "Brint kan kun reagere med ilt" er skrevet om, og
  tankestreger og talesprog er fjernet.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`:

| Fil | Indhold | Koordinater, som koden bruger |
|-----|---------|-------------------------------|
| `trykflaske_h2.svg`, `trykflaske_o2.svg` | flaske, ventil, manometer, mærkat med molekyle og faresymboler: GHS02 (brandfarlig) hhv. GHS03 (brandnærende), begge med GHS04 (gas under tryk, kan eksplodere ved opvarmning) | manometerets midte (36, 56), slangestuds (104, 20) |
| `maaleglas.svg` | måleglas på hovedet med inddeling | inderside x 15 til 75, lukket ende y 16, streg n ved y 16 + 40·n, åbning y 292 |
| `vandbad.svg` | glaskar med vand og hylde | vandoverflade y 34, hyldens overside y 80, hul ved x 140 |
| `braender.svg` | bunsenbrænder | flammens fod (50, 15), gasstuds (94, 131) |

Viseren på manometrene, flammen, slangerne, glassets indhold og knaldet tegnes
i `js/scene.js`. Ændres en sprite, skal tallene i toppen af `scene.js` passe.

## Filer

```
index.html          markup: scene, graf, panel, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, DPR-skarpt canvas, tegnehjælpere
js/model.js         kemien: reaktion(h, o) og ordet efter knaldet
js/lyd.js           knaldet med Web Audio, ingen lydfiler
js/sprites.js       indlæser SVG'erne
js/scene.js         tegnebordet (1000 x 600) med alle mål og al tegning
js/forsoeg.js       tilstanden: fyldning, træk, flyvning, knald, molekyler
js/graf.js          søjlediagrammet under scenen
js/quiz.js          quizkortet og de fem spørgsmål
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien** står samlet i `js/model.js`. Knaldets styrke er mængden af dannet
vand i forhold til den bedste blanding (4 : 2 giver 8 H₂O = 100 %).

**Glassets tilstande** er beskrevet øverst i `js/forsoeg.js`: `klar`, `traek`,
`flyver`, `knald` og `fylder`. Fyld- og antændknapperne er kun slået til i
`klar`; Genfyld glasset kun i `knald`, og først 0,7 s efter knaldet, så et
dobbelttryk på mellemrum ikke sender glasset hjem med det samme.

**Spørgsmålene** står i `SPOERGSMAAL` i `js/quiz.js`. Svarene blandes hver gang.

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: at alle
sprites indlæses, at styrkerne er rigtige, at atomerne er bevaret i alle 28
blandinger, at et halvt glas ikke kan antændes eller tages op, at knaldet
danner de rigtige molekyler, at vandet flyver ud og overskuddet bliver, at
glasset bliver ved flammen indtil Genfyld glasset, at træk med musen virker, at
ren gas ikke giver lyd, at glasset kun knækker ved 4 : 2 og bagefter kan
erstattes, at quizzen låses op og i igen, og at der ikke er tankestreger i
teksterne. Kør den efter ændringer.

Genveje: <kbd>1</kbd> H₂ · <kbd>2</kbd> O₂ · <kbd>mellemrum</kbd> antænd
eller genfyld · <kbd>G</kbd> genfyld glasset · <kbd>R</kbd> tøm glasset ·
<kbd>T</kbd> teori · <kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.
