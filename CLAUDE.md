# kemiformler.dk

Kemi-undervisningssite: HTML/CSS/vanilla JS, ingen build-proces. Animationer i
`animationer/superanimationer/*` (interaktive canvas-simulationer med opgaver),
statiske sider i roden, downloads i `downloads/`.

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

- Læs `animationer/superanimationer/README.md`, før der arbejdes i mappen. Den
  skelner mellem superanimationer (et begreb i op til fire faner, Kemichael kan
  komme på besøg) og superlab-animationer (et forsøg på `laboratoriet/`,
  Kemichael er fast), og den har kravene til begge. Punkterne nedenfor om
  forsøg, laboratoriet og uheld gælder superlab-animationerne.
- Ingen løbende liste af iagttagelser i panelet. Forsøget opsummeres i stedet
  som en tegneserie i en pop-up bag en knap, der først låses op, når forsøget
  er slut (mønster: `sc6.8_substitution/js/tegneserie.js`).
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
- Samlingssiderne (`samling_*.html`) har fuld skærm: sidepanelerne skjules i
  begge lag, og knappen ☰ nederst til venstre gendanner dem. Superanimationer
  starter i fuld skærm; for alle andre animationer vælges den med ⛶ i
  panelets hoved (`fuldSkaerm` i de indre sider, beskederne `fuldSkaerm` og
  `gendanPanel` til de ydre).
- Superanimationer om laboratorieforsøg har en intro-popup, der kort siger, hvad
  forsøget undersøger, og hvad eleven skal gøre. Den åbner af sig selv første
  gang og igen med knappen Om forsøget (mønster: `#intro` i
  `sc6.8_substitution/index.html`, `aabnIntro` i `js/app.js`).
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
  `animationer/superanimationer/sc2.2_saltbygger/js/kerne.js`.

## Filstruktur

- `downloads/` er en almindelig, git-sporet mappe — ikke en junction. Nyt
  offentligt download lægges direkte her.
- `files/Kildefiler/` er upubliceret materiale (kildefiler, .bak-filer) — ikke
  til offentliggørelse.

## Løbende opdatering

Brugeren skriver "husk det" når noget generelt skal tilføjes her. Hold denne
fil kort og konkret — kun regler der gælder på tværs af flere filer/sessioner,
ikke enkeltrettelser.
