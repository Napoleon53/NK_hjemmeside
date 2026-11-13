# EscapeRoom Kemi C (sc_spil8_escaperoom)

Spil nr. 8 i `kemi-c-filer/samling_c_spil.html` (koden `spil.escaperoom`, i menuen fra 13. nov. 2026).
Den gamle enkeltfil ligger i `kemi-c-filer/arkiv/c_spil8_escaperoom_oldversion.html`.

## Bestillingen

**12. nov. 2026:** "Kan du lave: Spil, knap 8: EscapeRoom Kemi C om til en superanimation. Den må gerne
kunne klares i forskellige niveauer [...] og det må gerne være på en måde, hvor nogle af opgaverne i
rummet er lidt randomgeneret [...] så man ikke bare kan genbruge andres koder."

**13. nov. 2026, efter første udgave:** "Jeg kunne godt tænke mig at billeder blev skarpere og at
historien blev bedre. Det skal være sådan, at man hurtigt kan gennemskue hvad man skal gøre for at
komme videre til næste rum. Det må ikke blive for alt for mystisk og frustrerende. Det kræver radikale
ændringer.. mange af gåderne er okay, men det skal være sådan, at man uanset hvad skal igennem
laboratoriedelen som svag elev, men at man også kan løse en svær bonusopgaver i hvert rum.. Det må
gerne være tydeligt at det er en bonusrute, og bonusopgaven skal være i samme tema. Bonusopgaven skal
føre til en alternativ kode, som man kan bruge i stedet."

1. **Pointen:** hele Kemi C bruges til at åbne fem døre. Alle kan komme igennem trin for trin, og
   den, der kan mere, tager bonusruten og får guldnøgler.
2. **Afløser og tager med:** de fem rum med de samme emner, dråbepladen med Prøve X, afstemning,
   stregformel, polaritet, blandbarhed, gasrumfang, titrering og pH, permanganattitrering, nøglerne
   i rummenes farver, uret, beviset med kontrolcifre og den gyldne dør med fire segl.
3. **Naboerne, der ejer resten:** de fire spil ejer seglene og røres ikke (rekorderne læses kun).
   `sc2.4_faeldningsreaktioner` ejer fældningstabellen, `sc3.3_polaere_molekyler` elektronegativiteterne.
4. **Loftet:** fem rum og den gyldne dør; tre trin og én bonusopgave pr. rum; højst seks ting at
   klikke på pr. scene (tre trin, tavlen i rum 3, bonusskrinet og kodelåsen); ingen Kemichael, ingen lyd.
5. **Layoutet:** scenen er stjernen. Opgavekortet står øverst i midten og er lavt. Et trin åbner som
   et papirkort over scenen.

## Sådan er et rum bygget

* **Opgavekortet øverst** har rummets navn, én replik fra Niller og linjen "Trin 1 af 3: Klik på …".
  Under den står de tre trin, koden (med streger for de cifre, der mangler) og Bonusrute. Skiltet ved
  den ting, næste trin handler om, er fremhævet i scenen; løste trin får grønt skilt med flueben.
* **Tre trin i fast rækkefølge.** Et trin er hakket i dele, der tjekkes hver for sig med Indsend svar.
  Et forkert svar får en besked, der passer til fejlen (kelvin, mL og liter, omvendt forhold, atomerne
  på hver side). Knappen Giv et hint bliver til Vis svaret, så ingen sidder fast. De løste dele bliver
  stående som pæne beregninger. Klikker man på et senere trin, siger kortet, hvilket trin der kommer
  først.
* **Laboratoriedelen** er første trin i hvert rum, og alle skal igennem den: dråbepladen (rum 1),
  bland stofferne to og to (rum 2), læg metallet på vægten og hæld det i syren (rum 3), titrer til
  omslag (rum 4 og 5). Forsøget er en knap; spørgsmålet kommer først bagefter.
* **Koden** er cifrene fra de løste trin. Når alle tre trin er løst, står koden klar i kodelåsen, og
  eleven trykker Lås op.
* **Bonusruten** er det mørke skrin med stjernen. Én svær opgave i rummets tema, uden hints og uden
  tjek undervejs. Svaret er guldkoden, som tastes i låsens guldfelter. Den åbner døren i stedet for
  koden og giver en guldnøgle. Guldkoden kan også tastes, efter døren er åbnet.

| Rum | Trin 1 (forsøget) | Trin 2 | Trin 3 | Bonusruten |
|-----|-------------------|--------|--------|------------|
| 1 Forberedelsesrummet | dråbepladen: metalionen i Prøve X | klik på metallet i det periodiske system | afstem skemaet på tavlen | neutroner og elektroner i ionen ud fra nukleontallet |
| 2 Kemikalielageret | bland væskerne: polær eller upolær | de fem molekyler på tavlen | streger i en stregformel | streger og frie elektronpar i to større molekyler |
| 3 Vejerummet | vej metallet: n = m / M | hæld i syren: n(H₂) | vejrstationen: T og V = nRT/p | for lidt syre: hvor meget metal er tilbage |
| 4 Titrerlaboratoriet | titrer: forbruget | n(base) og c(syre) | pH | pH midt i titreringen |
| 5 Redoxlaboratoriet | titrer: n(MnO₄⁻) | forholdet i skemaet: n(prøve) | c(prøve) | masseprocent i ståluld eller hydrogenperoxid |

## Slutningerne

* **I fandt Niller** kommer efter rum 5. Nøgleringen viser guld- og jernnøgler, og teksten siger
  ligeud, at guldnøgler fås med bonuskoderne. Et klik på en jernnøgle går tilbage til rummet.
* **Den gyldne dør** kræver fem guldnøgler. Fire segl brydes med titlerne fra Kemi-Millionær
  (superkemiker), Syregalgen (syreimmun), Pacman Quiz (labyrintmester) og Organiske grupper
  (stofgruppemester), og kun hvis spillet er vundet i samme browser (`nk-million-rekord`,
  `nk-syregalgen`, `nk-pacman-klaret`, `nk-organiske-c-rekord` eller `orgSortering_bestAllTime`).
  Kan browseren ikke gemme noget, godtages titlen alene. Pacman Quiz' og Organiske gruppers selvtest
  læser seglene i `js/data.js` (`D.SEGL`): ret ikke formatet uden at rette dem.

Den første udgaves skjulte regler (ingen noter, højst to forkerte koder) er væk: guld fås kun ad
bonusruten, og det står på skærmen.

## Tilfældige tal pr. sag

Ved Start trækkes et sagsnummer (1000 til 9999), og alle tal kommer af det (`NK.Sag.lav(nr)`). Ny
sag giver nye tal. Tallene i rum 3 til 5 trækkes, indtil både svaret og bonussvaret er de samme,
uanset hvordan eleven runder af (molar masse med én eller to decimaler, 273 eller 273,15,
mellemresultater med tre betydende cifre). Målt på 2000 sager: to grupper har den samme kode til et
rum i 0,5 til 2 % af tilfældene og den samme guldkode i 0,4 til 5,5 %; ingen sager har samme kode til
alle fem rum.

## Beviset på gennemførsel

Som i den gamle: dato og klokkeslæt (DDMMTTmm) og to kontrolcifre. Læreren ganger de otte cifre med
vægtene 4, 3, 2, 7, 6, 5, 4, 3, lægger sammen og tager resten ved division med 11; den skal være de
to sidste cifre. RUMLESKAFT er den almindelige slutning, GULDSKAFT guldslutningen.

## Tegningerne

Lyse rum, mørke konturer, større ting og ingen filtre (et SVG-filter bliver til et billede og kan se
sløret ud). Glas står foran lys væg, så svage farver ses. `_sprites.html` viser tingene alene.

## Filerne

| Fil | Indhold |
|-----|---------|
| `js/data.js` | historien, teksterne, puljerne, dråbepladens tabel, seglene |
| `js/sag.js` | laver en sag af et nummer: trin, kode og guldkode |
| `js/sprites.js`, `js/scener.js` | tingene som SVG og rummenes opstilling |
| `js/sedler.js` | trinenes kort: forsøg, dele, hints, fejlbeskeder, bonus, lås og segl |
| `js/app.js` | tilstanden, opgavekortet, tjek af svar, låsen og slutningerne |
| `_selvtest.html` | kemien, 2000 sager, alle trin i alle rum, bonusruten, slutningerne, sproget, skærmen |

## Forenklinger

* Dråbepladen bruger `sc2.4`'s fældningstabel. Sølv og bly skilles af natriumhydroxid (brunt
  sølvoxid mod hvidt blyhydroxid). Kobber(II) og iodid giver et brunt bundfald (CuI farvet af iod).
* Væskerne i rum 2 må blandes frit, så puljen har kun stoffer, hvor "polært med polært, upolært med
  upolært" holder. Ethanol, methanol og eddikesyre er derfor ikke med.
* Elektronegativiteterne er bogens og `sc3.3`'s (H 2,1, C 2,5, N 3,0, O 3,5, Cl 3,0).
* Titreringerne er én knap (Titrer til omslag); aflæsningerne står som tal.

## Påskeæg

Nikkel (Ni) i det periodiske system i rum 1 har overskæg.

## Status (13. nov. 2026)

Bygget om efter Niels' tilbagemelding og afprøvet i headless Chrome. `_selvtest.html` er ALT OK.
Niels har ikke set den nye udgave endnu.
