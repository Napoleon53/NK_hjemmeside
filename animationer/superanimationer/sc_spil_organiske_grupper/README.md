# Organiske grupper (sc_spil_organiske_grupper)

Molekyler falder ned, og eleven trækker dem ned i spanden med den rigtige
stofklasse. Kategorien Spil. To udgaver i samme mappe:

| Udgave | Link | Stofklasser | Afløser |
|--------|------|-------------|---------|
| Kemi C | `index.html` (eller `#c`) | alkan, alken, alkyn, cycloalkan, aromat, alkohol, carboxylsyre | `kemi-c-filer/c_spil_organiske_grupper.html` |
| Kemi B | `index.html#b` | alkan, alkohol, carboxylsyre, aromat, amin, keton, aldehyd, ester | `kemi-c-filer/b_spil_organiske_grupper.html` (Organisk Sortering) |

Skiftet sker med linket, som i `sc_spil_jeopardy`. Der er ingen knap til at
skifte på siden, så C-menuen åbner C og B-menuen B.

## Bestillingen

1. **Pointen:** stofklassen ses på bindingerne mellem C-atomerne og på den
   funktionelle gruppe: dobbelt- og tripelbindinger, ring og benzenring (C), OH,
   COOH, NH₂, C=O for enden eller inde i kæden og COO mellem to C (B).
2. **Afløser og hvad der er med:** de to gamle spil. Med er det hele: molekylerne,
   der falder og trækkes i spandene (og tæller, hvis de falder rigtigt af sig selv),
   tre liv, 3 s stilstand efter et forkert molekyle, niveauer, der låser nye
   stofklasser op og rydder skærmen, turboniveauerne, katalysatoren (halve point
   for alt på skærmen), inhibitoren (7 s med 30 % fart, kan fjernes), +1 pause, én
   pause pr. spil, turboboost med fem tryk og de fem beskeder, hjælpelinjen de
   første 6 s af et nyt niveau, Stofgruppemester ved 14.000 point og den uendelige
   del bagefter, og i B den personlige rekord (uge og alle tider) og den fælles top
   10. Balancen er tal for tal den gamle (se nedenfor).
   Nyt: molekylerne tegnes af molekylemotoren som i bogen, gruppen, der afgør
   stofklassen, vises i spandens farve, når molekylet er sorteret, og et forkert
   molekyle giver et kort med gruppen og en linje, der passer til fejlen. En ny
   stofklasse kommer med et eksempel. Panelet viser det sidste molekyle med navn
   og stofklasserne, man har mødt. Kemichael, reglerne og stofklasserne bag knapper,
   rundvisningen og lyd.
3. **Naboerne:** `sc6.2_zigzagformler` ejer at læse og navngive zigzagformler og
   `tegnebraet` at tegne dem. Her er der kun genkendelse af stofklassen; navnet
   vises først, når molekylet er sorteret, fordi endelsen (-ol, -al, -on) ellers
   afslører svaret. Opløselighed hører til sc6.2 fane 4 og sc3.5.
4. **Loftet:** én side, ingen faner. Fem molekyler pr. stofklasse (C 35, B 40),
   højst fem spande ad gangen, ti niveauer som i de gamle.
5. **Layoutet:** scene plus panel. Scenen er de faldende molekyler og spandene,
   panelet er spillet (point, liv, niveau, knappen og turboboost), det sidste
   molekyle, stofklasserne og i B top 10.

## Balancen (de gamle spils tal)

Alle tal står i `js/data.js`, og selvtesten sammenligner dem med tallene fra de
gamle filer.

* Grundfart 70 enheder pr. s gange fart pr. niveau. C: 1,32 1,32 1,44 1,3 1,4, så
  turbo 1,55 1,70 1,85 2,00 2,15. B: 1,1 1,1 1,2 1,3 1,4, så samme turbo.
* Pointgrænser 0, 1000, 2500, 4500, 7000, 10000, 13500, 17500, 22000, 27000. 100
  point pr. molekyle.
* Et molekyle hvert 2,2 s minus 0,22 s pr. niveau (mindst 0,6 s), 1 s ekstra lige
  efter et nyt niveau, der glider ud over 5 s (turbo 1 s, første turbo 15 s).
  Farten glider fra 60 % til fuld over 10 s (turbo 2 s, første turbo 25 s). Hvert
  molekyle får 80 til 120 % af farten.
* Hjælpere fra niveau 2, første efter 20 s, så hvert 25. til 45. s, én ad gangen.
  Inhibitor med 80 % sandsynlighed, når der er to molekyler på skærmen; ellers +1
  pause med 20 % og ellers katalysator.
* Turboboost: +35 % pr. tryk i C og +25 % i B, 15 s hvert, højst fem.
* Efter 14.000 point: 10 % flere molekyler for hver 1000 point.

**Skærmen:** den gamle regnede i pixels op til 900 høj, så spillet var sværere på
en lav skærm. Nu er scenen altid 900 enheder høj (på en lav skærm ned til 640, og
så falder alt tilsvarende langsommere). Faldtiden er derfor den samme overalt,
den gamle på en stor skærm.

## Stofklasserne

Farverne er de gamle spils, bortset fra aldehyd i B, der er turkis i stedet for
lyserød, så den ikke ligner keton. "Aren" (C) og "aromater" (B) hedder nu aromat
begge steder, som molekylemotoren og resten af siden.

Molekylerne står som SMILES i `js/data.js`. Motoren giver navnet og stofklassen,
og selvtesten tjekker, at det er det, der står. C har de 16 fra den gamle plus
hexan, 2-methylpropan, but-2-en, pent-2-en, 2-methylpropen, but-2-yn, pent-1-yn,
pent-2-yn, cyclopentan, methylcyclohexan, ethylbenzen, propylbenzen,
1,4-dimethylbenzen, propan-1-ol, propan-2-ol, butan-1-ol, butansyre, pentansyre og
hexansyre. B har de 39 fra den gamle plus pentan-3-on. Toluen hedder
methylbenzen (toluen).

`js/kemi.js` finder gruppen i hvert molekyle: dobbelt- eller tripelbindingen, ringen,
C–O(H), C–N(H₂), C=O og COOH og C(=O)–O–C. En alkan har hele skelettet som gruppe.

**Forklaringen ved en fejl** står i `D.FORVEKSLING` for de typiske forvekslinger
(alken og aromat, aldehyd og keton, ester og keton, syre og alkohol). Findes parret
ikke, bruges den rigtige klasses kendetegn.

## Kemichael

Præsenterer spillet med tilbuddet Start præsentation / Nej tak (`js/praesentation.js`,
ens i alle superanimationer), én gang pr. udgave. Tre replikker i
`D.UDGAVER[..].intro`; på den anden peger han på spandene. Han kommer ellers kun ved
ny rekord og ved Stofgruppemester (`D.SLUT`), aldrig midt i et spil.

## Påskeægget

Fra niveau 3 falder der én gang pr. spil, sjældent, en kop kaffe. Klikkes den, er det
Kemichaels. Lander den i en spand, er kaffe ikke en stofklasse. Den koster intet.

## Top 10 (kun B)

Den gamle udgaves Google-regneark med Apps Script (opsætningen står i
`.claude/b_spil_organiske_grupper_HIGHSCORE_SETUP.txt`). Hver score over 0 sendes
med navnet fra feltet på startkortet. Den personlige rekord bruger de gamle nøgler
(`orgSortering_*`), så elevernes rekorder følger med. C har kun den personlige rekord,
fordi arket ikke kan skille C og B ad. Selvtesten sætter `NK.ingenNet`, så den aldrig
sender en score.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scene, panel, kortene, reglerne og rundvisningen |
| `css/stil.css` | grundreglerne fra Ion-Tetris plus kortene og panelet |
| `js/kerne.js` | fælles hjælpefunktioner (kopi fra Ion-Tetris) |
| `js/data.js` | stofklasserne, molekylerne, niveauerne, balancen og alle tekster |
| `js/kemi.js` | molekylerne fra molekylemotoren, gruppen og tegningerne |
| `js/topliste.js` | rekorderne og B's fælles top 10 |
| `js/spil.js` | ét spil: faldet, spandene, point, liv, niveauer, hjælperne (tegner ikke) |
| `js/tegning.js` | tegner scenen |
| `js/lyd.js` | små lyde lavet i koden (`NK.Spillyd`) |
| `js/laerer.js`, `js/praesentation.js`, `js/sprites.js` | Kemichael |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | udgaven, panelet, kortene, tasterne og tegneløkken |
| `_selvtest.html` | selvtesten |

Molekylerne tegnes af `../../molekylemotor/` (molekyle, navngivning, smiles, layout,
struktur). Retter man i motoren, skal denne selvtest også køres.

## Forenklinger

* Aldehydets H tegnes ikke; det er zigzagformlen, som i bogen. Aldehyd og keton
  skilles af, om C=O sidder for enden eller inde i kæden.
* Benzen tegnes med skiftevis dobbelt- og enkeltbindinger (som bogen og resten af
  siden), ikke med en cirkel som i den gamle C-udgave.
* En carboxylsyre og en ester har aldrig spand på samme tid i B (som i den gamle).

## Tastatur

Enter start eller fortsæt, P pause (bruger en pause), T turboboost, I fjern
inhibitor, S stofklasserne, R reglerne, H rundvisning, K Kemichael, M lyd, Esc luk.
Stofklasserne, reglerne og rundvisningen midt i et spil koster en pause.

## Test

`_selvtest.html` gennem en lokal server med `animationer/` som rod. Sidst: ALT OK
(25. sept. 2026).

## I menuen

I menuen fra 26. sept. 2026: Kemi C som spil.organiske (nr. 4) i
`kemi-c-filer/samling_c_spil.html`, Kemi B som `b.spil.organiske` (nr. 9) i
`kemi-b-filer/samling_b4,5,6.html` med `index.html#b`; begge i `FEEDBACK_EMNER`.
De gamle ligger i `kemi-c-filer/arkiv/c_spil_organiske_grupper_oldversion.html`
og `kemi-c-filer/arkiv/b_spil_organiske_grupper_oldversion.html`.
