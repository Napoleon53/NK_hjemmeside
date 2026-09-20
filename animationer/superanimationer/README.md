# Superanimationer

Denne mappe indeholder superanimationer og kun dem. En superanimation handler om
**ét begreb**. De virtuelle laboratorieforsøg, superlab-animationerne, handler om
**ét forsøg** og ligger ikke her. De gamle udgaver står i `../v2/superlab/` og
`../v2/superlab_ny/`, og nye bygges i `C:\NK_Undervisning\virtuelt_laboratorium\`.

Kravene til begge slags står i `../v2/README.md`. Den mappe er frosset, så denne
fil er superanimationernes egen udgave: alt, der gælder her, står her.

## De to slags

|  | Superanimation (her) | Superlab-animation (ikke her) |
|--|----------------------|-------------------------------|
| Handler om | ét begreb | ét forsøg |
| Eleven | bygger, skruer, forudsiger og spiller | udfører forsøget selv, trin for trin |
| Form | op til fire faner med hver sin vinkel på samme idé | én scene med en rigtig opstilling, normalt uden faner |
| Kode | selvstændig mappe med egen kerne | står på den fælles motor i `../v2/laboratoriet/` |
| Kemichael | kan komme på besøg | fast bestanddel |

Begge er selvbærende: eleven kan bruge dem alene, uden at emnet er gennemgået på
tavlen først. Det er det, der gør dem super, ikke at de er store eller ligger i
deres egen mappe.

## Grænsen til laboratoriet

En superanimation **må gerne** perspektivere til noget eksperimentelt. Det sker
flere steder og er helt i orden:

* `sc3.2_rumlig_opbygning` fane 4 er forsøget med vandstrålen, én fane ud af fire.
* `sc3.4_blandbarhed_inaktiv` hælder væsker i reagensglas og varmer en kolbe.
* `sc2.1_salt_i_vand` sætter bægerglasset på en varmeplade med termometer.
* `sb3.2_titreringssimulator` har en hel titreropstilling, man selv betjener.

Det afgørende er ikke, om der er glasudstyr på skærmen. Det afgørende er, hvad
animationen er bygget op om:

* **Superanimation:** begrebet styrer. Opstillingen er en model, eleven skruer på,
  og faner, opgaver og spil belyser den samme idé. Egen mappe, egen kerne.
* **Superlab-animation:** forsøget styrer. Eleven følger et forløb trin for trin,
  kan lave de fejl man kan lave i et rigtigt laboratorium, får uheld, oprydning og
  et resultat, der afhænger af udførelsen. Den bygges på den fælles motor.

Så `sb3.2` hører hjemme her, selv om fane 1 hedder Laboratoriet. Eleven arbejder
med titrerkurven som model gennem fire faner, ikke med ét forsøg fra ende til
anden. En animation, der derimod fører eleven gennem én laboratorieøvelse med
forløb, uheld og oprydning, hører ikke til i denne mappe.

## Udgangspunktet

En superanimation bliver til på en af to måder.

**1. Den forbedrer en eksisterende animation.** Så rummer den som udgangspunkt de
samme elementer som den gamle. Det, der er værd at tage med, tages med, og resten
bygges om. Den må gerne udvide, men udvidelsen skal være logisk sat op og tjene
det samme spørgsmål. Der er plads til at freestyle en smule, ikke til at skifte
emne. Hvad der er taget med, og hvad der er nyt, skrives i mappens egen README.

**2. Den bygges fra bunden**, fordi begrebet ikke havde en animation før. Det
gælder `sb2.0_ligevaegt_intro` og `sb3.2_titreringssimulator`.

Afløser den en gammel enkeltfil, flyttes den gamle til `arkiv/` med `_oldversion`
i navnet. Det sker først, når den nye kommer i menuen.

## Bestillingen, før der skrives kode

Erfaringen fra `sc3.4_blandbarhed_inaktiv`: en løs bestilling bliver til en for
stor animation. Den kom til at dække nabofilens forsøg, lånte superlabbens
flasker og uheld, og fik en fane om destillation, som er et andet emne. Skriv
derfor fem ting ned, før arbejdet går i gang.

1. **Pointen i én sætning.** For 3.4: "polariteten afgør, om der bliver ét lag
   eller to, og tætheden afgør kun rækkefølgen." Det, der ikke tjener sætningen,
   kommer ikke med.
2. **Hvad den afløser, og hvad der skal med.** Nævn de elementer fra den gamle,
   der virker, og det, den gamle gjorde godt rent visuelt.
3. **Naboerne, der ejer resten.** Fx: `c3.3` ejer elektronegativitet, og `c3.5`
   ejer forsøget med reagensglas. De røres ikke, og deres indhold kopieres ikke
   herind.
4. **Loftet, skrevet som tal.** Antal stoffer, antal faner og antal objekter på
   skærmen. En fane er en ny vinkel på den samme sætning, aldrig et nyt emne.
   Fire faner er et loft, ikke et mål: har begrebet to vinkler, er der to faner.
5. **Layoutet.** Er scenen stjernen i næsten hele billedet, som i den gamle 3.4,
   eller er det scene plus panel? Det afgøres før, ikke undervejs.

### Stop-listen

Er et af disse træk på vej ind, er det ved at blive en superlab-animation:
flasker man hælder med musen, et stativ med reagensglas, et affaldsglas, uheld
og oprydning, eller et forløb trin for trin. Stop, og spørg brugeren.

### Ved uklarhed

Er svaret på et spørgsmål uklart, så spørg igen med to konkrete muligheder, og
vælg den mindste af dem. Et uklart svar må aldrig blive til den store løsning.

### Udstyr tegnes som sprites først

Glasudstyr og flasker lægges som SVG i `sprites/` og vises for brugeren alene,
før de sættes i bevægelse. Mønster: `sc2.1_salt_i_vand`. Tegnes de i kode midt
inde i en simulation, opdages det sjuskede først til sidst.

## Oversigt

"I menuen" betyder, at en samlingsfil (`samling_*.html`) linker til mappen. En ny
animation kommer først i menuen, når brugeren siger til.

| Mappe | I menuen | Note |
|-------|----------|------|
| `sb2.0_ligevaegt_intro` | nej | den første superanimation, bygget fra bunden |
| `sb3.2_titreringssimulator` | ja | `samling_b3.html` |
| `sc1.1_atombygger` | ja | via genvejen `kemi-c-filer/c1.1_atommodel_ioner.html` |
| `sc2.1_salt_i_vand` | nej | menuen viser stadig den gamle c2.1 |
| `sc2.2_saltbygger` | nej | menuen viser stadig den gamle c2.2 |
| `sc3.1_elektronprikformler` | ja | `samling_c3.html` og `samling_NV.html` |
| `sc3.2_rumlig_opbygning` | nej | inaktiv: rettes ikke, før brugeren siger til |
| `sc3.4_blandbarhed_inaktiv` | nej | ny, sept. 2026; menuen viser stadig den gamle c3.4 |

## Fælles krav

**1. Selvbærende.** Eleven lærer ved at gøre, ikke ved at læse.

* Rundvisningen bag `?` peger på ét element ad gangen på den fane, man står på.
* Hints hører til den konkrete opgave og vises, når eleven sidder fast. Teorien
  ligger bag en knap og åbner aldrig af sig selv.
* Eleven gør selv det, der skal læres: vælger, forudsiger, noterer og regner.
  Valget kommer gerne før forklaringen, så fejlen bliver det, der lærer noget.
* I opgaver og quiz er de forkerte svarmuligheder de fejl, elever faktisk laver.
  Forklaringen kommer også ved et rigtigt svar, og et forkert svar giver et hint,
  der passer til fejlen.

**2. Brugervenlig.** Den skal kunne bruges, uden at man har læst noget.

* Det, der kan bruges, reagerer på musen, og målet lyser op, mens noget holdes.
* Fejl blokeres ikke, når det kan undgås. De får en konsekvens eller en forklaring.
* Tastaturgenveje og direkte links til faner (`index.html#salt`). Den virker, når
  den åbnes direkte fra harddisken.

**3. Overskuelig.** Én idé pr. mappe.

* Samme ramme hver gang: en toplinje med titel og knapper, en scene og et panel.
* Hver fane og hvert trin har én pointe, og det hele handler om det samme spørgsmål.

**4. Skarp.** Pointen kan siges i én sætning.

* Det, der ikke lærer noget, skæres væk, også når det er rigtigt.
* Korte sætninger. Ingen tankestreger og intet talesprog. Ladning ±1 skrives som
  + og −, aldrig 1+ og 1−.

**5. Teoretisk velfunderet.** Modellen er ikke pynt.

* Det, eleven ser, er regnet af modellen. pH følger af ladningsbalancen i `sb3.2`.
  Det makroskopiske, partikelniveauet og symbolerne hænger sammen.
* Tallene har en kilde: Databogen, tabelværdier, rigtige kernemasser.
* Forenklinger er valgt med vilje, passer til niveauet og står i animationens README.

**6. Gerne lidt humoristisk.** Humoren gør det sjovt at blive og prøve igen, men
den må aldrig stå i vejen for pointen.

* Påskeæg belønner nysgerrighed.
* Kemichael er venlig i det, han gør, og sarkastisk i det, han siger. Sarkasmen
  rammer handlingen, aldrig eleven, og han forklarer ikke teori. Se
  `../v2/kemichael/README.md`.

## Sådan er en superanimation skruet sammen

* Op til fire faner om det samme spørgsmål, hver med sin pointe. Fanerne kan gå
  fra hverdag til kemi (`sb2.0`: trafikken over Lillebælt, rensdyr, torvet, N₂O₄)
  eller fra at bygge til at spille (`sc1.1`).
* Det, eleven har valgt, følger med fra fane til fane: saltet i `sc2.1`,
  opstillingen i `sb3.2`.
* Opgaver, et spil eller en ukendt prøve tjekker forståelsen, gerne i sidste fane.
* Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og `nulstil()`, og
  kun den aktive fane kører. Kemien og tallene ligger for sig selv, adskilt fra
  tegningen.
* Mønster at læse først: `sc1.1_atombygger` og `sb3.2_titreringssimulator`.

## Fælles opbygning

* **Mappe:** en ny superanimation lægges her i `superanimationer/`. Stier ud af
  mappen har to niveauer: Kemichael hentes fra `../../v2/kemichael/`.
* **Navn:** `s`, niveau, kapitel og nummer og et kort navn uden æ, ø og å, fx
  `sc2.2_saltbygger`. Nummeret er emnet i samlingen (`samling_c2.html`).
* **Indgang:** `index.html`. Ingen `fetch` og ingen moduler, så den virker fra
  harddisken. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael.
* **Filer:** `css/stil.css`, `js/` delt efter ansvar og `sprites/` med SVG.
* **README.md** i hver mappe: hvad den viser, filerne, hvad man kan rette i,
  forenklingerne og linjen til menuen.
* **`_selvtest.html`** tjekker det, man ikke kan se på et skærmbillede: at modellen
  rammer tabelværdierne, at forløbet kan gennemføres, og at sproget overholder
  reglerne. Filer, der begynder med `_`, er udviklerværktøj og indgår ikke i
  animationen.
* **Menuen:** en ny animation ligger kun i sin mappe, til brugeren siger til. Først
  da kommer den i samlingsfilerne og `FEEDBACK_EMNER`, og kolonnen "I menuen" i
  oversigten rettes.

## Tjekliste før menuen

- [ ] Det er en superanimation, ikke et forsøg forklædt som en.
- [ ] Pointen kan siges i én sætning.
- [ ] Er den en afløser: de elementer, der var værd at beholde, er med.
- [ ] Udvidelserne tjener det samme spørgsmål.
- [ ] En elev, der ikke har fået emnet gennemgået, kommer i gang uden hjælp.
- [ ] Eleven gør selv det, der skal læres.
- [ ] Fejl giver en konsekvens eller en forklaring, ikke en blokering.
- [ ] Det, eleven ser, er regnet af modellen, og tallene har en kilde.
- [ ] Forenklingerne er valgt med vilje og står i mappens README.
- [ ] Quizzens forkerte svar er de fejl, elever faktisk laver.
- [ ] Sproget er kort og uden tankestreger, talesprog og 1+/1−.
- [ ] Humoren rammer handlingen, aldrig eleven.
- [ ] `_selvtest.html` er grøn, og siden virker fra harddisken.
- [ ] Brugeren har sagt, at den skal i menuen.

## Til den, der koder

Afgør først, om opgaven er en superanimation eller en superlab-animation. Er det
en superlab-animation, hører den ikke til i denne mappe. Læs README i mønsteret,
før du begynder. Reglerne i `CLAUDE.md` i roden af repoet gælder også her.
