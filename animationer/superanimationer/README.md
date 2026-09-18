# Superanimationer

Mappen rummer to slags interaktive læringsmiljøer: **superanimationer** og
**superlab-animationer**. Begge er selvbærende: eleven kan bruge dem alene,
uden at emnet er gennemgået på tavlen først. Det er det, der gør dem super,
ikke at de er store eller ligger i deres egen mappe.

|  | Superanimation | Superlab-animation |
|--|----------------|--------------------|
| Handler om | ét begreb | ét forsøg |
| Eleven | bygger, skruer, forudsiger og spiller | udfører forsøget selv, trin for trin |
| Form | op til fire faner med hver sin vinkel på samme idé | én scene med en rigtig laboratorieopstilling |
| Kode | selvstændig mappe | står på den fælles motor i `laboratoriet/` |
| Kemichael | kan komme på besøg | fast bestanddel |

De to slags bygges hver for sig. Det eneste overlap er kemilæreren Kemichael.
I en superanimation er han gæst og dukker op, når det giver mening (sc2.1). I
en superlab-animation er han en del af forsøget.

## Oversigt

"I menuen" betyder, at en samlingsfil (`samling_*.html`) linker til mappen. En
ny animation kommer først i menuen, når brugeren siger til.

| Mappe | I menuen | Note |
|-------|----------|------|
| `superanimation/sb2.0_ligevaegt_intro` | nej | |
| `superanimation/sb3.2_titreringssimulator` | ja | |
| `superanimation/sc1.1_atombygger` | ja | via genvejen `kemi-c-filer/c1.1_atommodel_ioner.html` |
| `superanimation/sc2.1_salt_i_vand` | nej | menuen viser stadig den gamle c2.1 |
| `superanimation/sc2.2_saltbygger` | nej | menuen viser stadig den gamle c2.2 |
| `superanimation/sc3.1_elektronprikformler` | ja | |
| `superanimation/sc3.2_rumlig_opbygning` | nej | inaktiv: rettes ikke, før brugeren siger til |
| `superanimation/sc3.4_blandbarhed` | ja | ny, sept. 2026 |
| `superlab/sb2.4_jernthiocyanat` | ja | gammel kode, afløses af `sb2.4_ligevaegt` |
| `superlab/sb2.4_ligevaegt` | nej | samme forsøg på den fælles motor, under opbygning |
| `superlab/sc1.3_knaldgas` | ja | ældre sidelayout |
| `superlab/sc2.5_faeldning` | ja | ældre sidelayout og ældre udgave af Kemichael |
| `superlab/sc2.6_kobber_dibrom` | ja | |
| `superlab/sc2.7_blyiodid` | ja | |
| `superlab/sc6.8_substitution` | ja | |
| `superlab/sc6.9_fedt_i_chips` | ja | |
| `superlab/sc8.6_jern_i_staaluld` | ja | |

## Fælles krav

Kravene gælder begge slags.

**1. Selvbærende.** Eleven lærer ved at gøre, ikke ved at læse.

* Rundvisningen bag `?` peger på ét element ad gangen på den fane, man står på.
* Hints hører til den konkrete opgave og vises, når eleven sidder fast.
  Teorien ligger bag en knap og åbner aldrig af sig selv.
* Eleven gør selv det, der skal læres: vælger, forudsiger, noterer og regner.
  Valget kommer gerne før forklaringen, så fejlen bliver det, der lærer noget.
* I opgaver og quiz er de forkerte svarmuligheder de fejl, elever faktisk
  laver. Forklaringen kommer også ved et rigtigt svar, og et forkert svar giver
  et hint, der passer til fejlen.

**2. Brugervenlig.** Den skal kunne bruges, uden at man har læst noget.

* Det er tydeligt, hvad der kan gøres: det, der kan bruges, reagerer på musen,
  og målet lyser op, mens noget holdes.
* Fejl blokeres ikke, når det kan undgås. De får en konsekvens eller en
  forklaring.
* Tastaturgenveje og direkte links til faner (`index.html#salt`). Den virker,
  når den åbnes direkte fra harddisken.

**3. Overskuelig.** Én idé pr. mappe.

* Samme ramme hver gang: en toplinje med titel og knapper, en scene og et
  panel.
* Hver fane og hvert trin har én pointe, og det hele handler om det samme
  spørgsmål.

**4. Skarp.** Pointen kan siges i én sætning.

* Det, der ikke lærer noget, skæres væk, også når det er rigtigt
  (reaktivitetsmåleren i sc1.1, ascorbinsyrens pKs i sb2.4).
* Korte sætninger. Ingen tankestreger og intet talesprog. Ladning ±1 skrives
  som + og −, aldrig 1+ og 1−.

**5. Teoretisk velfunderet.** Modellen er ikke pynt.

* Det, eleven ser, er regnet af modellen: pH følger af ladningsbalancen
  (sb3.2), og farven i kolben følger mængden af Br₂ i zoomboblen (sc2.6). Det
  makroskopiske, partikelniveauet og symbolerne hænger sammen.
* Tallene har en kilde: Databogen, tabelværdier, rigtige kernemasser.
* Forenklinger er valgt med vilje, passer til niveauet (Kₒ hører ikke til
  C-niveau i sc2.7) og står i animationens README.

**6. Gerne lidt humoristisk.** Humoren gør det sjovt at blive og prøve igen,
men den må aldrig stå i vejen for pointen.

* Påskeæg belønner nysgerrighed, fx glasset, der knækker ved 4 : 2 i sc1.3.
* Kemichael er venlig i det, han gør, og sarkastisk i det, han siger.
  Sarkasmen rammer handlingen, aldrig eleven, og han forklarer ikke teori. Se
  `kemichael/README.md`.

## Superanimation

Et begreb set fra flere sider. Eleven arbejder med en model, ikke med en
opstilling.

* Op til fire faner om det samme spørgsmål, hver med sin pointe. Fanerne kan
  gå fra hverdag til kemi (sb2.0: trafikken over Lillebælt, rensdyr, torvet,
  N₂O₄) eller fra at bygge til at spille (sc1.1).
* Det, eleven har valgt, følger med fra fane til fane (saltet i sc2.1,
  opstillingen i sb3.2).
* Opgaver, et spil eller en ukendt prøve tjekker forståelsen, gerne i den
  sidste fane.
* Mappen er selvstændig og henter kun filer inde fra sig selv. Kommer
  Kemichael på besøg, hentes han fra `../../kemichael/`.
* Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og
  `nulstil()`, og kun den aktive fane kører. Kemien og tallene ligger for sig
  selv, adskilt fra tegningen.
* Mønster: `superanimation/sc1.1_atombygger` og
  `superanimation/sb3.2_titreringssimulator`.

## Superlab-animation

Et virtuelt laboratorieforsøg. Eleven udfører det selv, som i laboratoriet, og
kan lave de fejl, man kan lave dér.

* Én scene med en rigtig opstilling, fx glasudstyr, flasker med faremærker,
  vægt, varmeplade og affaldsdunk. Normalt ingen fanelinje.
* En intro-popup siger første gang, hvad forsøget undersøger, og hvad eleven
  skal gøre. Knappen Om forsøget åbner den igen.
* Forløbet står i panelet med trin og hint. Et trin er gjort, når bordets
  tilstand siger det, ikke når en knap er trykket.
* Frihed frem for afvisning: forkerte handlinger udføres og giver et uheld.
  Kemichael kommer, rydder op og siger noget sarkastisk. Kun det, der fysisk
  ikke kan lade sig gøre, afvises.
* Zoomboblen viser partikelniveauet i det glas, man kigger på.
* Resultatet afhænger af, hvordan forsøget er udført, og elevens svar tjekkes
  mod det, der faktisk skete, ikke mod en facitliste.
* Når forsøget er slut, låses quizzen og tegneserien over forsøget op.
  Resultatskemaet står i tegneseriens sidste rude.
* Nye superlab-animationer bygges på genstandsmodellen i `laboratoriet/`.
  Kemien er data i `stoftabel.js`, ikke kode i forsøget. Mønster:
  `superlab/sb2.4_ligevaegt/` og `laboratoriet/README.md`. Quiz, tegneserie
  og Kemichaels scener findes indtil videre i `superlab/sc6.8_substitution` og
  `superlab/sc8.6_jern_i_staaluld`.

## Det, der ikke er en animation

Animationerne ligger i `superanimation/` og `superlab/` (se oversigten). De to
andre mapper er fælles kode:

* `laboratoriet/` er motoren bag superlab-animationerne: stoffer, udstyr,
  bordet, forløbet og den fælles skal. Prøvebordet og prøverummet derinde er
  legeplads og testbænk.
* `kemichael/` er læreren, der går igen. Han er ikke en animation. Sig det ikke
  til ham.

Filer, der begynder med `_` (`_selvtest.html`, `_geometri.html`,
`_lav_sprites.js`), er udviklerværktøj og indgår ikke i animationerne.

## Fælles opbygning

* **Mappe:** en ny animation lægges i `superanimation/` eller `superlab/` efter
  sin slags. Stier ud af mappen har derfor to niveauer: `../../kemichael/`,
  `../../laboratoriet/`.
* **Navn:** `s`, niveau, kapitel og nummer og et kort navn uden æ, ø og å, fx
  `sc2.7_blyiodid`. Nummeret er emnet i samlingen (`samling_c2.html`).
* **Indgang:** `index.html`. Ingen `fetch` og ingen moduler, så den virker fra
  harddisken.
* **Filer:** `css/stil.css`, `js/` delt efter ansvar og `sprites/` med SVG.
* **README.md** i hver mappe: hvad den viser, filerne, hvad man kan rette i,
  forenklingerne og linjen til menuen.
* **`_selvtest.html`** tjekker det, man ikke kan se på et skærmbillede: at
  modellen rammer tabelværdierne, at forløbet kan gennemføres, og at sproget
  overholder reglerne.
* **Menuen:** en ny animation ligger kun i sin mappe, til brugeren siger til.
  Først da kommer den i samlingsfilerne og `FEEDBACK_EMNER`, og kolonnen
  "I menuen" i oversigten rettes.
* **Afløser** den en gammel enkeltfil, flyttes den gamle til `arkiv/` med
  `_oldversion` i navnet, men først når den nye kommer i menuen.

## Tjekliste før menuen

- [ ] Det er klart, om det er en superanimation eller en superlab-animation.
- [ ] Pointen kan siges i én sætning.
- [ ] En elev, der ikke har fået emnet gennemgået, kommer i gang uden hjælp.
- [ ] Eleven gør selv det, der skal læres.
- [ ] Fejl giver en konsekvens eller en forklaring, ikke en blokering.
- [ ] Det, eleven ser, er regnet af modellen, og tallene har en kilde.
- [ ] Forenklingerne er valgt med vilje og står i README.
- [ ] Quizzens forkerte svar er de fejl, elever faktisk laver.
- [ ] Sproget er kort og uden tankestreger, talesprog og 1+/1−.
- [ ] Humoren rammer handlingen, aldrig eleven.
- [ ] `_selvtest.html` er grøn, og siden virker fra harddisken.
- [ ] Brugeren har sagt, at den skal i menuen.

## Til den, der koder

Afgør først, om det er en superanimation eller en superlab-animation, og læs
README i mønsteret for den slags, før du begynder. Reglerne i `CLAUDE.md` i
roden af repoet gælder også her. Ret ikke i `laboratoriet/` eller `kemichael/`
uden at tjekke alle de animationer, der bruger dem.
