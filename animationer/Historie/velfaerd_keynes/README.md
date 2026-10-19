# Keynes og velfærdsstaten

Historie, forløbet om velfærdsstaten (3a HI). Hører til kapitel 8-alternativ, del 1
og 2, som er skrevet efter Peter Schroeder: Det 20. århundredes Danmarkshistorie
(2007), s. 109-129. Bygget 19. okt. 2026.

Adresse: `kemiformler.dk/animationer/Historie/velfaerd_keynes/`.
En del kan åbnes direkte: `index.html#2` eller `index.html#3`.

**I menuen:** nr. 4 i undersamlingen 2.3b Velfærdsstaten (`data-emne` 2.3b.4, knappen
hedder Keynes), før Fire faser, som blev nr. 5. Direkte link:
`samling_alt_historie.html?emne=2.3b.4`.

## Bestillingen

Brugerens ord: en animation, "der viser keynes teorier i en nogenlunde forsimplet
udgave, der passer til stoffet, men også giver en forståelse for den socialdemokratiske
politik i perioden 1950-1970 - den må gerne bygge lidt videre på finansminister", og
den skal i menuen "før velfærdsoversigten".

Inddelingen i tre dele og alt indholdet er mine valg inden for bestillingen.

## Forløbet

Tre dele i toplinjen. Man kan altid springe til en del. Al tekst står i tekstkortet
over tegningen; dets rækker har faste højder, så intet flytter sig fra trin til trin.

1. **Pengenes kredsløb.** Kroner går rundt mellem familierne og virksomhederne (køb
   over toppen, løn under bunden). Eleven gætter, hvad der sker, når familierne sparer
   op, klikker på familierne og ser den onde cirkel i tre runder (12 kroner og 10 i
   arbejde bliver til 9 og 7). Så: hvem kan sætte gang i pengene ifølge Keynes? Staten
   bygger en vej og betaler 2 arbejdsløse løn, familierne tør købe igen, og statens
   røde krone med gul ring tæller, hvor mange gange den bliver brugt
   (multiplikatoreffekten).
2. **Gas og brems.** Otte år. Hvert år står der, hvad ordrerne gør, og eleven vælger
   gas, ingenting eller brems. Den hvide kurve er elevens, den stiplede er økonomien
   uden staten (4 af 8 år i balance). Keynes' regel giver 8 af 8. Statskassen viser
   underskud ved gas og overskud ved brems. Til sidst et gæt: hvad var sværest for
   politikerne? Svaret er at bremse.
3. **Danmark 1953-1974.** Fire nedslag på en tegnet konjunkturkurve: 1953 (vækst
   først, valutaen manglede), 1958 (opsvinget brugt på velfærd), 1962 (brems med skat:
   omsen, løn- og prisstop og moms) og 1974 (krisen, hvor reglen peger begge veje). I
   hvert: læs, svar på hvad Keynes' regel siger, se regeringens valg som et stempel på
   kurven, og svar på hvorfor. Læs mere har flere detaljer. Til sidst et skema og et
   spørgsmål til eftertanke: Fulgte Socialdemokratiet Keynes' regel?

Forbindelsen til Finansminister: samme ramme, gas er orange og brems blå som dér, og
Læs mere for 1953 og 1962 henviser til den.

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | Siden, Keynes' teori, fagordene og vinduet til Læs mere |
| `css/stil.css` | Udseendet. Samme ramme som Finansminister |
| `js/data.js` | Alle tekster, modellen i del 2 og situationerne i del 3 |
| `js/kredsloeb.js` | Del 1: sporet, kronerne, arbejderne, sparegrisen og staten |
| `js/kurve.js` | Del 2 og 3: kurven, statskassen og stemplerne |
| `js/forloeb.js` | Trinene og tekstkortet |
| `js/app.js` | Taster, pop op-vinduer og opstart |
| `js/kerne.js` | Små hjælpefunktioner |
| `_selvtest.html` | Udviklerværktøj, kræver en lokal server |

## Det, man kan rette

Alle tekster står i `js/data.js`. I del 3 har hver situation `tekst`, `keynes` (det
rigtige svar og forklaringer til de forkerte), `regeringen` (stemplet), `hvorfor`
(spørgsmål og tre svar med `ja` eller `nej`), `kort` (linjen i skemaet) og `mere`
(Læs mere). `placering` flytter mærket og stemplet på kurven, så de ikke ligger oven
på linjen. I del 2 er `aar` årenes drift og nyhed.

## Kilderne

Situationerne, regeringens valg og begrundelserne er bogens (kapitel 8-alternativ).
Keynes' teori følger lærerens noter i modulplanen for 1950-1970. Detaljer uden for
bogen:

* Omsen: almindelig omsætningsafgift fra 1962 på 9 %, afløst af moms på 10 % i 1967
  (lex.dk: oms, moms).
* Kildeskatteloven blev vedtaget i 1967 sammen med momsloven og trådte i kraft i
  1970 (lex.dk, moms).
* Oliepriserne blev firedoblet i 1973-74 (alment kendt; stagflation som fagord).

Et "tvangslån" i 1955, som jeg overvejede til 1953-situationen, kunne jeg ikke
bekræfte, så det er ikke med.

## Forenklingerne

* **Kronerne er efterspørgslen.** Antallet af kroner på sporet er, hvor meget der
  bliver købt. Tallene (12 kroner, 10 arbejdere) er modellens.
* **Temperaturen i del 2** er et trin fra -3 til 3, og balance er -1 til 1. Gas
  lægger 1 til, brems trækker 1 fra, og hvert år har en fast drift.
* **Kurven i del 3 er en tegning, ikke tal.** Det står på kurven og i Fagord. Fra
  1973 deler den sig: priserne bliver varme, og arbejdsløsheden kold.
* **1958 og Keynes.** Keynes' regel siger brems i gode tider. Bogen siger, at
  regeringen brugte de voksende skatteindtægter på velfærd. Animationen siger ikke,
  at regeringen gik imod Keynes, kun hvad den gjorde og hvorfor.
* **1974.** Regeringen skiftede i december 1973, så teksten skriver ikke
  "regeringen", men at velfærden voksede videre (bogen, del 2).

## Selvtest

`_selvtest.html` siger ALT OK med knap 4000 påstande: teksterne (ingen tankestreger,
ingen indforstået begyndelse, alle svar har en begrundelse), modellen (uden staten 4
af 8, Keynes' regel 8 af 8), hele forløbet med mus og taster, at tekstkortet og
tegningen står stille i alle trin, at intet løber over, at siden ikke skal rulles, og
at ingen læsbar tekst er under 12,4 px. Størrelser: 883 x 620 (vinduet i
historiesamlingen), 1069 x 620, 1280 x 620, 1366 x 768 og 1600 x 900.
