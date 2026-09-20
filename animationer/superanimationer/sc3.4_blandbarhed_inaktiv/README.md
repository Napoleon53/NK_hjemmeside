# sc3.4: Blandbarhed og faser

En superanimation: i modsætning til de gamle animationer, som er én HTML-fil,
ligger den i sin egen mappe med adskilt CSS, JavaScript og tegnekode.

Åbn **`index.html`**. Mappen er selvstændig bortset fra `../../v2/kemichael/`, som
læreren hentes fra. Den bruger hverken `fetch` eller moduler og virker derfor
også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c3.4_molekyler_blandbarhed.html`, men er
ikke i menuen endnu. Mappen hedder `_inaktiv`, indtil brugeren siger til.

## Hvad viser den

| # | Fane | Hvad eleven gør | Pointe |
|---|------|-----------------|--------|
| 1 | Ét lag eller to? | hælder to af fem væsker sammen i et reagensglas, ryster og ser efter | polariteten afgør, om der bliver ét lag eller to; tætheden afgør kun rækkefølgen |
| 2 | Faser og kogepunkt | varmer et stof op i en destillationskolbe og aflæser termometeret | kogepunktet følger kræfterne mellem molekylerne, og temperaturen står stille, mens stoffet koger |

Begge faner har et opgavekort med én knap: Start opgave → Giv hint → Vis svaret
→ Ny opgave. Teorien ligger bag knappen **Teori**, quizzen bag **Quiz**, og
**?** viser hjælp og genveje.

### De fem væsker

De står i `D.VAESKER` i `js/data.js` i rækkefølge efter, hvor polære de er:

| | formel | tæthed | smp. | kp. | mellem molekylerne |
|---|---|---|---|---|---|
| vand | H₂O | 1,00 | 0 °C | 100 °C | hydrogenbindinger |
| ethanol | C₂H₅OH | 0,79 | −114 °C | 78 °C | hydrogenbindinger |
| hexan-1-ol | C₆H₁₃OH | 0,81 | −45 °C | 157 °C | hydrogenbindinger |
| heptan | C₇H₁₆ | 0,68 | −91 °C | 98 °C | London-kræfter |
| madolie | fedtstof | 0,92 | −12 °C | 320 °C | London-kræfter |

Rækkefølgen er selve pointen: to væsker, der står ved siden af hinanden, kan
blandes; to, der står langt fra hinanden, kan ikke. Ethanol kommer længst
omkring, fordi molekylet er lille og har både en polær ende og en upolær hale.
Vand er det kræsne, fordi hydrogenbindingerne mellem vandmolekylerne skal brydes,
før der er plads til noget andet.

Farverne er kun til at kende væskerne fra hinanden. I virkeligheden er de alle
klare, og det står der også i panelet.

### Fane 1: ét lag eller to?

På bordet står fem flasker, et stativ med tre reagensglas og et affaldsglas.

* Træk en flaske hen over et glas og slip den: der hældes en portion i (2,4 mL,
  en femtedel af glasset). Flasken bliver hængende i hældepositur over glasset
  med en gul ring ved siden af, og et klik giver en portion mere. Flyttes musen
  væk, går flasken hjem.
* Et klik på en flaske hælder i det glas, der er valgt. Et klik på et glas
  vælger det.
* Træk et glas hen over et andet for at hælde indholdet over, eller hen over
  affaldsglasset for at tømme det.
* Grib et glas, og ryst det frem og tilbage med musen. Knappen **Ryst glasset**
  gør det samme. Efter en rystning står emulsionen og skiller sig ad over 6,5
  sekunder, fordi rystningen ikke ændrer polariteten.
* Slippes en flaske eller et glas ud over bordkanten, falder det på gulvet, og
  glas går i stykker. Kemichael kommer og rydder op, og forsøget kan fortsætte.
* **Skemaet** i panelet fyldes ud, efterhånden som eleven prøver parrene. 1 er
  ét lag, 2 er to lag. Et klik på et felt giver forklaringen.
* **Zoomboblen** er det valgte glas set inde fra. Molekylerne søger deres egen
  slags, når væskerne ikke er blandbare, og ligger mellem hinanden, når de er.

### Fane 2: faser og kogepunkt

En destillationskolbe med sidearm står på en varmeplade. Termometeret sidder i
halsen, køleren fører ud til et modtageglas.

* Vælg et af de fem stoffer eller blandingen af vand og ethanol.
* Drej på varmepladens knap i billedet, eller brug skyderen. Trin 0 er slukket,
  trin 10 er 300 °C.
* Væsken følger pladen med en tidskonstant på 7,5 s. Når den når kogepunktet,
  **bliver den stående dér**, så længe der er væske tilbage: al varmen går til at
  rive molekylerne fri af hinanden.
* Dampen går op gennem halsen og ud i sidearmen, bliver til dråber i køleren og
  drypper ned i modtageglasset.
* Madolie koger ved 320 °C og kan derfor ikke koge på pladen. Det siger
  animationen selv, når man skruer helt op.

**Destillation.** Er der to stoffer i kolben, fordeles dampen efter, hvor langt
hvert stof er over sit eget kogepunkt:

```
vægt(stof) = mL · e^(0,06 · (T − kogepunkt))
```

Ved 78 °C giver det ca. 72 % ethanol i dampen fra en halv-og-halv blanding, og
de første milliliter i modtageglasset bliver over 90 % ethanol. Koges kolben tør,
kommer det hele med over igen, og så er der ikke skilt noget ad. Det er pointen,
og opgaven beder derfor eleven om at stoppe undervejs.

Direkte link til en fane: `index.html#bland` eller `index.html#faser`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>Q</kbd> quiz ·
<kbd>R</kbd> start fanen forfra · <kbd>L</kbd> lyd · <kbd>H</kbd> hjælp ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html            markup for de to faner, teori, quiz og hjælp
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, hævet skrift,
                      DPR-skarpt lærred, tegnehjælpere
js/data.js            de fem væsker, blandingsskemaet, faserne, teori og quiz
js/lyd.js             lydene med Web Audio, ingen lydfiler
js/sprites.js         indlæser SVG-sprites. sc3.4 har ingen egne; filen er
                      her, fordi Kemichael lægger sine i den
js/molekyle.js        molekylerne som kugler og streger, bygget én gang ud
                      fra beskrivelsen i data.js
js/tegning.js         tegnebordet, bordpladen, reagensglasset og dets
                      væskeniveau, stativet, flasken, bægerglasset, zoomboblen
js/tegning_faser.js   destillationsopstillingen: kolben, køleren,
                      varmepladen, termometeret
js/opgave.js          opgavekortet med én knap (samme som sc2.1)
js/quiz.js            selvtesten i et overlay (samme som sc2.1)
js/sim_bland.js       fane 1: glassene, lagene, rystningen, zoomboblen, opgaverne
js/sim_faser.js       fane 2: temperaturen, fordampningen, molekylerne i
                      kolben, destillationen, opgaverne
js/laerer.js          Kemichaels scener: uheldet og rosen
js/app.js             faneskift, overlays, lyd, tastatur, tegneløkke
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

Alt tegnes på et fast tegnebord på 1000 × 600 enheder, som skaleres og centreres
i lærredet (`NK.Brat`). Bordpladen ligger i y = 500, gulvet i y = 558. Det er de
mål, `../../v2/kemichael/kemichael.js` er tegnet til, så læreren tegnes i bordets egne
koordinater uden ekstra skalering.

## At rette i den

**En ny væske** er ét objekt i `D.VAESKER` plus fire linjer i `PAR` (én pr.
eksisterende væske). Molekylet tegnes ud fra `mol`: `{ type: "vand" }`,
`{ type: "kaede", c: n, oh: true }` eller `{ type: "olie" }`. Skemaet, tabellen
i panelet, zoomboblen, lagene og valgene på fane 2 følger med af sig selv.
`skjulPolaer: true` slår det gule skær om den polære ende fra, som madolie gør,
fordi estergrupperne ikke er det, der afgør noget for et fedtstof.

**Blandbarheden er data, ikke kode.** `D.par(a, b)` er det eneste sted, der ved,
om to væsker kan blandes, og hver post har sin egen forklaring. Ingen af de to
faner regner det ud.

**Forsøgets tal** står øverst i hver `sim_*.js`: portionen og adskillelsestiden
på fane 1, kolbens rumfang, pladens trin og tidskonstanten på fane 2. Målene på
tegnebordet står samme sted, og destillationsopstillingens mål står i `MAAL` i
`js/tegning_faser.js`.

**Opgaverne** står nederst i hver `sim_*.js` som funktioner, der returnerer et
opgaveobjekt (formatet står i `js/opgave.js`).

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: at
blandingsskemaet er fuldstændigt og symmetrisk, at hvert par giver det rigtige
antal lag med det letteste øverst, at en emulsion skiller sig ad igen, at
glasset kan fyldes, hældes og tømmes, at væskeniveauet følger rumfanget, at
hvert stof koger ved sit eget kogepunkt, at destillatet bliver rigt på ethanol,
at alle ti opgaver kan løses, og at ingen tekst bruger tankestreger eller står
under 12 px. Chrome kræver `--allow-file-access-from-files`.

## Hvis den skal ind i menuen

`animationer/kemi-c-filer/samling_c3.html` og `animationer/samling_NV.html` har
hver en knap med `data-emne="c3.4"`, som peger på den gamle animation
`c3.4_molekyler_blandbarhed.html`. Skal den nye afløse den: skift den linje til
at pege på `index.html` her, flyt den gamle fil til
`animationer/kemi-c-filer/arkiv/c3.4_molekyler_blandbarhed_oldversion.html`, og
omdøb denne mappe fra `sc3.4_blandbarhed_inaktiv` til `sc3.4_blandbarhed`.
