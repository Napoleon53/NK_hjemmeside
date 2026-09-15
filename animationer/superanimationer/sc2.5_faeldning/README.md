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
rundvisningen. Forløbet i tre trin (*Dryp*, *Brug luppen*, *Opskriv*) står
øverst i panelet, fordi det lille stativ står der, hvor trinene ellers ville
sidde på scenen.

## Hvad viser den

Et udsnit af laboratoriebordet set ovenfra:

* et **stativ** med syv dråbeflasker og et **lille stativ** med to låste pladser
* en **plastlomme** med et sort skema, tre opløsninger over søjlerne og fire ud
  for rækkerne
* en **lup** og et stykke **køkkenrulle**
* en **kemilærer**, der dukker op, når eleven fjoller

Eleven tager en flaske op og klikker på et felt. Flasken vendes, klemmes, og én
dråbe falder ned på folien. Flasken bliver i hånden, til man klikker ved siden
af, på stativet eller trykker Esc, så en hel søjle kan dryppes i træk. Mens en
flaske er i hånden, lyser dens søjle eller række op i skemaet.

Første gang siden åbnes, siger en intro-popup kort, hvad forsøget undersøger,
og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.

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
4 dråber. En dråbe mere får feltet til at løbe over i nabofeltet: læreren siger
noget, og køkkenrullen tørrer begge felter af.

Skemaet i panelet viser det samme som folien: et tomt felt, ½ når der mangler en
dråbe, ! ved en forkert opløsning, *intet* eller en prik i bundfaldets farve.
Klik på et felt i panelet flytter luppen derhen, eller drypper, hvis der er en
flaske i hånden.

### Luppen

Luppen ligger på skrå ved zoomcirklen. Den trækkes hen over en dråbe, eller
flyver derhen, når man klikker på dråben. Linsen forstørrer dråben, og
zoomcirklen viser ionerne i den.

Ionerne er talt, ikke tegnet på må og få. Hver dråbe har lige mange
formelenheder (6, eller 3 når der er mere end to dråber i feltet), så en dråbe
Na₃PO₄ giver tre gange så mange Na⁺ som PO₄³⁻. Når et bundfald dannes, samles
præcis så mange hele formelenheder, som ionerne rækker til, og de lægger sig i
bunden af cirklen. Resten bliver i opløsningen: tilskuerionerne og det, der er i
overskud. I AgNO₃ + Na₃PO₄ er det 6 Ag⁺ og 2 PO₄³⁻ i bundfaldet, mens 4 PO₄³⁻
er tilbage.

Trin 2 regnes som gjort, når man har set et bundfald blive samlet i luppen.

### Reaktionsskemaet

For hvert af de ni felter med bundfald opskrives fældningsreaktionen i to trin:

1. **Hvilke 2 ioner går sammen og danner den tungtopløselige forbindelse?**
   Ionerne i dråben står som knapper; eleven vælger en positiv og en negativ.
2. Er ionerne rigtige, glider en **reaktionspil** ind, og der står **Opskriv den
   neutrale kemiske formel for det udfældede salt.** Eleven klikker på de små
   tal efter hvert symbol (1, 2, 3). Parentesen om en sammensat ion kommer af
   sig selv, når der er mere end én.

Når formlen er rigtig, vises hele reaktionsskemaet med koefficienter, fx
3 Ag⁺(aq) + PO₄³⁻(aq) → Ag₃PO₄(s), sammen med bundfaldets farve og
tilskuerionerne.

Der er ingen forklaring før opgaven. Et forkert svar giver et hint, der passer
til fejlen:

* **forkert ion:** der peges på et felt i skemaet, hvor den samme ion møder den
  rigtige partner uden at give bundfald, fx *I feltet BaCl₂ + NaCl er der både
  Ba²⁺ og Cl⁻, men intet bundfald.* Er feltet ikke dryppet endnu, opfordres
  eleven til at gøre det. Findes der intet sådant felt, peges der på luppen
* **formel med ladning:** formlens samlede ladning regnes ud, fx *Ag₂PO₄ har
  ladningen 2 · (+1) + 1 · (−3) = −1. Formlen skal være neutral.*
* **rigtige forhold, men ikke mindste tal:** det bliver sagt

Efter to forkerte svar i samme trin kommer **Vis svaret**. Et vist svar tæller
ikke med, og feltet kan prøves igen senere.

### Kemichael

Læreren er Kemichael fra de andre superanimationer (se
`../kemichael/README.md`), her i en ældre udgave, der kigger op over bordkanten
nede i højre hjørne og siger noget i en talebobbel. Han bruger ikke den fælles
mappe, så denne animation er stadig selvstændig. Han dukker op:

* når eleven har **fjollet tre gange** i skemaet, og igen for hver tredje gang
  derefter. Fjol er en dråbe af en opløsning, der ikke hører til feltet (kun
  første gang, feltet bliver forkert). I det frie forsøg kan man ikke fjolle
* når et felt **løber over**, fordi der kommer en femte dråbe i. Køkkenrullen
  tørrer feltet og nabofeltet af (`loeberOver` i `js/forsoeg.js`)
* når skemaet er udført, og de ekstra flasker låses op
* når opgaven i det frie forsøg er løst

Replikkerne står i `js/laerer.js`. Samme replik bruges ikke igen, før alle i
listen er brugt. Et klik på læreren eller bobblen, eller Esc, sender ham væk;
ellers går han af sig selv efter nogle sekunder. Grænsen på tre står øverst i
`js/forsoeg.js` (`FJOL_GRAENSE`).

### Frit forsøg

Når alle tolv felter i skemaet er udført, falder **Na₂S** og **Fe(NO₃)₃** ned i
det lille stativ, og panelet får to knapper: *Skema* og *Frit forsøg* (eller
<kbd>F</kbd>).

Det frie forsøg er en ny side på folien med tolv tomme felter, hvor alle ni
flasker kan blandes frit. De to øverste rækker er sorte, de to nederste hvide, så
både hvide og sorte bundfald kan ses. Skemaets dråber gemmes, mens man er væk.

| Kombination            | Resultat                                  |
|------------------------|-------------------------------------------|
| Na₂S + AgNO₃ / CuSO₄   | Ag₂S / CuS, sort                          |
| Na₂S + Fe(NO₃)₃        | Fe₂S₃, sort                               |
| Na₂S + BaCl₂           | intet (BaS er letopløseligt)              |
| Fe(NO₃)₃ + Na₃PO₄      | FePO₄, gulhvidt                           |
| Fe(NO₃)₃ + Na₂CO₃      | rødbrunt bundfald og bobler, se nedenfor  |
| Fe(NO₃)₃ + NaCl / Na₂SO₄ / BaCl₂ / AgNO₃ / CuSO₄ | intet, gul opløsning |

Fe₂(CO₃)₃ findes ikke. Fe³⁺ og CO₃²⁻ giver Fe(OH)₃ og CO₂, og det vises sådan:
dråben bliver rødbrun med bobler, der kommer en kort besked på scenen, og i
luppen bliver carbonationerne til CO₂, der stiger op og forsvinder.

### Opgaven om tungtopløselige salte

I det frie forsøg erstattes reaktionsskemaet af en opgave for de dygtige:
**markér alle jern(III)salte og sulfider, der er tungtopløselige.** Listen
bygges af ionerne i flaskerne:

* jern(III)salte: Fe(NO₃)₃, FeCl₃, Fe₂(SO₄)₃, FePO₄, Fe₂S₃
* sulfider: Ag₂S, BaS, CuS, Na₂S, Fe₂S₃

Fe₂S₃ står i begge grupper, og de to knapper følges ad. Fe₂(CO₃)₃ er ikke med,
fordi det ikke findes. Svaret er FePO₄, Fe₂S₃, Ag₂S og CuS.

Alle skal være markeret, før man trykker **Tjek svar**. Er bare én forkert eller
mangler, står der kun *Forkert. Prøv igen.* Der er ingen hints, og teoriboksen
nævner med vilje ikke reglen for sulfider.

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
* **Et frit forsøg og en lærer**, som ikke fandtes før.
* **Rettet notation og sprog.** Ladning ±1 skrives + og −, og tankestreger og
  emojis er fjernet.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`:

| Fil | Indhold | Koordinater, som koden bruger |
|-----|---------|-------------------------------|
| `draabeflaske.svg` | dråbeflaske af blød plast med spids, skruelåg og blank etiket | spidsen (30, 2), væsken x 9 til 51 og y 66 til 143, etiketten x 8 til 52 og y 90 til 126 |
| `stativ.svg` | stativets forside med syv huller og etiketfelter | hullernes midte x 55, 133, 211, 311, 389, 467, 545; etiketfelterne y 24 til 46 |
| `stativ_lille.svg` | samme stativ med to huller | hullernes midte x 45 og 135; etiketfelterne y 24 til 46 |
| `plastiklomme.svg` | plastlomme med hulstrimmel og sort papir | papiret x 38 til 602, y 12 til 370 |
| `lup.svg` | lup med metalring og blåt skaft | linsens midte (58, 58), inderradius 42 |
| `papir.svg` | et stykke køkkenrulle | midten (50, 35) |
| `laerer.svg` | Kemichael i kittel med briller, overskæg, løftet øjenbryn og kaffekrus | munden (84, 141) |

Væsken i flaskerne, formlerne på etiketterne, skemaets streger, de hvide rækker
i det frie forsøg, dråberne, bundfaldet, boblerne, hængelåsen, zoomcirklen,
ionerne og talebobblen tegnes i `js/scene.js` og `js/mikro.js`. Ændres en
sprite, skal tallene øverst i `scene.js` passe.

## Filer

```
index.html          markup: scene, skema, opgaverne, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, ladningHaevet,
                    DPR-skarpt canvas, tegnehjælpere
js/data.js          ionerne, flaskerne, skemaet, huskereglen, bundfaldenes
                    farver, formler, reaktionsskemaer og saltene i den frie opgave
js/sprites.js       indlæser SVG'erne
js/scene.js         tegnebordet (1000 x 600) med alle mål og al tegning
js/mikro.js         ionerne i zoomcirklen
js/laerer.js        lærerens replikker og hvornår han er fremme
js/forsoeg.js       tilstanden: flasker, dryp, felter, sider, fjol, lup og køkkenrulle
js/opgave.js        reaktionsskema-kortet og hintene
js/fritopgave.js    opgaven om tungtopløselige salte
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           skemaet i panelet, sideskift, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**En opløsning** er én linje i `D.OPLOESNINGER` øverst i `js/data.js`: kation,
anion, hvor mange af hver og navnet. Formlen regnes ud af sig selv. Skal den
ind i skemaet, tilføjes id'et i `D.SOEJLER` eller `D.RAEKKER`. `bonus: true`
sætter den i det lille stativ. Stativerne har syv og to pladser; flere flasker
kræver flere huller i sprite-filen og i `S.PLADSER` eller `S.PLADSER_LILLE` i
`js/scene.js`.

**En ny ion** står i `D.IONER`: symbol, ladning, farve og radius i luppen.
`sammensat: true` giver parentes i formlen, når ionen optræder mere end én gang.

**Et nyt bundfald** skal have en farve i `D.BUNDFALD`. Selvtesten fanger
tungtopløselige par uden farve. `findesIkke: true` holder saltet ude af den frie
opgave; `gas: true` giver bobler og CO₂ i luppen; `note` vises på scenen, første
gang blandingen laves.

**Tider og grænser** står øverst i `js/forsoeg.js`: højst 4 dråber pr. felt,
hvor mange fjol før læreren siger noget, hvor længe bundfaldet er om at komme
til syne, og hvor længe køkkenrullen er om at tørre af. Ionernes fart og hvor
tæt de ligger i bundfaldet står øverst i `js/mikro.js`.

**Hintene** står i `js/opgave.js`. De bygges af data, så de passer til ethvert
skema. **Lærerens replikker** står øverst i `js/laerer.js`.

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: at alle
sprites indlæses, at formler og ladninger går op, at alle tolv felter giver det
rigtige bundfald, at dråber lander i det rigtige felt, at en fremmed opløsning
og en femte dråbe håndteres, at aftørring virker, at ionerne i luppen passer med
reaktionsskemaet og overskuddet, at opgaven kun godtager det rigtige svar og
giver hints, der passer til fejlen, at læreren kommer efter tre fjol og kan
sendes væk, at de ekstra flasker og det frie forsøg først låses op, når skemaet
er udført, at Fe(OH)₃ og CO₂ vises rigtigt, at opgaven om tungtopløselige salte
kun godtager det helt rigtige svar, og at teksterne hverken har tankestreger
eller 1+. Kør den efter ændringer. Den skal åbnes gennem en lokal server (eller
i Firefox): Chrome nægter en side på `file://` at kigge ind i sin egen iframe.

Genveje: <kbd>1</kbd> til <kbd>9</kbd> tag eller sæt en flaske · piletaster
vælg felt · <kbd>mellemrum</kbd> dryp eller se i luppen · <kbd>Delete</kbd> tør
feltet af · <kbd>R</kbd> tør folien af · <kbd>F</kbd> skema eller frit forsøg ·
<kbd>Esc</kbd> send læreren væk eller sæt flasken tilbage · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning.
