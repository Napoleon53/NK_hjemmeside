# sc3.4: Blandbarhed

Superanimation, der afløser `animationer/kemi-c-filer/c3.4_molekyler_blandbarhed.html`.
Ikke i menuen endnu.

## Bestillingen

Skrevet, før der blev skrevet kode (se "Bestillingen, før der skrives kode" i
`../README.md`). Den kasserede `../sc3.4_blandbarhed_inaktiv/` voksede fra
emnet; denne er bygget tæt på den gamle c3.4.

1. **Pointen:** polariteten afgør, om der bliver ét lag eller to, og tætheden
   afgør kun rækkefølgen. Rystning og varme ændrer ikke på det.
2. **Afløser c3.4, og det her kommer med:** bassinet med molekylerne som kugler,
   der fylder næsten hele billedet; vand, ethanol og olie i de samme farver (blå,
   lilla, gul); knapperne, der hælder dem i; Ryst; temperaturskyderen fra 20 til
   120 °C med 78 og 100 °C markeret; køling foroven, så dampen falder tilbage;
   Tøm; quizzen med fem spørgsmål. Det, den gamle gjorde godt visuelt: stor
   scene, tydelige farver, damp, der stiger op og falder tilbage.
   **Det, der rettes:** der var for få kugler, og de fyldte aldrig bassinet,
   især når man zoomede ud; blandbarheden var tvunget frem (rystningen flyttede
   kuglerne), og olien lå altid øverst, også på ethanol, som er lettere.
3. **Naboerne:** `c3.3` ejer elektronegativitet og polære bindinger. `c3.5` ejer
   forsøget med stoffer i vand og heptan. Destillation er et andet emne; her er
   kun iagttagelsen fra den gamle, at ethanol koger før vand.
4. **Loftet:** 3 stoffer. 1 scene, ingen faner. På scenen 1 bassin og 1 lille
   glas; højst 864 kugler plus dampen. 6 opgaver og 5 quizspørgsmål. Ingen
   flasker, man hælder med musen, intet stativ, intet affaldsglas, ingen uheld.
5. **Layoutet:** toplinje, scene og panel. Bassinet er stjernen og fylder
   scenen; det lille glas står i hjørnet og viser det, øjet ser. Panelet har
   knapperne, der hælder i, rystning og temperatur, og opgavekortet.

## Hvad viser den

Åbn **`index.html`**. Mappen er selvstændig bortset fra `../../v2/kemichael/`, som
Kemichael hentes fra. Ingen `fetch` og ingen moduler, så den virker fra harddisken.

* **Bassinet** er et glas væske, forstørret, så molekylerne ses. Hver kugle er et
  molekyle, og væsken er altid tæt: tre portioner fylder ni rækker, ni portioner
  fylder bassinet (864 kugler), og mere løber over kanten. Det er det samme,
  hvor stort vinduet er. Musen over en kugle viser, hvad den er ("Ethanol,
  C₂H₅OH, polær"). Træk i bassinet for at ryste det.
* **Glasset** til højre er det samme bassin i almindelig størrelse, set med det
  blotte øje: vand og ethanol er klare, olien er lysegul, grænsen mellem to lag
  er en lys streg, og en emulsion er mælket. Det er regnet af den samme model.
* **Panelet:** tre knapper hælder en portion vand, ethanol eller olie i (en
  stråle midt i bassinet). Ryst bassinet. Temperaturen fra 20 til 120 °C med
  kogepunkterne for ethanol (78 °C) og vand (100 °C) i stoffernes farver. Tøm.
* **Opgavekortet** har én knap: Start opgave, Giv hint, Vis svaret, Ny opgave.
  De seks opgaver kommer i rækkefølge, fordi de bygger på hinanden:
  1. olie i vand (forudsig)
  2. ethanol i vand (forudsig)
  3. olie i ethanol (forudsig: olien lægger sig nederst)
  4. ryst olie og vand (forudsig)
  5. få olien til at ligge nederst uden at tømme bassinet (byg: ethanol i og ryst)
  6. varm vand og ethanol til 90 °C (forudsig)

  I en forudsigelse vælger eleven først, og så sker det i bassinet. Et forkert
  valg giver forklaringen til netop den fejl. Byg-opgaven er løst, når olien har
  ligget nederst i halvandet sekund.
* **Quiz** (fem spørgsmål) og **Teori** ligger bag knapper i toplinjen, **?** giver
  rundvisningen.
* **Kemichael** præsenterer bassinet første gang (tre linjer, peger på Hæld i),
  og han kommer forbi med én replik, når bassinet løber over, når olien svæver,
  og når der rystes i noget, der allerede er ét lag. Højst én gang hver pr.
  sidevisning.

Påskeæg: lige dele vand og ethanol vejer 0,926 g/mL, næsten det samme som olie.
Hæld tre portioner af hver, så olie, og ryst: oliedråberne svæver midt i
blandingen.

Genveje: <kbd>V</kbd> <kbd>E</kbd> <kbd>O</kbd> hæld i · <kbd>mellemrum</kbd> ryst ·
<kbd>↑</kbd> <kbd>↓</kbd> temperatur · <kbd>R</kbd> tøm · <kbd>Q</kbd> quiz ·
<kbd>T</kbd> teori · <kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>Esc</kbd> luk.

### Taget med og nyt

Fra den gamle c3.4: bassinet som scene, de tre stoffer og deres farver, knapperne,
rystningen, temperaturen med 78 og 100 °C, dampen, der stiger op og falder
tilbage i den kolde zone, tømning og en quiz med fem spørgsmål (omskrevet, så de
forkerte svar er typiske fejl; spørgsmålet om destillation er byttet ud med
ethanol og olie, fordi varmen nu har sin egen opgave).

Nyt: modellen (se nedenfor), det lille glas, opgavekortet, Kemichael,
rundvisningen, teorien og mængden i bassinet under knapperne.

## Modellen

`js/model.js`. Bassinet er et gitter på 32 × 27 pladser i tæt pakning (hver
anden række forskudt en halv plads). Fire ting flytter kuglerne:

1. **Diffusion.** To naboer bytter plads med Metropolis-sandsynlighed ud fra, hvor
   godt de holder fast i deres naboer før og efter (`D.BINDING`), ved den
   temperatur, der er skruet op for. Kan to stoffer blandes, blander de sig af sig
   selv; kan de ikke, samler de sig, og grænsen bliver skarp. Det går hurtigere,
   når det er varmt.
2. **Opdrift.** Tyngden virker kun mellem to faser, ikke inde i en fase. En fases
   tæthed er tætheden af hele blandingen i den (`D.faseTaethed`). Små dråber stiger
   eller synker som én klump, og det, de skubber til side, glider uden om. Store
   lag flader ud.
3. **Overfladen.** Kugler falder ned i huller. Hvert stof fordamper fra
   overfladen efter sit damptryk (Clausius-Clapeyron) og koger, når damptrykket
   når 1 atm: så dannes der bobler inde i væsken. Dampen bliver til dråber i den
   kolde zone foroven og drypper ned.
4. **Eleven.** Det, der hældes i, falder i en stråle og trykkes op til 11 rækker
   ned i væsken. En rystning bytter tilfældige kugler rundt inden for 7 rækker.

Hvem der kan blandes, står ingen steder i koden: det følger af `D.BINDING`
(`D.blandbar`), og faserne regnes ud af det.

### Tallene og kilderne

| | tæthed | kogepunkt | fordampningsvarme | kilde |
|---|---|---|---|---|
| vand | 0,998 g/mL | 100 °C | 40,7 kJ/mol | Databogen |
| ethanol | 0,789 g/mL | 78,3 °C | 38,6 kJ/mol | Databogen |
| olie (rapsolie) | 0,92 g/mL | koger ikke | | Databogen |

Blandinger af vand og ethanol: målt tæthed ved 20 °C i trin på 10 masseprocent
(CRC Handbook, "Concentrative properties of aqueous solutions: ethanol"). Lige
dele (rumfang) vejer 0,926 g/mL; 2 dele vand og 3 dele ethanol 0,904 g/mL.

### Forenklinger, valgt med vilje

* Alle kugler er lige store. Et oliemolekyle er i virkeligheden omkring 50 gange så
  stort som et vandmolekyle. Det står i teorien.
* En kugle er et fast rumfang af det rene stof, som det blev hældt i. Rumfanget
  trækker sig ikke sammen, når vand og ethanol blandes, men tætheden er den målte.
* `D.BINDING` er valgt, ikke målt. Kun rækkefølgen er kemi: hydrogenbindinger er
  stærkest, London-kræfter mellem olie svagere, polær mod upolær svagest.
* Ethanol og olie blandes slet ikke. I virkeligheden kan lidt ethanol opløses i
  olie, og mere, når det er varmt.
* Tyngden er gjort meget stærkere end i et rigtigt glas med 30 molekyler i
  bredden, ellers ville overfladespændingen holde lagene skæve. Små dråber bevæger
  sig med forskellen i tæthed opløftet i 0,6 i stedet for 1 (Stokes), så man ikke
  skal vente et halvt minut; under 0,008 g/mL står de stille (det giver påskeægget).
* Hvert stof fordamper, som om det var alene (ingen Raoults lov). En blanding af
  vand og ethanol koger i virkeligheden ved 80-95 °C, og dampen indeholder også
  vand.
* Tæthederne ændrer sig ikke med temperaturen.

## Filer

```
index.html            toplinje, scene, panel, teori, quiz og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
sprites/bassin.svg    bassinet med kølekappe og en streg pr. portion; det
                      samme sprite bruges til det lille glas
js/kerne.js           NK-navnerum, lærred, tekst (samme som sc2.4)
js/data.js            stofferne, BINDING, tætheden af vand-ethanol, damptryk
js/tekster.js         opgaverne, quizzen og Kemichaels replikker
js/model.js           gitteret og de fire ting, der flytter kuglerne
js/sprites.js         indlæser bassinet; Kemichael lægger sine sprites her
js/tegning.js         kuglerne som stempler, det lille glas, navneskiltet
js/scene.js           placering, tegning, musen og hændelserne til Kemichael
js/opgaver.js         opgavekortet med én knap og tjekket til byg-opgaven
js/quiz.js            quizzen
js/laerer.js          Kemichaels præsentation og besøg
js/rundvisning.js     rundvisningen bag ?
js/app.js             panelet, genvejene og tegneløkken
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

Bassinets inderside i spritet (x 20-670, y 30-604,4 i en tegning på 690 × 626)
svarer til gitteret: 32,5 × 28,72 kuglediametre. Ændres gitteret i `js/model.js`,
skal spritet og målene øverst i `js/scene.js` følge med.

## At rette i den

* **Et nyt stof** er ét objekt i `D.STOFFER` og én række og søjle i `D.BINDING`.
  Knappen i `index.html` og farven i `css/stil.css` skal tilføjes i hånden.
* **Modellens tal** står i `NK.Model.PARAM` øverst i `js/model.js` med en
  forklaring ved hvert.
* **Opgaverne, quizzen og replikkerne** er tekst i `js/tekster.js`.

## Selvtesten

`_selvtest.html` åbner `index.html` i en iframe og kontrollerer tabelværdierne og
tætheden af blandingerne, at blandbarheden følger af `D.BINDING`, at bassinet
altid er tæt og løber over ved ti portioner, at vand og ethanol giver ét lag og
olie to (øverst på vand, nederst på ethanol), at en emulsion skiller sig ad igen,
at ethanol koger før vand, og at alt falder tilbage, at olien synker, når
blandingen bliver lettere end 0,92 g/mL, at alle seks opgaver og quizzen kan
gennemføres, og at sproget overholder reglerne. Chrome kræver
`--allow-file-access-from-files`.

## Hvis den skal ind i menuen

`animationer/kemi-c-filer/samling_c3.html` og `animationer/samling_NV.html` har
hver en knap med `data-emne="c3.4"`, som peger på den gamle animation
`c3.4_molekyler_blandbarhed.html`. Skift den til `../superanimationer/sc3.4_blandbarhed/index.html`
(i `samling_NV.html` uden `../`), flyt den gamle fil til
`animationer/kemi-c-filer/arkiv/c3.4_molekyler_blandbarhed_oldversion.html`, og ret
kolonnen "I menuen" i `../README.md`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".
