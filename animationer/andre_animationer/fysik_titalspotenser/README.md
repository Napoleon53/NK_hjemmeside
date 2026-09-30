# Tierpotenser og forstavelser (fysik)

Øveanimation til fysik om 10-talspotenser, forstavelser og omregning mellem
enheder. Bestilt af fysiklæreren, sept. 2026: *"et spil hvor eleverne skal
omskrive og anvende 10-talspotenser og præfiks. Altså kunne skrive 10^4 m og til
10000 m og skrive at det bliver 10 km ... fra gerne fra 10^-9 til 10^9. Desuden
kan vi også godt have brug for at øve omregning mellem L og ml, mm, cm og m.
samt cm^2 til m^2 og cm^3 til m^3 og omvendt."*

Ligger i `andre_animationer/`, som ikke er linket fra nogen side. Adressen er
`https://kemiformler.dk/animationer/andre_animationer/fysik_titalspotenser/`
og kan deles direkte.

## Bestillingen

1. **Pointen i én sætning.** En tierpotens, en forstavelse og en enhed er tre
   måder at skrive den samme størrelse på, og man skifter mellem dem ved at
   flytte kommaet.
2. **Hvad den bygger på.** Motoren fra kemiens `sc4.10_betydende_cifre`: tal
   regnet på cifferstrenge, cifrene som brikker på en tavle, kommaet der hopper
   plads for plads, en runde på ti opgaver, og en besked pr. typisk fejl uden
   facit i. Selve indholdet (betydende cifre, afrunding) er ikke med.
3. **Naboerne.** Kemiens `sc4.10` ejer betydende cifre og afrunding. Her
   afrundes der aldrig, og der tælles aldrig betydende cifre.
4. **Loftet.** Fire faner, én tavle, én stige, ti forstavelser, tolv
   enhedsfamilier.
5. **Layoutet.** Scene plus panel. Scenen er delt i tre: arbejdet med tavlen
   øverst, stigen forneden og statuslinjen nederst.

## De fire faner

| Fane | Indhold |
|------|---------|
| 1 Tierpotenser | `10⁴ m` til `10 000 m` og tilbage. Tre valg: begge veje, potens til tal, tal til potens. Eksponenter fra −9 til 9. |
| 2 Forstavelser | **Vælg forstavelsen:** `10 000 m = 10 ⬚m`, eleven klikker på forstavelsen. **Forstavelse til potens:** `1 GW` er hvor mange `W`, skrevet som 10-talspotens. |
| 3 Omregning | Fire niveauer: Længde og liter (km, m, dm, cm, mm, L, dL, cL, mL) · Masse, tid og el (kg, g, mg, µg, s, ms, µs, ns, W, J, N, Hz, V, A) · Arealer (km², m², dm², cm², mm²) · Rumfang (m³, dm³, cm³, mm³ sammen med L, mL og µL). |
| 4 Blandet | Ti opgaver af alle slags. Rekorden gemmes. |

Man kan linke direkte til en fane med `#potens`, `#forstavelse`, `#omregn` og
`#blandet`.

## Det, animationen gør anderledes end kemiens

* **Ingen Kemichael.** Han er kemilærer, og mappen henter ingen filer uden for
  sig selv. Al hjælp står i **statuslinjen** nederst i scenen med den ene store
  knap til højre, som i `sc1.4_afstemning` (brugerens valg 30. sept. 2026).
* **Hintet er en trappe på tre trin**, ét pr. tryk, og først derefter bliver
  knappen til Vis svaret. Knappen lyser stille op efter et forkert svar og
  holder op, når hintet er givet.
* **Stigen** forneden er en akse fra 10⁻⁹ til 10⁹ med forstavelserne under.
  Ét trin er én plads for kommaet, og **en enhed står ved sin egen
  tierpotens**: cm² står fire trin fra m², og mm² står ved 10⁻⁶. Derfor er
  afstanden på aksen altid lige så mange pladser, som kommaet skal flyttes.
  Forstavelsernes tierpotenser er skjulte, til eleven har fået hint 2 eller
  svaret: stigen er et kort under opgaven og en tabel bagefter.
* **deka og hekto** står på stigen og i teorien, men bliver aldrig spurgt om.
  De bruges næsten ikke i fysik.

## Filerne

| Fil | Indhold |
|-----|---------|
| `js/kerne.js` | Fælles hjælpefunktioner (hævet skrift, lærred, localStorage). Samme fil som i superanimationerne, uden positurerne. |
| `js/tal.js` | Modellen: tal som cifferstrenge, forstavelserne, enhedsfamilierne, opgaverne, tjekket, hintene og svarene. Ingen DOM. |
| `js/data.js` | Fanerne, runden og de faste sætninger. |
| `js/stige.js` | Stigen på lærredet forneden. |
| `js/fane.js` | Én fane: runden, tavlen, svaret, statuslinjen og panelet. |
| `js/app.js` | Faneskift, tastatur, svarfelt og tegneløkke. |
| `js/rundvisning.js` | Spotlight-rundvisningen bag `?`. |
| `_selvtest.html` | Udviklerværktøj. Indgår ikke i animationen og kan slettes. |

Ingen build, ingen fetch: mappen virker også, når `index.html` åbnes direkte
fra harddisken.

## Selvtest

`_selvtest.html` åbner `index.html` i en iframe og kontrollerer det, man ikke kan
se på et skærmbillede: at omregningerne regner rigtigt, at alle opgaver har et
gyldigt facit, at de typiske fejl får den rigtige besked, at hintet altid har tre
trin, at en hel runde kan gennemføres på alle fire faner, og at stigens afstand
svarer til antallet af pladser, kommaet skal flyttes. Kræver en lokal server
(en iframe på `file://` afvises af browseren).
