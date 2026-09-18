# Superanimationer

En superanimation er et lille, selvbærende læringsmiljø om ét centralt begreb
eller ét forsøg. Eleven kan bruge den alene. Den forudsætter ikke, at emnet er
gennemgået på tavlen først.

En almindelig animation er én HTML-fil, der viser én ting. En superanimation
lader eleven undersøge, prøve, fejle og forstå, og den bærer sin egen
forklaring med sig. Derfor bliver den for stor til én fil og får sin egen
mappe. Mappen er en følge af begrebet, ikke definitionen: en animation er ikke
super, fordi den er stor.

## De seks krav

**1. Selvbærende.** Eleven lærer ved at gøre, ikke ved at læse.

* En kort intro siger første gang, hvad der undersøges, og hvad eleven skal
  gøre. Rundvisningen bag `?` peger på ét element ad gangen på den fane, man
  står på.
* Et forløb med trin og hint viser vejen. Teorien ligger bag en knap og åbner
  aldrig af sig selv.
* Eleven gør selv det, der skal læres: vælger, forudsiger, noterer og regner.
  Valget kommer gerne før forklaringen (vand eller heptan i sc6.9, svovlsyre
  eller saltsyre i sc8.6), så fejlen bliver det, der lærer noget.
* Opgaver og quiz tjekker forståelsen. De forkerte svarmuligheder er de fejl,
  elever faktisk laver, forklaringen kommer også ved et rigtigt svar, og et
  forkert svar giver et hint, der passer til fejlen.

**2. Brugervenlig.** Den skal kunne bruges, uden at man har læst noget.

* Det er tydeligt, hvad der kan gøres: det, der kan bruges, reagerer på
  musen, og målet lyser op, mens noget holdes.
* Et trin er gjort, når tilstanden siger det, ikke når en knap er trykket. Et
  trin længere fremme tæller også, hvis det bliver opfyldt først.
* Frihed frem for afvisning: en forkert handling bliver ikke blokeret, den får
  en konsekvens (et uheld, en besked, et resultat, der ikke passer).
* Tastaturgenveje og direkte links til faner (`index.html#salt`). Den virker,
  når den åbnes direkte fra harddisken.

**3. Overskuelig.** Én idé pr. superanimation.

* Højst omkring fire faner. Alle handler om det samme spørgsmål, og hver har
  sin egen pointe. Det, eleven har valgt, følger med fra fane til fane
  (saltet i sc2.1, opstillingen i sb3.2).
* Samme ramme hver gang: en toplinje med titel, faner og knapper, en scene og
  et panel.
* Et laboratorieforsøg er ét forsøg og har normalt ingen fanelinje.

**4. Skarp.** Pointen kan siges i én sætning.

* Det, der ikke lærer noget, skæres væk, også når det er rigtigt
  (ascorbinsyrens pKs i sb2.4, reaktivitetsmåleren i sc1.1).
* Korte sætninger. Ingen tankestreger og intet talesprog. Ladning ±1 skrives
  som + og −, aldrig 1+ og 1−.

**5. Teoretisk velfunderet.** Modellen er ikke pynt.

* Det, eleven ser, er regnet af modellen: farven i kolben følger mængden af
  Br₂ i zoomboblen (sc2.6), pH følger af ladningsbalancen (sb3.2), og Le
  Chateliers princip følger af van 't Hoff (`laboratoriet/`). Det
  makroskopiske, partikelniveauet og symbolerne hænger sammen.
* Tallene har en kilde: Databogen, tabelværdier, rigtige kernemasser. Motoren
  opfinder ikke kemi, den ikke kender.
* Forenklinger er valgt med vilje, passer til niveauet (Kₒ hører ikke til
  C-niveau i sc2.7) og står i animationens README.
* Facit regnes af det, der står på bordet, i det øjeblik eleven svarer, ikke
  af en facitliste. Resultatet afhænger af, hvordan forsøget er udført.

**6. Gerne lidt humoristisk.** Humoren gør det sjovt at blive og prøve igen.

* Påskeæg og uheld belønner nysgerrighed: glasset, der knækker ved 4 : 2 i
  sc1.3, og morteren, der ikke er et trommesæt, i sc6.9.
* Kemichael er med i udvalgte superanimationer, mest laboratorieforsøgene. Han
  er venlig i det, han gør, og sarkastisk i det, han siger. Sarkasmen rammer
  handlingen, aldrig eleven, og han forklarer ikke teori. Se
  `kemichael/README.md`.
* Humoren må aldrig stå i vejen for pointen.

## To slags

| Slags | Kendetegn | Eksempler |
|-------|-----------|-----------|
| Begrebsværksted | Op til fire faner med hver sin vinkel på samme idé, fx fra hverdag til kemi (sb2.0) eller fra byggeri til spil (sc1.1). Eleven bygger, skruer og forudsiger. | sb2.0, sb3.2, sc1.1, sc2.1, sc2.2, sc3.1, sc3.2 |
| Laboratorieforsøg | Ét forsøg på en rigtig opstilling. Forløb og hint i panelet, zoomboble med partikelniveauet, uheld og Kemichael, en quiz, der låses op, når forsøget er gjort, og gerne en tegneserie bagefter. | sc1.3, sc2.5, sc2.6, sc2.7, sc6.8, sc6.9, sc8.6, sb2.4 |

sc3.2 er ikke aktiv. sb2.4 findes i to udgaver: `sb2.4_jernthiocyanat` er den,
menuen bruger, og `sb2.4_ligevaegt` er det samme forsøg bygget på den fælles
motor, stadig under opbygning.

## Det, der ikke er en superanimation

Mapperne, der begynder med `sb` eller `sc`, er superanimationer. Resten er
fælles kode og værktøj:

* `laboratoriet/` er motoren bag laboratorieforsøgene: stoffer, udstyr,
  bordet, forløbet og den fælles skal. Prøvebordet og prøverummet derinde er
  legeplads og testbænk.
* `kemichael/` er læreren, der går igen. Han er ikke en superanimation. Sig
  det ikke til ham.
* `Claude outputs/` er skærmbilleder fra arbejdet.
* Filer, der begynder med `_` (`_selvtest.html`, `_geometri.html`,
  `_lav_sprites.js`), er udviklerværktøj og indgår ikke i animationerne.

På sigt kan superanimationerne blive lagt et lag længere nede, så de fælles
mapper ikke forveksles med dem. Så skal stierne til `../laboratoriet/` og
`../kemichael/` og linkene i samlingerne (`../superanimationer/...`) følge med.

## Opbygning

* **Navn:** `s`, niveau, kapitel og nummer og et kort navn uden æ, ø og å, fx
  `sc2.7_blyiodid`. Nummeret er emnet i samlingen (`samling_c2.html`).
* **Indgang:** `index.html`. Ingen `fetch` og ingen moduler, så den virker fra
  harddisken.
* **Filer:** `css/stil.css`, `js/` delt efter ansvar og `sprites/` med SVG.
  Kemien og tallene ligger for sig selv, adskilt fra tegningen. I et
  begrebsværksted er hver fane et objekt med `tilpas()`, `opdater(dt)`,
  `tegn()` og `nulstil()`, og kun den aktive fane kører.
* **Laboratorieforsøg** henter `../laboratoriet/` og evt. `../kemichael/` og
  skal ligge ved siden af dem. Et nyt forsøg bygges på genstandsmodellen med
  al prosa i `js/tekst.js`. Mønster: `sb2.4_ligevaegt/`, se
  `laboratoriet/README.md`.
* **README.md** i hver mappe: hvad den viser (fane, hvad man gør, pointe),
  filerne, hvad man kan rette i, forenklingerne og linjen til menuen.
* **`_selvtest.html`** tjekker det, man ikke kan se på et skærmbillede: at
  modellen rammer tabelværdierne, at forløbet kan gennemføres, og at sproget
  overholder reglerne.
* **Afløser** den en gammel enkeltfil, flyttes den gamle til `arkiv/` med
  `_oldversion` i navnet.

## Tjekliste før menuen

- [ ] Pointen kan siges i én sætning, og hver fane har sin egen.
- [ ] En elev, der ikke har fået emnet gennemgået, kommer i gang uden hjælp.
- [ ] Eleven gør selv det, der skal læres.
- [ ] En forkert handling giver en konsekvens, ikke en blokering.
- [ ] Det, eleven ser, er regnet af modellen, og tallene har en kilde.
- [ ] Forenklingerne er valgt med vilje og står i README.
- [ ] Quizzens forkerte svar er de fejl, elever faktisk laver.
- [ ] Sproget er kort og uden tankestreger, talesprog og 1+/1−.
- [ ] Humoren rammer handlingen, aldrig eleven.
- [ ] `_selvtest.html` er grøn, og siden virker fra harddisken.

## Til den, der koder

Læs denne fil og README i den superanimation, der ligner mest, før du
begynder. Begrebsværksted: `sc1.1_atombygger` eller
`sb3.2_titreringssimulator`. Laboratorieforsøg: `laboratoriet/README.md` og
`sb2.4_ligevaegt/`. Quiz, tegneserie og Kemichaels scener findes indtil videre
i `sc6.8_substitution` og `sc8.6_jern_i_staaluld`.

Ret ikke i `laboratoriet/` eller `kemichael/` uden at tjekke alle de forsøg,
der bruger dem.
