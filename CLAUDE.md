# kemiformler.dk

Kemi-undervisningssite: HTML/CSS/vanilla JS, ingen build-proces.
Superanimationerne (interaktive canvas-simulationer med opgaver) ligger i
`animationer/superanimationer/`, de gamle laboratorieforsøg og motoren bag
dem i `animationer/v2/`, statiske sider i roden, downloads i `downloads/`.

## Frosset: animationer/v2/ bortset fra superanimation/

Hele `animationer/v2/` er frosset 20. september 2026 og må ikke rettes her:
`laboratoriet/`, `kemichael/`, `superlab/` og `superlab_ny/`. Laboratoriesporet
udvikles i `C:\NK_Undervisning\virtuelt_laboratorium\`, som har sin egen
kopi af de fire mapper. Bliver der alligevel rettet i dem, tager
`autocommit.ps1` filerne ud af commit'en igen og skriver det i
`autocommit.log`.

Mapperne bliver stående her, fordi de otte gamle laboratorieforsøg i
`superlab/` og to superanimationer (`sc2.1_salt_i_vand` og
`sc3.4_blandbarhed_inaktiv`, som henter `../../v2/kemichael/kemichael.js`)
indlæser filer fra `laboratoriet/` og `kemichael/`. Fjernes de, går
animationerne i sort på kemiformler.dk.

**Superanimationerne er flyttet ud af `v2/`** og ligger igen i
`animationer/superanimationer/` (20. september). De er ikke frosne og rettes
som hidtil. Den gamle `animationer/v2/superanimation/` skal slettes af
brugeren; intet peger på den.

Skal en fejl i en af de otte gamle animationer rettes, rettes den her, ét
sted, og bakkes ikke til NK_Undervisning. De to kopier skal ikke holdes i
sync; denne er færdig.

## Om brugeren

- Brugeren vibecoder og programmerer aldrig selv. Tal direkte og uden kodejargon,
  og gør arbejdet i stedet for at forklare, hvordan det gøres.
- Er der et reelt valg, så giv valgmulighederne med din anbefaling først og en
  kort begrundelse. Brugeren følger som regel anbefalingen.

## Sprog og tone

- Dansk, forklarende men formelt og skarpt.
- Undgå em-dash (–/—) og overforklarende talesprog. Skriv som en lærebog, ikke en samtale.
- Kort og saglig tekst. Slet sælgende formuleringer ("helt uden indsats", buzzwords)
  og gentagelser af det, overskriften allerede siger.
- Ikke-tekniske forklaringer til brugeren (ikke kodearbejde): kort, uden filnavne,
  sprogkoder eller kildelister. Giv konklusionen og hvad der skal gøres; tekniske
  detaljer kun hvis der bedes om det.

## Opgaver og hints i animationerne

- Undgå at fylde teoritekst ind i animationerne. Eleven skal lære ved at prøve,
  ikke ved at læse en forklaring først.
- Lav i stedet korte hints knyttet til den konkrete opgave — vis dem når eleven
  sidder fast, ikke som fast forklaringstekst før opgaven.

## Superanimationer

- Punkterne om superlab-animationer, `laboratoriet/` og `kemichael/`
  gælder i NK_Undervisning, ikke her: de mapper er frosne (se ovenfor).
  Punkterne om superanimationer gælder som hidtil og arbejdes i
  `animationer/superanimationer/`.
- Læs `animationer/v2/README.md`, før der arbejdes i en af mapperne. Den Den
  skelner mellem superanimationer (et begreb i op til fire faner, Kemichael kan
  komme på besøg) og superlab-animationer (et forsøg på `laboratoriet/`,
  Kemichael er fast), og den har kravene til begge. Punkterne nedenfor om
  forsøg, laboratoriet og uheld gælder superlab-animationerne.
- En ny superanimation eller superlab-animation ligger kun i sin egen mappe, til
  brugeren siger til. Først da kommer den i samlingsfilerne (`samling_*.html`) og
  `FEEDBACK_EMNER`, og først da flyttes en gammel animation, den afløser, til
  `arkiv/`. Ret samtidig kolonnen "I menuen" i superanimationernes README.
- Ingen løbende liste af iagttagelser i panelet. Forsøget opsummeres i stedet
  som en tegneserie i en pop-up bag en knap, der først låses op, når forsøget
  er slut (mønster: `superlab/sc6.8_substitution/js/tegneserie.js`).
- Resultatskemaet for forsøget står i tegneseriens sidste rude, ikke som et
  kort i panelet.
- Zoomboblen med mikroniveauet må gerne være lidt større end i de første
  superanimationer, så partiklerne kan ses.
- Sammensatte ioner i zoomboblen tegnes som én kugle med formlen på (fx NO₃⁻),
  ikke som flere kugler, der sidder sammen.
- Fælles kode for laboratorieforsøgene ligger i `laboratoriet/` (kerne,
  rundvisning, grundstilark). Forsøgets egen `css/stil.css` har kun det, der
  er særligt for forsøget. Se `laboratoriet/README.md`.
- Nye laboratorieforsøg bygges på genstandsmodellen i `laboratoriet/js/`
  (stof, udstyr, beholder, bord): alt kan gribes, sættes ned og bruges på alt,
  og hvad der sker, afgøres af udstyrets egenskaber, ikke af forsøgets kode.
  Klik viser, træk gør: et klik vælger kun til aflæsning og zoom, handlinger
  sker ved at trække. Zoomboblen står i panelet, ikke på scenen.
  Mønster: `laboratoriet/proevebord/`.
- Det, der lige er brugt (flaske, dråbeflaske, sprøjteflaske, spatel), bliver
  hængende over glasset, flasken i hældepositur med en gul ring ved siden af;
  klik gentager, træk væk sætter det hjem. En portion er højst en femtedel af
  glasset. Ingen hånd tegnes.
- Flere rum (pile, luge, stinkskab) ligger i `laboratoriet/js/rum.js`, mønster
  `laboratoriet/proeverum/`. Superanimationerne bruger ét rum.
- Kemien er data, ikke kode: nye stoffer, reaktioner og redoxpar skrives i
  `laboratoriet/js/stoftabel.js` (pKa, Ksp, E°, ΔH, farve), aldrig som
  særtilfælde i et forsøg. Efter ændringer køres
  `laboratoriet/proevebord/_kombinationer.html` og læses igennem. Faremærker
  og Kemichaels advarsel om et stof er også data der (`fare`).
- Sidepanelet er 430 px bredt (`--panel-bredde` i `laboratoriet/css/grund.css`).
  Prøvebordet har 473 px, fordi zoomboblen står i panelet.
- Samlingssiderne (`samling_*.html`) kan give fuld skærm: sidepanelerne
  skjules i begge lag, og knappen ☰ nederst til venstre gendanner dem. **Ingen
  animation starter i fuld skærm af sig selv** (rettet 20. september efter
  kollegers tilbagemelding: det var forvirrende, at menuen forsvandt). Fuld
  skærm vælges med ⛶ i panelets hoved (`fuldSkaerm` i de indre sider,
  beskederne `fuldSkaerm` og `gendanPanel` til de ydre).
- Superanimationer om laboratorieforsøg har en intro-popup, der kort siger, hvad
  forsøget undersøger, og hvad eleven skal gøre. Den åbner af sig selv første
  gang og igen med knappen Om forsøget (mønster: `#intro` i
  `superlab/sc6.8_substitution/index.html`, `aabnIntro` i `js/app.js`).
- Forkerte handlinger i et forsøg afvises ikke med en besked, når det kan
  undgås. De udføres og giver et uheld, og Kemichael kommer og rydder op
  (`kemichael/`). Kun det, der fysisk ikke kan lade sig gøre, afvises.
- Alt glasudstyr (reagensglas, bægerglas, kolber, termometre, glasstave osv.)
  skal kunne gribes og flyttes med musen, og det skal virke at slippe det
  over det, det skal bruges på. Klik virker stadig som genvej.
- Eleven skal kunne bevæge sig frit i forsøget og lave vanvittige fejl.
  Kemichael lader det ske og kommer med en sarkastisk bemærkning om, at man
  nok bør starte et nyt forsøg, men eleven kan altid fortsætte.

## Layout

- Kompakte layouts, få lag af overskrifter. Grupper i rammer med en lille,
  diskret etiket (små versaler) frem for en h2 i fuld størrelse.
- Én overskriftsskala på hele sitet: sidetitel = standard-h1, afsnitsoverskrift
  = h2 (maks. 1,5 rem), korttitel = 1,2 rem. Ingen lokale størrelses-overrides.
- Genbrug eksisterende klasser (`.gruppe`, `.gruppe-hoved`, `.kort.kompakt`,
  `.henvisning` fra `assets/style.css`) frem for at stable nye sektioner.

## Kemisk notation

- En ion med ladning ±1 skrives som **+** eller **−** alene, aldrig 1+/1− (Na⁺,
  ikke Na¹⁺). Gælder alle steder ladning vises: canvas-tegninger, løbende tekst,
  beregnede beskeder, tooltips og fejlbeskeder bygget af strengsammensætning.
  Mønster: `ladningHaevet`/`ladningstekst` i
  `animationer/v2/superanimation/sc2.2_saltbygger/js/kerne.js`.

## Filstruktur

- `downloads/` er en almindelig, git-sporet mappe — ikke en junction. Nyt
  offentligt download lægges direkte her.
- `files/Kildefiler/` er upubliceret materiale (kildefiler, .bak-filer) — ikke
  til offentliggørelse.

## Løbende opdatering

Brugeren skriver "husk det" når noget generelt skal tilføjes her. Hold denne
fil kort og konkret — kun regler der gælder på tværs af flere filer/sessioner,
ikke enkeltrettelser.
