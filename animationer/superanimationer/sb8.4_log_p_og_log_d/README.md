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
   lægemiddel), kuglerne HA og A⁻ som `b8-membran`, strukturformlerne som
   `b8-syre-base-former` og `b8-opg-4-strukturer` (uladet grå, ionen blå
   med glød; BH⁺ rød), kurven som `b8-logd-kurve` og `b8-logd-syre-base`
   (log D fra −5 til 3, syren rød, basen blå, grønne punkter med navn) og
   kroppens områder som `b8-fordeling-asa`.
3. **Naboerne:** B8.3 ejer fordelingsdiagrammet for acetylsalicylsyre og
   pufferligningen; her bruges kun log D-formlen og genvejen. sb7.7 ejer
   fordelingsdiagrammet for aminosyrer (mønstret med kurven, der tegnes
   dér, hvor skyderen har været, er lånt derfra). sb6.1 ejer Kₛ og pKₛ.
   sb4.2 ejer skilletragten i estersyntesen. Bedøvelse med ethere (sidste
   del af B8.4) er ikke med.
4. **Loftet:** tre faner med fire eller fem trin og to eller tre
   ekstraopgaver, syv stoffer (paracetamol, glucose, ibuprofen, stof Z,
   acetylsalicylsyre, amfetamin og lidocain), 20
   molekyler i luppen og på skærmen kun skilletragten, luppen, kassen eller
   kurven og pH-skyderen.
5. **Layoutet:** scene plus panel som sb7.7. Tavlen har skilletragten til
   venstre, luppen i midten og regnestykket (fane 1) eller kurven med
   pH-skyderen under (fane 2 og 3) til højre. Er tavlen smallere end 720 px,
   vises skilletragten ikke, så luppen og kurven kan blive store nok.

## Brugerens første dom (13. november 2026)

"Det er en god animation, men jeg savner lidt at molekyleformlerne inddrages.
Både i fane 1 og fane 2. Det 'mystiske x' bliver pludselig til 2 konkrete
valgmuligheder.. Det kunne man godt bare skrive mere tydeligt fra start. i
fane 2 er progressionen meget pludselig ... Måske skal formlen slet ikke
bruges.. den er ikke en del af kemi-A pensum ... Kan man ikke gøre det på en
lidt mere rolig kvalitativ måde.. og eventuelt gemme den vanvittige formel
til en toggle, som er markeret svær. I fane 3.. skal molekylerne i
mikrofiguren så ikke hedde BH⁺? Desuden samme kommentar som i fane 2 om
sværhed. Der må gerne være nogle ekstraopgaver, som ikke er stiladseret."

Rettet samme dag: strukturformlerne i bogens stil (`js/struktur.js`), stof X
er "glucose eller ibuprofen" fra start med begge formler, fane 2 og 3 er
kvalitative, formlen og genvejen ligger kun i ekstraopgaverne bag kontakten
Svær, kuglerne i fane 3 hedder altid B og BH⁺ (det ukendte stof med X og
"ion" er væk; lidocain er nu et navngivet stof), og hver fane har
ekstraopgaver uden hints (`js/ekstra.js`).

## Fanerne

* **Fane 1 Log P** (`js/sim_logp.js`): paracetamols strukturformel står til
  højre over kassen med regnestykket. Klik på skilletragten, så den rystes,
  og paracetamol fordeler sig med 15 molekyler i octanol og 5 i vand. Eleven
  skriver Kꜰ = 3,0 og log P = 0,48; forklaringen bruger formlen (benzenringen
  er upolær, OH-gruppen og amidgruppen danner hydrogenbindinger). Trin 4:
  "Stof X er enten glucose eller ibuprofen" med begge formler (gul ramme),
  tragten rystes, alle 20 går i octanol, og eleven vælger ibuprofen.
  Ekstraopgaver: stof Z (ryst, 18 og 2, log P = 0,95), ibuprofen (10 000
  gange) og glucose (1000 gange).
* **Fane 2 Log D og pH** (`js/sim_kurve.js`): acetylsalicylsyre med formlerne
  HA ⇌ A⁻ under luppen (som bogens `b8-syre-base-former`). Trin: hvilken
  form går over i octan-1-ol; tegn kurven (skyderen begynder ved pH 0 og
  glider højst 4 pH pr. sekund); mavesæk eller blod; aflæs log D = 1,2 = log
  P i mavesækken; hvor meget falder log D pr. pH-enhed. Ekstraopgaver: find
  pH, hvor lagene har lige meget (4,7), hvor mange gange større i octanol ved
  pH 1,5 (16), og med Svær: log D i tyndtarmen med formlen (−1,8).
* **Fane 3 Syre eller base** (samme fil): amfetamin med BH⁺ ⇌ B under luppen
  og syrens kurve svagt bagved. Trin: tegn kurven; hvorfor stiger log D
  (BH⁺ afgiver H⁺); mavesæk eller tyndtarm; lidocain (formlen alene, kuglerne
  B og BH⁺) mod amfetamin i blodet. Ekstraopgaver: find pH, hvor amfetamin
  har lige meget i lagene (8,1), find pH, hvor de to kurver krydser (6,4),
  og med Svær: log D i blodet med genvejen (−0,7).

Ekstraopgaverne startes fra panelet (knappen skifter til Tilbage til
trinnene), har ingen hints, kun Vis svaret, og koster ikke fanens stjerne.

## Forenklinger og tal

* Lagene har samme rumfang, og luppen viser lige store rumfang, så antallet
  af kugler i hver halvdel svarer til koncentrationen. 20 molekyler fordeles
  efter D = n(octanol) / n(vand) med største rest (`D.fordeling`).
* Ionen går slet ikke over i octanol, som formlen i bogen antager.
* Paracetamol får 15 og 5 molekyler, dvs. Kꜰ = 3,0 og log P = 0,48. Bogen
  siger 0,50 (opgave B8.4.2) og ca. 0,5 (log P-skalaen).
* Lidocains tal (log P 2,4, pKₛ 7,9) er tabelværdier efter hukommelsen.
* Glucose er tegnet som ring med fem OH-grupper, lidocain kun som den
  uladede base B (to former var for små til at kunne læses).
* Når skyderen flyttes, fordeler stoffet sig straks på ny; tragten rystes
  ikke for hver pH.

## Filerne

* `js/data.js` stofferne, modellen (`D.logD`, `D.fordeling`) og alle tekster.
* `js/scene.js` skilletragten, luppen (`S.Lup`) og grafen.
* `js/struktur.js` strukturformlerne og ligevægten HA ⇌ A⁻ og BH⁺ ⇌ B.
* `js/ekstra.js` ekstraopgaverne og kontakten Svær (fælles for fanerne).
* `js/tegning.js` tavlen, skiltet, pH-skyderen, formler og kuglerne.
* `js/fane.js`, `js/kerne.js`, `js/rundvisning.js` og `css/stil.css` er
  kopieret fra sb7.7 (scenekortet, Indsend svar, hintknappen og
  rundvisningen). Det, der er nyt i stilarket, står nederst under SB8.4.
* `_selvtest.html` (107 påstande, ALT OK 13. nov. 2026) og `_skud.html`
  (skærmbilleder af hvert trin) er udviklerværktøjer og kræver en lokal
  server med mappen `animationer/` som rod.

## Status

**I menuen fra 13. nov. 2026 som B8 knap 1 før TLC (koden `b8.4`).** Før det: Kommer den i menuen, får den en knap i
`kemi-b-filer/samling_b8.html` før TLC (`b8.6`) med koden `b8.4`, linjen til
`til_panelet.js` øverst i `<head>` og eventuelt en Prøv selv-linje i
Kemibogens B8.4.
