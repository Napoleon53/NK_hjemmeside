# sc_spil_pacman: Pacman Quiz

Et quizspil i en labyrint. Spørgsmålet står øverst, og svaret står på et skilt i
et af fire rum. Eleven løber ind i det rigtige rum, før spøgelserne fanger en.
Hører til kategorien Spil (`kemi-c-filer/samling_c_spil.html`). Afløser
`kemi-c-filer/c_spil_pacman_emner.html`.

## Bestillingen

1. **Pointen i én sætning.** Eleven repeterer Kemi C ved at løbe ind i rummet
   med det rigtige svar, før spøgelserne fanger en.
2. **Hvad den afløser.** `c_spil_pacman_emner.html`. Med er: labyrinten felt for
   felt, de fire svarrum med deres farver, de otte emner og Mix med de samme
   opgaver, de tre sværhedsgrader med præcis de samme tal, 3 liv pr. forløb,
   forfra ved tabte liv, skjoldet, forklaringen efter hvert svar, konfettien og
   Labyrintmester til escaperoommet. Nyt: et hint til hver forkert
   svarmulighed, Kemichael, rundvisningen, reglerne med tallene, links, hukommelse
   over klarede emner og pile på en trykskærm.
3. **Naboerne.** Kemi-Millionær ejer quizzen med jokere, Jeopardy og Lykkehjulet
   ejer holdspillene på tavlen. Emnernes egne animationer ejer teorien; her er
   der kun korte forklaringer efter svaret.
4. **Loftet.** Én skærm uden faner. 9 emner, 3 sværhedsgrader, 4 rum, højst 4
   spøgelser og ét skjold pr. opgave.
5. **Layoutet.** Toplinje, spørgsmålet i en linje over labyrinten, labyrinten
   som scene, og kortene efter et svar midt på labyrinten.

## Balancen

Brugeren balancerede sværhedsgraderne i den gamle udgave i september 2026. Tallene
står i `js/data.js` og er de samme. Selvtesten sammenligner dem med den gamle fil.

|  | Let | Mellem | Svær |
|--|-----|--------|------|
| Spøgelserne sover | 5 s | 3 s | 2,5 s |
| Et skridt hvert | 667 ms | 417 ms | 313 ms |
| Nye spøgelser | nej | nej | hvert 5. s, op til 4 |

Fælles: 3 liv pr. forløb, ét spøgelse i opgave 1 til 4 og to fra opgave 5, ét
spøgelse efter et mistet liv, hvert fjerde skridt i gennemsnit tilfældigt,
skjold i 5 s, fredet i 2 s efter et mistet liv.

**Rækkefølgen er bevaret trin for trin** (`js/spil.js`), fordi den er en del af
balancen. I den gamle kode kørte resten af billedet videre med den gamle tid,
når et forkert rum nulstillede banen. Derfor sover spøgelserne efter et forkert
rum, til der er gået lige så lang tid, som opgaven havde varet, og på Svær kommer
der straks et spøgelse mere, hvis opgaven havde varet over 5 s. Det er beholdt.
Forskellen er, at nedtællingen nu viser, hvor længe de sover. Den gamle viste 3 s
og tav så. Skal det laves om, skal `opdater()` i `js/spil.js` stoppe lige efter
`this.forkert(rum)`.

Tre fejl i den gamle er rettet, fordi de ikke påvirker balancen:

* Et spøgelse kunne fange spilleren i samme billede, som det rigtige rum blev
  nået, og så forsvandt et liv bag kortet Rigtigt.
* Skjoldets tid talte billeder. På en skærm med 120 Hz varede det halvt så længe.
  Nu er det sekunder.
* Mix trak de samme 24 opgaver, til siden blev indlæst igen. Nu trækkes nye ved
  hvert forløb.

## Escaperoommet

`c_spil_escaperoom.html` har seglet "Segl 3 · Pacman Quiz". Svaret er
*labyrintmester*, og hintet siger: vælg SVÆR og Mix, og gennemfør hele forløbet.
Derfor må navnene **Pacman Quiz**, **Svær**, **Mix** og sætningen i
`D.MESTER.tekst` ikke ændres, uden at escaperoommet rettes med. Selvtesten læser
escaperoommet og tjekker, at de passer sammen. Kemichael kommer forbi, når nogen
bliver Labyrintmester, og mærket står på Mix i emnerne bagefter.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, spørgsmål, labyrint, kort, startskærm, regler og rundvisning |
| `css/stil.css` | alt udseende |
| `js/kerne.js` | fælles hjælpere (som i sc_spil_jeopardy) og `NK.tal` til danske tal |
| `js/data.js` | **labyrinten, sværhedsgraderne** og Kemichaels replikker |
| `js/emner.js` | **opgavebanken**: emnerne, svarene og hintene |
| `js/spil.js` | reglerne, uden tegning |
| `js/tegning.js` | labyrinten, rummene, Pacman, spøgelserne og skjoldet på lærredet |
| `js/sprites.js` | lager til Kemichaels sprites |
| `js/laerer.js` | Kemichael præsenterer og kommer forbi til Labyrintmester |
| `js/praesentation.js` | tilbuddet Start præsentation / Nej tak (samme fil i alle mapper) |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | skærmene, knapperne, tastaturet og tegneløkken |
| `sprites/titel.svg` | titlen på startskærmen (egen tegning) |
| `_selvtest.html` | balancen, reglerne, opgaverne, escaperoommet og sproget |

## Opgaverne

Samme emner og opgaver som i den gamle: 10 pr. emne, 32 grundstoffer og 24 i Mix
(3 fra hvert emne, trukket på ny hver gang). Ændret:

* Hver forkert svarmulighed har et hint til netop den fejl. Det står under
  spørgsmålet, når eleven har løbet ind i rummet, og rummet streges ud.
* De forkerte svar er fejl, elever laver: den glemte parentes i Ca(NO₃)₂,
  atomnummeret i stedet for atommassen, n · V i stedet for n / V, det glemte
  minus i pH. De meningsløse (HCl?, HCl??) er væk.
* Decimaltal skrives med komma og minus med −.
* Saltene spørger "Hvad er formlen for natriumchlorid?" i stedet for kun navnet.
* Svar og spørgsmål står i Tahoma, der har tværstreger på stort I, så CaI₂ ikke
  kan læses som Cal₂.

Et nyt emne: skriv et objekt med `titel`, `beskrivelse`, `niveauer` og `lav` i
`js/emner.js`, og sæt nøglen ind i `ORDEN`. Mix tager det med af sig selv.

## Forenklinger

* Molarmasserne regnes med afrundede atommasser (H 1, C 12, O 16, Na 23,
  Cl 35,5, Fe 55,8), som i den gamle.
* I mængdeberegningen er M i m = n · M valgt, så tallene går op (fx M = 10 g/mol).
* Bindingstypen afgøres af ΔEN alene: under 0,4 upolær, 0,4 til 1,7 polær, over
  1,7 ionbinding (Paulings værdier).

## Styring og links

Piletasterne eller W, A, S og D flytter ét felt. Holdes tasten nede, gentager
tastaturet den. På en trykskærm er der pile under labyrinten, som også gentager,
når de holdes nede. Enter går videre fra kortene. H eller ? er rundvisningen,
K er Kemichael, og Esc lukker.

`index.html#svaer` vælger Svær. `index.html#svaer&mix` starter Mix på Svær, og
det samme gælder de andre emner (`grundstoffer`, `ioner`, `maengde`, `oplosning`,
`syrebase`, `binding`, `organisk`, `redox`).

## I menuen

I menuen fra 26. sept. 2026 som spil.pacman (nr. 1) i
`kemi-c-filer/samling_c_spil.html`. Den gamle ligger i
`kemi-c-filer/arkiv/c_spil_pacman_emner_oldversion.html`. Selvtesten finder den
gamle fil i arkivet.

## Tilbuddet om præsentationen

Første gang står der Start præsentation og Nej tak midt foroven på startskærmen.
Kemichael siger tre korte linjer og peger på valgene, mens startskærmen rykker til
højre for at give ham plads. Han kommer aldrig, mens der spilles. Et spil, der går
i gang, er det samme som Nej tak. Koden er `js/praesentation.js` koblet med
`NK.Praesentation.kobl` i `js/laerer.js`.
