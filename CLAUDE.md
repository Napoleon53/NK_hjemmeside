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
