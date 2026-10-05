# sc_spil1_pacman: Pacman Quiz

Et quizspil i en labyrint. Spørgsmålet står øverst, og svaret står på et skilt i
et af fire rum. Eleven løber ind i det rigtige rum, før spøgelserne fanger en.
Hører til kategorien Spil (`kemi-c-filer/samling_c_spil.html`). Afløser
`kemi-c-filer/c_spil_pacman_emner.html`.

## Bestillingen

1. **Pointen i én sætning.** Eleven repeterer Kemi C ved at løbe ind i rummet
   med det rigtige svar, før spøgelserne fanger en.
2. **Hvad den afløser.** `c_spil_pacman_emner.html`. Med er: labyrinten felt for
   felt, de fire svarrum med deres farver, de otte emner og Mix med de samme
   opgaver, de tre sværhedsgrader (Svær med præcis de samme tal), 3 liv pr. forløb,
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

Brugeren balancerede sværhedsgraderne i den gamle udgave i september 2026. 3. okt.
2026 bad brugeren om, at Let og Mellem blev lidt langsommere og mere tilgivende;
Svær må gerne være halvt umulig og har de gamle tal. Alle tal står i
`D.SVAERHED` i `js/data.js`. Selvtesten sammenligner Svær med den gamle fil og
tjekker, at Let og Mellem er mildere end den.

|  | Let | Mellem | Svær |
|--|-----|--------|------|
| Spøgelserne sover | 6 s (før 5) | 4 s (før 3) | 2,5 s |
| Et skridt hvert | 800 ms (før 667) | 500 ms (før 417) | 313 ms |
| Tilfældige skridt | 40 % (før 25) | 33 % (før 25) | 25 % |
| Fredet efter et mistet liv | 4 s (før 2) | 3 s (før 2) | 2 s |
| Nye spøgelser | nej | nej | hvert 5. s, op til 4 |
| Pause | så tit man vil | én i hvert spil | én i hvert spil |

Fælles: 3 liv pr. forløb, ét spøgelse i opgave 1 til 4 og to fra opgave 5, ét
spøgelse efter et mistet liv og skjold i 5 s.

**Pausen** (3. okt. 2026). Knappen Pause i toplinjen eller P stopper tiden;
Fortsæt, P eller Enter går videre. Spørgsmålet og svarene kan stadig læses, så
pausen er tænketid. Et spil er ét forløb gennem et emne; Prøv igen er et nyt spil
med en ny pause. Reglerne og rundvisningen stopper også spillet, så åbnes de midt
i en opgave, bruger de pausen, og er den brugt, åbner de først på kortet efter
opgaven. Ellers var de en gratis pause på Mellem og Svær. Skifter eleven faneblad,
står spillet stille uden at bruge pausen (browseren tegner ikke en skjult fane).

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

`c_spil8_escaperoom.html` har seglet "Segl 3 · Pacman Quiz". Svaret er
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
| `js/kerne.js` | fælles hjælpere (som i sc_spil3_jeopardy) og `NK.tal` til danske tal |
| `js/data.js` | **labyrinten, sværhedsgraderne** og Kemichaels replikker |
| `js/emner.js` | **opgavebanken**: emnerne, svarene og hintene |
| `js/spil.js` | reglerne, uden tegning |
| `js/tegning.js` | labyrinten, rummene, Pacman, spøgelserne og skjoldet på lærredet |
| `js/sprites.js` | lager til Kemichaels sprites |
| `js/laerer.js` | Kemichael præsenterer og kommer forbi til Labyrintmester |
| `js/praesentation.js` | tilbuddet Start præsentation / Nej tak (samme fil i alle mapper) |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/lyd.js` | baggrundsmusikken: henter loopet, spiller det uden hak og følger pausen |
| `js/app.js` | skærmene, knapperne, tastaturet og tegneløkken |
| `sprites/titel.svg` | titlen på startskærmen (egen tegning) |
| `musik/mellem.mp3` | musikken på Mellem: et loop på 73 s af *Retro Maze Chase* |
| `musik/svaer.mp3` | musikken på Svær: et loop på 143 s af *Matrix Clubbed to Death* |
| `musik/kilde/` | de hele sange fra Suno og `byg_loop.py`, der klipper loopene (bruges ikke af spillet) |
| `_selvtest.html` | balancen, reglerne, pausen, musikken, opgaverne, escaperoommet og sproget |

## Musikken

Brugeren laver musikken i Suno: orkestral big beat i stil med Clubbed to Death.
Mellem har *Retro Maze Chase* (lavet 3. okt. 2026 til Svær, flyttet til Mellem dagen
efter), og Svær har *Matrix Clubbed to Death*, som brugeren fandt passede bedre til
det sværeste niveau. Det er samme nummer, som Ionregn bruger (`Fast_music.mp3`). Let
får sin egen senere; en sværhedsgrad uden linje i `D.MUSIK` (`js/data.js`) har ingen
musik og ingen lydknap.

Musikken spiller under opgaverne og på kortet Rigtigt. Den står stille sammen med
spillet (pause, regler, rundvisning, skjult fane) og stopper på kortene Ingen liv
tilbage og Tillykke og på startskærmen. Højttaleren i toplinjen eller M slår den til
og fra, og valget huskes. Lydstyrken er `styrke` i `D.MUSIK`; Sværs sang er 1,8 dB
kraftigere end Mellems og står derfor lavere (0,33 mod 0,4), så de lyder lige højt.

**Mellem, Retro Maze Chase** (2:59, D-mol): tempoet er ca. 98,5 BPM og vandrer
mellem 98,2 og 98,7, altså ikke de 96, prompten bad om. De første 19,4 s er en
stille intro uden bas, ved 154 s kommer et break, og sangen toner ud til sidst. Fra
19,4 s kører temaet i 30 takter, og ved 92,6 s begynder sangen selv forfra på
temaet. Det stykke er loopet: 73,11 s.

**Svær, Matrix Clubbed to Death** (3:15, G-mol): tempoet er 144,02 BPM og ligger
fast (under 4 ms fra et fast gitter). De første 33,4 s er en intro uden rytme, så
skifter sangen mellem fulde og rolige stykker, og fra ca. 180 s slutter den med
enkelte slag. Loopet går fra rytmens indsats ved 33,42 s til 176,73 s: 86 takter,
143,31 s. De sidste to takter står på D (dominanten), og loopet begynder på G
(tonika), ligesom sangens eget oplæg til indsatsen står på D.

**Sådan er loopene bygget** (`musik/kilde/byg_loop.py`): sømmen ligger 10 ms før
loopets første slag, og loopets sidste 40 ms glider over i det, der i sangen ligger
lige før loopets start, så der ikke er noget knæk. Filen er periodisk: den begynder
0,5 s før loopet (med loopets slutning) og fortsætter 2 s efter det (med loopets
begyndelse). `js/lyd.js` lader Web Audio springe `laengde` tilbage, og fordi halen
er magen til begyndelsen, kan springet ikke høres, heller ikke når en browsers
mp3-afkoder forskyder lyden nogle millisekunder. En ny sang: mål de to slag 1, kør
`byg_loop.py` med kildefilen, den nye fil, de to tider og antallet af slag, og skriv
`start` og `laengde` fra den sidste linje ind i `D.MUSIK`. Tallene for de to sange
står øverst i scriptet.

Åbnes spillet fra harddisken (file://), kan filen ikke hentes til Web Audio. Så
spiller et almindeligt lydelement den, og springet tilbage kan give et lille hak.

**Spøgelserne går ikke i takt med musikken.** De tager et skridt efter spillets eget
ur (Svær 313 ms, Mellem 500 ms), og slagene i sangene er 417 ms (Svær) og 609 ms
(Mellem). Skal de gå i takt, skal skridtet i `js/spil.js` styres af musikkens ur, og
så ændres farten. Det er ikke gjort.

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
når de holdes nede. Enter går videre fra kortene og fra en pause. P er pause,
M er musikken, H eller ? er rundvisningen, K er Kemichael, og Esc lukker.

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
