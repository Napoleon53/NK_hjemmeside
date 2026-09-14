# sc2.5 Fældning

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen er selvstændig og henter kun filer inde fra sig
selv, så den kan flyttes uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c2.5_eksperiment_bundfald.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c2.5_eksperiment_bundfald_oldversion.html`.
Knappen i `samling_c2.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c2.5` og er derfor ikke berørt af flytningen.

## Kun én fane

Det er ét forsøg, så der er ingen fanelinje. Toppen har kun titel, Teori og
rundvisningen.

## Hvad viser den

Et udsnit af laboratoriebordet set ovenfra:

* et **stativ** med syv dråbeflasker
* en **plastlomme** med et sort skema, tre opløsninger over søjlerne og fire ud
  for rækkerne
* en **lup** og et stykke **køkkenrulle**

Eleven tager en flaske op og klikker på et felt. Flasken vendes, klemmes, og én
dråbe falder ned på folien. Flasken bliver i hånden, til man klikker ved siden
af, på stativet eller trykker Esc, så en hel søjle kan dryppes i træk. Mens en
flaske er i hånden, lyser dens søjle eller række op i skemaet.

Forløbet står i tre trin øverst på scenen: *Dryp i felterne*, *Brug luppen*,
*Opskriv reaktionen*.

### Skemaet

|         | AgNO₃            | BaCl₂            | CuSO₄              |
|---------|------------------|------------------|--------------------|
| NaCl    | AgCl, hvidt      | intet            | intet              |
| Na₂SO₄  | Ag₂SO₄, hvidt    | BaSO₄, hvidt     | intet              |
| Na₂CO₃  | Ag₂CO₃, lysegult | BaCO₃, hvidt     | CuCO₃, blågrønt    |
| Na₃PO₄  | Ag₃PO₄, gult     | Ba₃(PO₄)₂, hvidt | Cu₃(PO₄)₂, lyseblåt |

Ni felter med bundfald, tre uden. Opløseligheden følger samme huskeregel som
sc2.2: nitrater og alle salte med natrium, kalium og ammonium er letopløselige;
af resten er AgCl, BaSO₄, Ag₂SO₄ og alle carbonater og phosphater
tungtopløselige. Ag₂SO₄ ligger under grænsen på 1 g pr. 100 mL, som sc2.1
bruger, og tegnes med et tyndere bundfald end de andre (`taethed` i
`js/data.js`).

Skemaet er sort, fordi hvide bundfald ellers ikke kan ses. CuSO₄ farver dråben
blå.

En dråbe af en opløsning, der ikke hører til feltet, er tilladt, men giver en
advarsel, og feltet regnes ikke som udført, før det er tørret af. Kemien regnes
alligevel rigtigt: BaCl₂ og CuSO₄ i samme felt giver BaSO₄. Et felt rummer højst
4 dråber.

Skemaet i panelet viser det samme som folien: et tomt felt, ½ når der mangler en
dråbe, ! ved en forkert opløsning, *intet* eller en prik i bundfaldets farve.
Klik på et felt i panelet flytter luppen derhen, eller drypper, hvis der er en
flaske i hånden.

### Luppen

Luppen trækkes hen over en dråbe, eller flyver derhen, når man klikker på
dråben. Linsen forstørrer dråben, og zoomcirklen til højre viser ionerne i den.

Ionerne er talt, ikke tegnet på må og få. Hver dråbe har lige mange
formelenheder (6, eller 3 når der er mere end to dråber i feltet), så en dråbe
Na₃PO₄ giver tre gange så mange Na⁺ som PO₄³⁻. Når et bundfald dannes, samles
præcis så mange hele formelenheder, som ionerne rækker til, og de lægger sig i
bunden af cirklen. Resten bliver i opløsningen: tilskuerionerne og det, der er i
overskud. I AgNO₃ + Na₃PO₄ er det 6 Ag⁺ og 2 PO₄³⁻ i bundfaldet, mens 4 PO₄³⁻
er tilbage.

Trin 2 regnes som gjort, når man har set et bundfald blive samlet i luppen.

### Reaktionsskemaet

For hvert af de ni felter med bundfald skal fældningsreaktionen opskrives.
Ionerne i dråben står som knapper; eleven vælger den positive og den negative
ion og klikker på koefficienterne for at ændre dem (1, 2, 3). Produktet står som
? til svaret er rigtigt.

Der er ingen forklaring før opgaven. Et forkert svar giver et hint, der passer
til fejlen:

* **forkert ion:** der peges på et felt i skemaet, hvor den samme ion møder den
  rigtige partner uden at give bundfald, fx *I feltet BaCl₂ + NaCl er der både
  Ba²⁺ og Cl⁻, men intet bundfald.* Er feltet ikke dryppet endnu, opfordres
  eleven til at gøre det. Findes der intet sådant felt, peges der på luppen
* **forkerte koefficienter:** ladningerne for de valgte tal regnes ud
* **rigtige forhold, men ikke mindste tal:** det bliver sagt

Efter to forkerte svar kommer **Vis svaret**. Et vist svar tæller ikke med, og
feltet kan prøves igen senere. Et rigtigt svar viser bundfaldets farve, formlen
og tilskuerionerne.

### Det nye i forhold til den gamle animation

* **En rigtig udførelse.** Den gamle havde to knapper, *Tilsæt væske 1* og
  *Tilsæt væske 2*. Nu drypper eleven selv med flasker i et skema, som i
  laboratoriet.
* **Alle tolv kombinationer i ét skema** i stedet for fire forudvalgte forsøg,
  og også felter uden bundfald. NaI og K₂CO₃ er skiftet ud med NaCl, Na₂SO₄ og
  Na₂CO₃: CuSO₄ og iodid giver en redoxreaktion, som ikke er en fældning.
* **Luppen erstatter træk-selv-ionerne.** Den gamle lod eleven trække ionerne
  sammen én for én. Nu dannes bundfaldet af sig selv i det rigtige forhold,
  også med overskud, og luppen kan flyttes mellem felterne.
* **Hints i stedet for fast forklaring.** Den gamle viste tilskuerionerne,
  så snart reaktionen gik i gang. Nu skal eleven selv finde dem.
* **Rettet notation og sprog.** Ladning ±1 skrives + og −, og tankestreger og
  emojis er fjernet.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`:

| Fil | Indhold | Koordinater, som koden bruger |
|-----|---------|-------------------------------|
| `draabeflaske.svg` | dråbeflaske af blød plast med spids, skruelåg og blank etiket | spidsen (30, 2), væsken x 9 til 51 og y 66 til 143, etiketten x 8 til 52 og y 90 til 126 |
| `stativ.svg` | stativets forside med syv huller og etiketfelter | hullernes midte x 55, 133, 211, 311, 389, 467, 545; etiketfelterne y 24 til 46 |
| `plastiklomme.svg` | plastlomme med hulstrimmel og sort papir | papiret x 38 til 602, y 12 til 370 |
| `lup.svg` | lup med metalring og blåt skaft | linsens midte (58, 58), inderradius 42 |
| `papir.svg` | et stykke køkkenrulle | midten (50, 35) |

Væsken i flaskerne, formlerne på etiketterne, skemaets streger, dråberne,
bundfaldet, zoomcirklen og ionerne tegnes i `js/scene.js` og `js/mikro.js`.
Ændres en sprite, skal tallene øverst i `scene.js` passe.

## Filer

```
index.html          markup: scene, skema, reaktionsskema, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, ladningHaevet,
                    DPR-skarpt canvas, tegnehjælpere
js/data.js          ionerne, flaskerne, skemaet, huskereglen, bundfaldenes
                    farver, formler og reaktionsskemaer
js/sprites.js       indlæser SVG'erne
js/scene.js         tegnebordet (1000 x 600) med alle mål og al tegning
js/mikro.js         ionerne i zoomcirklen
js/forsoeg.js       tilstanden: flasker, dryp, felter, lup og køkkenrulle
js/opgave.js        reaktionsskema-kortet og hintene
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           skemaet i panelet, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**En opløsning** er én linje i `D.OPLOESNINGER` øverst i `js/data.js`: kation,
anion, hvor mange af hver og navnet. Formlen regnes ud af sig selv. Skal den
ind i skemaet, tilføjes id'et i `D.SOEJLER` eller `D.RAEKKER`. Stativet har syv
pladser; flere flasker kræver flere huller i `stativ.svg` og i `S.PLADSER` i
`js/scene.js`.

**En ny ion** står i `D.IONER`: symbol, ladning, farve og radius i luppen.
`sammensat: true` giver parentes i formlen, når ionen optræder mere end én gang.

**Et nyt bundfald** skal have en farve i `D.BUNDFALD`. Selvtesten fanger
tungtopløselige par uden farve.

**Tider og grænser** står øverst i `js/forsoeg.js`: højst 4 dråber pr. felt,
hvor længe bundfaldet er om at komme til syne, og hvor længe køkkenrullen er om
at tørre af. Ionernes fart og hvor tæt de ligger i bundfaldet står øverst i
`js/mikro.js`.

**Hintene** står i `js/opgave.js`. De bygges af data, så de passer til ethvert
skema.

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: at alle
sprites indlæses, at formler og ladninger går op, at alle tolv felter giver det
rigtige bundfald, at dråber lander i det rigtige felt, at en fremmed opløsning
og en femte dråbe håndteres, at aftørring virker, at ionerne i luppen passer med
reaktionsskemaet og overskuddet, at opgaven kun godtager det rigtige svar og
giver hints, der passer til fejlen, og at teksterne hverken har tankestreger
eller 1+. Kør den efter ændringer. Den skal åbnes gennem en lokal server (eller
i Firefox): Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: <kbd>1</kbd> til <kbd>7</kbd> tag eller sæt en flaske · piletaster
vælg felt · <kbd>mellemrum</kbd> dryp eller se i luppen · <kbd>Delete</kbd> tør
feltet af · <kbd>R</kbd> tør folien af · <kbd>Esc</kbd> sæt flasken tilbage ·
<kbd>T</kbd> teori · <kbd>H</kbd> rundvisning.
