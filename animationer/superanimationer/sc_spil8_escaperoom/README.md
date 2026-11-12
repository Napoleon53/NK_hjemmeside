# EscapeRoom Kemi C (sc_spil8_escaperoom)

Spil nr. 8 i `kemi-c-filer/samling_c_spil.html`. Afløser `kemi-c-filer/c_spil8_escaperoom.html`,
når brugeren siger til. Indtil da ligger den nye kun i sin egen mappe, og menuen peger på den gamle.

## Bestillingen (12. nov. 2026)

Brugeren: "Kan du lave: Spil, knap 8: EscapeRoom Kemi C om til en superanimation. Den må gerne kunne
klares i forskellige niveauer [...] at man skal kunne gøre ting, i nogle eastereggs, der unlocker den
sidste bane. Man får altså som udgangspunkt bare en almindelig endscreen med et svagt hint, om at det
godt kunne gøres endnu bedre.. og hvis man så acer den.. så kommer man over til det endelige rum, hvor
man også skal klare de andre spil. Det kunne være noget med, at man ikke skal modtage hjælp eller hints
undervejs.. og det må gerne være på en måde, hvor nogle af opgaverne i rummet er lidt randomgeneret på
en måde, så man får forskellige kodeord til hvert rum.. så man ikke bare kan genbruge andres koder."

1. **Pointen:** hele Kemi C bruges til at knække fem koder, og en ren sag (uden Nillers noter og
   uden at gætte løs på låsen) åbner den gyldne dør, hvor de andre kemispil er nøglerne.
2. **Afløser og tager med:** historien om Niller, de fem rum med de samme emner og opgaver
   (Prøve X i laboratoriet, afstemning, stregformel, polaritet, blandingsgåden, gasrumfang,
   titrering og pH, permanganattitrering), nøglerne i rummenes farver, statuslinjen, hvor løste
   rum kan ses igen, uret, beviset på gennemførsel med kontrolcifre og den gyldne dør med fire
   segl fra Kemi-Millionær, Syregalgen, Pacman Quiz og Organiske grupper.
   **Nyt:** hvert rum er en scene med ting, man klikker på, og en kodelås i døren. Hver sag har
   sit eget nummer og sine egne tal. Slutningen har to niveauer. Seglene tjekkes mod det, der er
   vundet i browseren.
3. **Naboerne, der ejer resten:** de fire spil ejer seglene og røres ikke (det nye rum læser kun
   deres rekorder). `sc2.4_faeldningsreaktioner` ejer fældningstabellen, som laboratoriet bruger
   tal for tal. `sc3.3_polaere_molekyler` ejer elektronegativiteterne (2,1 / 2,5 / 3,0 / 3,5).
   Ingen teori kopieres ind.
4. **Loftet:** fem rum og et gyldent rum, højst tre opgaver pr. rum, højst fire ting at klikke på
   pr. scene (kodelåsen medregnet), ingen faner, ingen Kemichael, ingen lyd.
5. **Layoutet:** scenen er stjernen. En kort tekst om rummet står øverst i midten. Opgaverne
   åbner som et lyst papirkort over scenen, når man klikker på en ting. Intet panel.

Stop-listen er tjekket: der hældes ikke med musen, og der er ingen uheld eller oprydning.
Dråbepladen i rum 1 er en tabel, man klikker i, som i den gamle.

## Niveauerne

* **Almindelig slutning.** Fem døre åbnet. Slutskærmen viser tiden, beviset og nøgleringen med
  de fem nøgler. Nøglerne fra rene rum er af guld, de andre af jern. Én svag linje nederst siger,
  at fem gyldne nøgler passer i en dør, man ikke har set. Et klik på en jernnøgle siger, hvorfor
  den blev til jern. Mere forklares ikke.
* **Den gyldne dør.** Er alle fem nøgler af guld, kommer man i stedet til et sjette rum. Fire segl
  holder døren. Hvert segl brydes med titlen fra et af de andre spil, og kun hvis spillet også er
  vundet i den samme browser (se nedenfor). Så kommer den rigtige slutning med et guldbevis.
* **En ren nøgle** kræver, at ingen af rummets noter er læst, før døren er åbnet, og at låsen har
  fået højst `D.MAKS_FORKERTE` (2) forkerte koder. Grænsen gør det dyrt at gætte sig til koden:
  enkelte cifre har kun få muligheder.

## Tilfældige tal pr. sag

Ved Start trækkes et sagsnummer (1000 til 9999). Al data i rummene kommer af nummeret
(`NK.Sag.lav(nr)` i `js/sag.js`), så den samme sag altid giver de samme tal. Ny sag i toplinjen
giver et nyt nummer og nye tal. Målt på 2000 sager: to grupper har den samme kode til et rum i
0,5 til 2 % af tilfældene (rum 1 og 2 mest, fordi svarene er små hele tal), og alle 2000 sager har
hver sin samlede kode til de fem rum.

| Rum | Det, der trækkes |
|-----|------------------|
| 1 | metallet i Prøve X (seks muligheder) og de tre andre kendte prøver; reaktionen på tavlen (17) |
| 2 | molekylet på flasken (10); de fem molekyler på tavlen (1 til 4 polære); blandingsgåden (2 til 4 upolære af 6) |
| 3 | metallet (Mg, Zn, Al, Fe), massen, temperaturen og trykket |
| 4 | syren og basen, prøvens rumfang, basens koncentration og buretten før og efter |
| 5 | prøven (Fe²⁺ eller brintoverilte), permanganatets koncentration, prøvens rumfang og forbruget |

Tallene i rum 3 til 5 trækkes, indtil svaret er det samme, uanset hvordan eleven runder af
undervejs (molar masse med én eller to decimaler, T med 273 eller 273,15, mellemresultater med
tre betydende cifre). Selvtesten prøver det på 2000 sager.

## Seglene

| Segl | Titel | Tjekkes i browseren |
|------|-------|---------------------|
| Kemi-Millionær | superkemiker | `nk-million-rekord` er 1.000.000 |
| Syregalgen | syreimmun | `nk-syregalgen`: rekorden for en liste er mindst 5 |
| Pacman Quiz | labyrintmester | `nk-pacman-klaret`: `mix.svaer` |
| Organiske grupper | stofgruppemester | `nk-organiske-c-rekord` eller `orgSortering_bestAllTime` er mindst 14.000 |

Titlen alene er ikke nok: er spillet ikke vundet i denne browser, holder seglet. Seglet har en knap,
der åbner spillet i en ny fane. Når man kommer tilbage, tjekkes rekorderne igen. Kan browseren ikke
gemme noget (localStorage slået fra), godtages titlen alene.

Spillene selv er ikke ændret. Pacman Quiz' og Organiske gruppers selvtest læser stadig seglene i den
gamle `c_spil8_escaperoom.html`; de skal rettes til `sc_spil8_escaperoom/js/data.js`, når den nye
kommer i menuen, og den gamle flyttes til `arkiv/`.

## Beviset på gennemførsel

Som i den gamle: dato og klokkeslæt (DDMMTTmm) og to kontrolcifre. Koden skifter hvert minut.
Sådan tjekker læreren den: gang de otte cifre med vægtene 4, 3, 2, 7, 6, 5, 4, 3, læg sammen, og tag
resten ved division med 11. Den skal være de to sidste cifre. Almindelig slutning begynder med
RUMLESKAFT, guldslutningen med GULDSKAFT.

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scene, kortet over scenen og hjælpen |
| `css/stil.css` | alt udseende; kortet er papirkortet med Lexend fra `../faelles/lexend/` |
| `js/kerne.js` | hjælpere og tilfældighedsgeneratoren med frø |
| `js/data.js` | rummenes tekster, farver, puljerne, laboratoriets tabel, seglene, grænsen for en ren nøgle |
| `js/sag.js` | laver en sag af et nummer: opgaver, noter, felter i låsen og svar |
| `js/sprites.js` | tingene i rummene som SVG (tavle, dør, burette, vægt osv.) |
| `js/scener.js` | sætter tingene sammen til de seks scener |
| `js/sedler.js` | kortene: laboratoriet, tavlerne, strukturerne, det periodiske system, låsen og seglene |
| `js/app.js` | tilstanden, uret, låsen, noterne, slutningerne og seglene |
| `_selvtest.html` | kemien, de tilfældige sager, forløbet, begge slutninger og sproget |
| `_sprites.html` | viser tingene alene (udviklerværktøj) |

## Det, man kan rette i

* Grænsen for en ren nøgle: `D.MAKS_FORKERTE` i `js/data.js`.
* Reaktionerne på tavlen i rum 1, molekylerne i rum 2 og stofferne i blandingsgåden: puljerne i
  `js/data.js`. Selvtesten tjekker, at reaktionerne er afstemt, og at stregtallet passer.
* Teksterne til rummene og slutningerne: `D.RUM` og `D.SLUT` i `js/data.js`.

## Forenklinger

* Laboratoriet bruger `sc2.4`'s fældningstabel (grænsen 1 g pr. 100 mL). Sølvsulfat er derfor et
  hvidt bundfald, og sølv og bly skilles først af natriumhydroxid (brunt sølvoxid mod hvidt
  blyhydroxid). Den gamle havde et "svagt bundfald" for sølvsulfat og ingen natriumhydroxid.
  Kobber(II) og iodid giver et brunt bundfald (CuI farvet af iod).
* Blandingsgåden viser kun par, der passer i virkeligheden: ethanol og methanol står aldrig over
  for et upolært stof, fordi de kan blandes med flere af dem.
* Elektronegativiteterne er bogens og `sc3.3`'s (H 2,1, C 2,5, N 3,0, O 3,5, Cl 3,0).

## Scenerne

Hvert rum har en tavle, to ting og døren med kodelåsen. Et gult skilt ved hver ting; et klik på
tingen eller skiltet åbner kortet. Et skilt, der er set, bliver lidt mattere. Dråbepladen i rum 1
viser de dryp, gruppen har lavet. Den rigtige kode drejer døren op bag kortet. Al tekst står på
kortene, tavlerne og skiltene; der er ingen statuslinje nederst.

## Påskeæg

Nikkel (Ni) på det periodiske system i rum 1 har overskæg.

## Status (12. nov. 2026)

Bygget og afprøvet i headless Chrome. `_selvtest.html` er ALT OK (kemien, 2000 sager, forløbet med
begge slutninger og seglene, beviset, sproget og skærmen ved 1366 x 768 og 1100 x 700). Brugeren har
ikke set den endnu. Ikke i menuen.

## Linjen til menuen (når brugeren siger til)

I `kemi-c-filer/samling_c_spil.html`, knap 8:
`onclick="visAnimation(this, '../superanimationer/sc_spil8_escaperoom/index.html')"`.
Øverst i `<head>` i `index.html`:
`<script src="../../til_panelet.js" data-panel="samling_alt.html" data-emne="spil.escaperoom"></script>`.
Den gamle flyttes til `kemi-c-filer/arkiv/c_spil8_escaperoom_oldversion.html`.
