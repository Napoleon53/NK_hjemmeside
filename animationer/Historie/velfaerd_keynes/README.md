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

1. **Pengenes kredsløb.** Kroner ligger på et spor mellem familierne og
   virksomhederne (køb over toppen, løn under bunden). Kronerne står stille og flytter
   sig kun, når der sker noget. Fem klik: Første kort har indledningen og gættet (hvad
   sker der, når familierne sparer op?). Gættet sætter den onde cirkel i gang som én
   kort animation (12 kroner og 10 i arbejde bliver til 9 og 7), og svaret på gættet
   kommer, når den er færdig. Næste spørgsmål: hvem kan sætte gang i pengene ifølge
   Keynes? Efter det rigtige svar viser "Se staten give gas" hele forløbet på én gang:
   2 arbejdsløse får løn, 1 krone kommer op af sparegrisen, alle kommer i arbejde, og
   statens røde krone med gul ring kører køb, løn, køb med et lille ophold ved hver
   station, til tælleren siger 4 gange (multiplikatoreffekten). Knapperne springer
   resten af en animation over.
2. **Gas og brems.** Otte år. Hvert år står der, hvad ordrerne gør, og eleven vælger
   gas, ingenting eller brems. Grafen har to linjer, der trækker hver sin vej:
   arbejdsløsheden (blå) og prisstigningerne (rød), og en stiplet grænse, over hvilken
   det er for højt. Beskeden siger kun, hvad der skete, uden ros eller skæld ud. Første
   gang en linje kommer over grænsen, kommer én venlig bemærkning ("Hov ..."), aldrig
   flere. Til sidst: hvor mange år hver linje var over grænsen, de stiplede linjer uden
   staten (2 og 2 år), statskassen og Keynes' opskrift (eller "Du styrede, som Keynes
   ville"). Så et gæt: hvad var sværest for politikerne? Svaret er at bremse.
3. **Danmark 1953-1974.** Samme graf med tegnede linjer for 1950-1975. Fire nedslag:
   1953 (vækst først, valutaen manglede), 1960 (opsvinget brugt på velfærd), 1962
   (brems med skat: omsen, løn- og prisstop og moms) og 1974 (krisen: begge linjer er
   over grænsen, så reglen peger begge veje). I hvert: læs, svar på hvad Keynes' regel
   siger, se regeringens valg som et stempel øverst i grafen, og svar på hvorfor. Læs
   mere har flere detaljer. Til sidst et skema og et spørgsmål til eftertanke: Fulgte
   Socialdemokratiet Keynes' regel?

## Rettelser efter brugerens første test (19. okt. 2026)

* "Kredsløbet er lidt træls med det roterende penge. Det er svært at koncentrere sig."
  Kronerne kørte rundt hele tiden. Nu står de stille, og multiplikatoren klikkes frem.
* Gas og brems var "en smule for 2-dimentionel", og brugeren følte sig skældt ud for
  ikke at bremse i tide: "grundlæggende skal eleverne vel bare finde ud af det
  løbende, og så til sidst kan de se hvad konsekvensen er." Nu er der ingen dom år for
  år, kun én venlig bemærkning, og konsekvensen samles til sidst. "2-dimentionel" er
  tolket som for flad: grafen viser derfor to ting, der trækker hver sin vej, i stedet
  for én "temperatur".
* "Jeg er heller ikke helt sikker på hvad der er på y-aksen i grafen." Den gamle akse
  var en temperatur (for varm, balance, for kold). Nu viser aksen, hvor høj
  arbejdsløsheden og prisstigningerne er (lav, grænse, for højt), med navnene på
  linjerne øverst. Del 3 bruger samme graf.

Anden test samme dag: "lidt forvirrende med runderne og lidt klikketungt i starten.
Kan du måske lave lidt færre klik, og gøre kredsløbet lidt hurtigere og gennemføre. du
må gerne samle lidt mere tekst til hvert klik". Del 1 gik fra ca. 17 klik til 5:
gættet på første kort, ingen runder, den onde cirkel og statens gas som hver sin korte
animation med al teksten på ét kort, og statens krone kører selv (før blev den klikket
frem). Animationerne er gjort hurtigere.

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
(Læs mere). `fokus` siger, hvilke linjer der får en gul ring, og `raekke` (0 eller 1),
hvilken række øverst i grafen stemplet står i, så stemplerne ikke ligger oven i
hinanden. De tegnede linjer står i `HISTORIE`. I del 2 er `aar` årenes drift og nyhed.

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
* **Modellen i del 2** har et tal fra -3 til 3 for, hvor hurtigt økonomien kører. Gas
  lægger 1 til, brems trækker 1 fra, og hvert år har en fast drift. Arbejdsløsheden er
  1,8 minus tallet og prisstigningerne 1,2 plus tallet på en skala fra 0 til 5, og over
  3 er for højt. Forskydningen gør, at linjerne aldrig ligger oven i hinanden.
* **Kurverne i del 3 er en tegning, ikke tal.** Det står på grafen og i Fagord. De
  følger de store linjer: høj arbejdsløshed i 1950'erne, fuld beskæftigelse og
  stigende priser i 1960'erne og begge dele på én gang fra 1974.
* **1960 og Keynes.** Situationen var først 1958, men dansk arbejdsløshed var stadig
  høj i 1958, så med to linjer ville "brems" se forkert ud. 1960 passer: arbejdsløsheden
  falder hurtigt, og industrieksporten overhaler landbrugseksporten (bogens tidslinje).
  Keynes' regel siger brems i gode tider. Bogen siger, at regeringen brugte de voksende
  skatteindtægter på velfærd. Animationen siger ikke, at regeringen gik imod Keynes,
  kun hvad den gjorde og hvorfor.
* **1974.** Regeringen skiftede i december 1973, så teksten skriver ikke
  "regeringen", men at velfærden voksede videre (bogen, del 2).

## Selvtest

`_selvtest.html` siger ALT OK med knap 4300 påstande: teksterne (ingen tankestreger,
ingen indforstået begyndelse, alle svar har en begrundelse), modellen (uden staten 2
og 2 år over grænsen, Keynes' regel 0 og 0, linjerne ligger aldrig oven i hinanden),
at kronerne står stille, at der højst kommer én "Hov"-bemærkning, at de tegnede
linjer i del 3 står, som teksterne siger, hele forløbet med mus og taster, at tekstkortet og
tegningen står stille i alle trin, at intet løber over, at siden ikke skal rulles, og
at ingen læsbar tekst er under 12,4 px. Størrelser: 883 x 620 (vinduet i
historiesamlingen), 1069 x 620, 1280 x 620, 1366 x 768 og 1600 x 900.
