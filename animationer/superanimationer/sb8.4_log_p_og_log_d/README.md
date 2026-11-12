# sb8.4 Log P og log D

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter kun
filer fra sin egen mappe og `../faelles/` og virker også, når den åbnes
direkte fra harddisken. Der er ingen Kemichael: al tekst står på det lyse
papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den er bygget fra bunden; der var ingen animation om log P og log D i
B8-menuen før. Afsnittet i Kemibogen B er B8.4 Log *P* og log *D*, derfor
nummer 8.4.

**Pointen i én sætning:** Kun den uladede form går over i octan-1-ol, så
log P er fordelingen af den uladede form, og log D er den faktiske fordeling
ved en bestemt pH, som falder 1 pr. pH-enhed, når stoffet bliver ladet.

## Bestillingen (12. november 2026)

Brugeren 12. nov. 2026: "Lav gerne følgende superanimation: B8.4 log P og log
D, hvor skilletragten med octanol og vand får en pH-skyder". Resten af
planen og valgene er Claudes, og brugeren har ikke set animationen endnu.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Bygget fra bunden. Skilletragten i stativet og luppen
   ved grænsen mellem lagene er tegnet som bogens `b8-fordeling-octanol`
   (octan-1-ol gult øverst, vand blåt nederst, orange kugler for et
   lægemiddel), kuglerne HA og A⁻ som `b8-membran` (uladet grå, ionen blå
   med glød; BH⁺ rød), kurven som `b8-logd-kurve` og `b8-logd-syre-base`
   (log D fra −5 til 3, syren rød, basen blå, grønne punkter med navn) og
   kroppens områder som `b8-fordeling-asa`.
3. **Naboerne:** B8.3 ejer fordelingsdiagrammet for acetylsalicylsyre og
   pufferligningen; her bruges kun log D-formlen og genvejen. sb7.7 ejer
   fordelingsdiagrammet for aminosyrer (mønstret med kurven, der tegnes
   dér, hvor skyderen har været, er lånt derfra). sb6.1 ejer Kₛ og pKₛ.
   sb4.2 ejer skilletragten i estersyntesen. Bedøvelse med ethere (sidste
   del af B8.4) er ikke med.
4. **Loftet:** tre faner med fire trin hver, seks stoffer (paracetamol,
   glucose, ibuprofen, acetylsalicylsyre, amfetamin og lidocain), 20
   molekyler i luppen og på skærmen kun skilletragten, luppen, kassen eller
   kurven og pH-skyderen.
5. **Layoutet:** scene plus panel som sb7.7. Tavlen har skilletragten til
   venstre, luppen i midten og regnestykket (fane 1) eller kurven med
   pH-skyderen under (fane 2 og 3) til højre. Er tavlen smallere end 720 px,
   vises skilletragten ikke, så luppen og kurven kan blive store nok.

## Fanerne

* **Fane 1 Log P** (`js/sim_logp.js`): klik på skilletragten, så den rystes,
  lagene blandes og skilles, og paracetamol fordeler sig med 15 molekyler i
  octanol og 5 i vand. Eleven tæller i luppen og skriver Kꜰ = 3,0 og
  log P = 0,48 i et felt på kortet; regnestykket bygges op i kassen til
  højre. Til sidst rystes stof X (alle 20 går i octanol), og eleven vælger
  mellem glucose, paracetamol og ibuprofen. Bagefter kan de tre stoffer
  rystes fra panelet.
* **Fane 2 Log D og pH** (`js/sim_kurve.js`): acetylsalicylsyre (log P 1,2,
  pKₛ 3,5). Skyderen begynder ved pH 0 og glider højst 4 pH pr. sekund,
  mens kurven tegnes (som sb7.7). Trin: tegn kurven; hvorfor går stoffet
  ikke over i octanol ved høj pH (ionen er ladet); beregn log D i
  tyndtarmen ved pH 6,5 (−1,8, formlen står på kortet); hvor meget falder
  log D pr. pH-enhed over pKₛ (1, stregen ved pH = pKₛ og en trekant med
  hældningen vises).
* **Fane 3 Syre eller base** (samme fil): amfetamin (log P 1,8, pKₛ 9,9) med
  syrens kurve svagt bagved. Trin: tegn kurven; beregn log D i blodet med
  genvejen (−0,7); hvor bliver amfetamin bedst optaget (tyndtarmen, kroppens
  områder vises på kurven); et ukendt stof med kuglerne X og "ion", hvor
  eleven aflæser log P = 2,4 og vælger base. Svaret afslører lidocain.
  Bagefter kan tre stoffer vælges i panelet.

## Forenklinger og tal

* Lagene har samme rumfang, og luppen viser lige store rumfang, så antallet
  af kugler i hver halvdel svarer til koncentrationen. 20 molekyler fordeles
  efter D = n(octanol) / n(vand) med største rest (`D.fordeling`).
* Ionen går slet ikke over i octanol, som formlen i bogen antager.
* Paracetamol får 15 og 5 molekyler, dvs. Kꜰ = 3,0 og log P = 0,48. Bogen
  siger 0,50 (opgave B8.4.2) og ca. 0,5 (log P-skalaen).
* Lidocains tal (log P 2,4, pKₛ 7,9) er tabelværdier efter hukommelsen.
* Når skyderen flyttes, fordeler stoffet sig straks på ny; tragten rystes
  ikke for hver pH.

## Filerne

* `js/data.js` stofferne, modellen (`D.logD`, `D.fordeling`) og alle tekster.
* `js/scene.js` skilletragten, luppen (`S.Lup`) og grafen.
* `js/tegning.js` tavlen, skiltet, pH-skyderen, formler og kuglerne.
* `js/fane.js`, `js/kerne.js`, `js/rundvisning.js` og `css/stil.css` er
  kopieret fra sb7.7 (scenekortet, Indsend svar, hintknappen og
  rundvisningen). Det, der er nyt i stilarket, står nederst under SB8.4.
* `_selvtest.html` (81 påstande, ALT OK 12. nov. 2026) og `_skud.html`
  (skærmbilleder af hvert trin) er udviklerværktøjer og kræver en lokal
  server med mappen `animationer/` som rod.

## Status

Ikke i menuen. Kommer den i menuen, får den en knap i
`kemi-b-filer/samling_b8.html` før TLC (`b8.6`) med koden `b8.4`, linjen til
`til_panelet.js` øverst i `<head>` og eventuelt en Prøv selv-linje i
Kemibogens B8.4.
